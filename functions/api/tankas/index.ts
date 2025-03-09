import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import type { Bindings, Tanka } from '../../types'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  try {
    const db = c.env.DB as D1Database
    const { results } = await db.prepare(`
      SELECT 
        t.*,
        u.display_name,
        u.clerk_id
      FROM tankas t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC 
      LIMIT 20
    `).all<Tanka & { display_name: string, clerk_id: string }>()
    
    return c.json({ tankas: results })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// 短歌投稿
app.post('/', async (c) => {
  try {
    const { content, clerk_id } = await c.req.json()
    
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

export default app 
