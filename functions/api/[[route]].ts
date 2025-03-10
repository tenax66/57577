import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/backend'
import tankaRoutes from './tankas'
import type { Bindings, User, Tanka} from '../types'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/health-check', (c) => {
  return c.json({
    message: 'Hello',
  })
})

// 短歌関連のルートをマウント
app.route('/api/tankas', tankaRoutes)

// Webhookエンドポイント
app.post('/api/webhooks/clerk', async (c) => {
  try {
    // リクエストヘッダーの検証
    const svix_id = c.req.header('svix-id')
    const svix_timestamp = c.req.header('svix-timestamp')
    const svix_signature = c.req.header('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return c.json({ error: 'Missing svix headers' }, 400)
    }

    // リクエストボディの取得
    const payload = await c.req.json()
    const body = JSON.stringify(payload)

    // Webhookの検証
    const wh = new Webhook(c.env.CLERK_WEBHOOK_SECRET)
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent

    // イベントタイプに応じた処理
    switch (evt.type) {
      case 'user.created': {
        const { id: clerk_id, image_url } = evt.data

        // ユーザーをD1に保存
        const { success } = await c.env.DB.prepare(`
          INSERT INTO users (clerk_id, display_name, avatar_url)
          VALUES (?, ?, ?)
        `)
        .bind(
          clerk_id,
          'ユーザー',
          image_url || null
        )
        .run()

        if (!success) {
          throw new Error('Failed to insert user')
        }

        return c.json({ message: 'User created successfully' }, 201)
      }

      case 'user.updated': {
        const { id: clerk_id, image_url } = evt.data

        // ユーザー情報を更新
        const { success } = await c.env.DB.prepare(`
          UPDATE users 
          SET avatar_url = ?
          WHERE clerk_id = ?
        `)
        .bind(
          image_url || null,
          clerk_id
        )
        .run()

        if (!success) {
          throw new Error('Failed to update user')
        }

        return c.json({ message: 'User updated successfully' })
      }

      case 'user.deleted': {
        const { id: clerk_id } = evt.data

        // ユーザーを削除
        const { success } = await c.env.DB.prepare('DELETE FROM users WHERE clerk_id = ?')
          .bind(clerk_id)
          .run()

        if (!success) {
          throw new Error('Failed to delete user')
        }

        return c.json({ message: 'User deleted successfully' })
      }

      default:
        return c.json({ message: 'Webhook received' })
    }
  } catch (e) {
    console.error('Webhook error:', e)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// ユーザー情報取得API
app.get('/api/users/:clerk_id', async (c) => {
  try {
    const clerk_id = c.req.param('clerk_id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM users WHERE clerk_id = ?'
    )
    .bind(clerk_id)
    .all<User>()

    if (results.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user: results[0] })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// ユーザーの短歌一覧取得API
app.get('/api/users/:clerk_id/tankas', async (c) => {
  try {
    const clerk_id = c.req.param('clerk_id')
    
    // まずユーザーIDを取得
    const { results: users } = await c.env.DB.prepare(
      'SELECT id FROM users WHERE clerk_id = ?'
    )
    .bind(clerk_id)
    .all<{ id: number }>()

    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    // ユーザーの短歌を取得
    const { results: tankas } = await c.env.DB.prepare(
      'SELECT * FROM tankas WHERE user_id = ? ORDER BY created_at DESC'
    )
    .bind(users[0].id)
    .all<Tanka>()

    return c.json({ tankas })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// ユーザー情報更新API
app.patch('/api/users/:clerk_id', clerkMiddleware(), async (c) => {
  const auth = getAuth(c)
  const clerk_id = c.req.param('clerk_id')

  // 自分のデータのみ更新可能
  if (!auth?.userId || auth.userId !== clerk_id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { display_name } = await c.req.json()
    
    // 文字数チェックを追加
    if (!display_name || display_name.length > 30) {
      return c.json({ error: 'ユーザー名は1文字以上30文字以下で入力してください' }, 400)
    }

    const { success } = await c.env.DB.prepare(`
      UPDATE users 
      SET display_name = ?
      WHERE clerk_id = ?
    `)
    .bind(display_name, clerk_id)
    .run()

    if (!success) {
      throw new Error('Failed to update user')
    }

    return c.json({ message: 'User updated successfully' })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export const onRequest = handle(app)
