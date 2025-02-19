import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  CLERK_SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 型定義
type Tanka = {
  id: number
  content: string
  user_id: string
  created_at: string
}

app.get('/api', (c) => {
  return c.json({
    message: 'Hello',
  })
})

app.get('/api/tankas', async (c) => {
  try {
    const db = c.env.DB as D1Database
    const { results } = await db.prepare(
      'SELECT * FROM tankas ORDER BY created_at DESC LIMIT 20'
    ).all<Tanka>()
    
    return c.json({ tankas: results })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// 短歌投稿
app.post('/api/tankas', async (c) => {
  try {
    const { content } = await c.req.json()
    
    // TODO: 認証機能実装後にuser_idを動的に設定
    const user_id = 'dummy_user1'
    
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

export const onRequest = handle(app)
