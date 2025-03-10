import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import type { Bindings, Tanka } from '../../types'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

const app = new Hono<{ Bindings: Bindings }>()

// 既存のコードの中で、tankaの型を更新
type TankaWithLikes = Tanka & {
  display_name: string
  clerk_id: string
  likes_count: number
  is_liked: boolean
}

app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const per_page = 10
    const offset = (page - 1) * per_page
    const auth = getAuth(c)
    const userId = auth?.userId

    // ユーザーIDの取得（ログインしている場合）
    let dbUserId: number | null = null
    if (userId) {
      const { results } = await c.env.DB.prepare(
        'SELECT id FROM users WHERE clerk_id = ?'
      )
      .bind(userId)
      .all<{ id: number }>()
      if (results.length > 0) {
        dbUserId = results[0].id
      }
    }

    // 短歌とライク情報を取得
    const { results } = await c.env.DB.prepare(`
      SELECT 
        t.*,
        u.display_name,
        u.clerk_id,
        COUNT(l.id) as likes_count,
        ${dbUserId ? 'EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND tanka_id = t.id) as is_liked' : 'FALSE as is_liked'}
      FROM tankas t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN likes l ON t.id = l.tanka_id
      GROUP BY t.id
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `)
    .bind(...(dbUserId ? [dbUserId, per_page + 1, offset] : [per_page + 1, offset]))
    .all<TankaWithLikes>()
    
    const hasNextPage = results.length > per_page
    const tankas = results.slice(0, per_page)
    
    return c.json({ 
      tankas,
      pagination: {
        current_page: page,
        has_next: hasNextPage
      }
    })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// 短歌投稿 - 認証必須
app.post('/', clerkMiddleware(), async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { content } = await c.req.json()
    
    // clerk_idはリクエストボディからではなく、認証情報から取得
    const clerk_id = auth.userId
    
    // ユーザーIDの取得
    const { results } = await c.env.DB.prepare(
      'SELECT id FROM users WHERE clerk_id = ?'
    )
    .bind(clerk_id)
    .all<{ id: number }>()

    if (results.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const user_id = results[0].id
    
    const { success } = await c.env.DB.prepare(
      'INSERT INTO tankas (content, user_id) VALUES (?, ?)'
    )
    .bind(content, user_id)
    .run()

    if (!success) throw new Error('Failed to insert tanka')
    
    return c.json({ message: 'Created' }, 201)
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(`
      SELECT 
        t.*,
        u.display_name,
        u.clerk_id
      FROM tankas t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `)
    .bind(id)
    .all<Tanka & { display_name: string, clerk_id: string }>()

    if (results.length === 0) {
      return c.json({ error: 'Tanka not found' }, 404)
    }

    return c.json({ tanka: results[0] })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// いいねを追加/削除するエンドポイント
app.post('/:id/likes', clerkMiddleware(), async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const tankaId = c.req.param('id')
    
    // ユーザーIDの取得
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT id FROM users WHERE clerk_id = ?'
    )
    .bind(auth.userId)
    .all<{ id: number }>()

    if (userResults.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const userId = userResults[0].id

    // いいねの存在確認
    const { results: likeResults } = await c.env.DB.prepare(
      'SELECT id FROM likes WHERE user_id = ? AND tanka_id = ?'
    )
    .bind(userId, tankaId)
    .all()

    if (likeResults.length > 0) {
      // いいねが存在する場合は削除
      await c.env.DB.prepare(
        'DELETE FROM likes WHERE user_id = ? AND tanka_id = ?'
      )
      .bind(userId, tankaId)
      .run()
      
      return c.json({ liked: false })
    } else {
      // いいねが存在しない場合は追加
      await c.env.DB.prepare(
        'INSERT INTO likes (user_id, tanka_id) VALUES (?, ?)'
      )
      .bind(userId, tankaId)
      .run()
      
      return c.json({ liked: true })
    }
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default app 
