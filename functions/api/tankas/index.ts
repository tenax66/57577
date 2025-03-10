import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import type { Bindings, Tanka } from '../../types'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const per_page = 10
    const offset = (page - 1) * per_page

    // 現在のページの短歌を取得
    const { results } = await c.env.DB.prepare(`
      SELECT 
        t.*,
        u.display_name,
        u.clerk_id
      FROM tankas t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `)
    .bind(per_page + 1, offset) // 次のページがあるか確認するため1つ多めに取得
    .all<Tanka & { display_name: string, clerk_id: string }>()
    
    const hasNextPage = results.length > per_page
    const tankas = results.slice(0, per_page) // 表示は`per_page`件まで
    
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

export default app 
