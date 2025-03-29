import { Hono } from 'hono';
import type { Bindings, TankaWithLikes } from '../../types';
import { getAuth } from '@hono/clerk-auth';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async c => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const per_page = 10;
    const offset = (page - 1) * per_page;
    const period = c.req.query('period') || 'all'; // all, week, month
    const auth = getAuth(c);
    const userId = auth?.userId;

    // ユーザーIDの取得（ログインしている場合）
    let dbUserId: number | null = null;
    if (userId) {
      const { results } = await c.env.DB.prepare('SELECT id FROM users WHERE clerk_id = ?')
        .bind(userId)
        .all<{ id: number }>();
      if (results.length > 0) {
        dbUserId = results[0].id;
      }
    }

    // 期間に応じたWHERE句を設定
    let whereClause = '';
    if (period === 'week') {
      whereClause = 'WHERE t.created_at >= datetime("now", "-7 days")';
    } else if (period === 'month') {
      whereClause = 'WHERE t.created_at >= datetime("now", "-30 days")';
    }

    // 短歌の総数を取得
    const { results: countResult } = await c.env.DB.prepare(
      `SELECT COUNT(DISTINCT t.id) as count 
       FROM tankas t 
       LEFT JOIN likes l ON t.id = l.tanka_id 
       ${whereClause}`
    ).all<{ count: number }>();

    const total = countResult[0].count;

    // いいね数でランキングされた短歌を取得
    const { results } = await c.env.DB.prepare(
      `
      SELECT
        t.id,
        t.content,
        t.user_id,
        t.created_at,
        u.display_name,
        u.clerk_id,
        COUNT(l.id) as likes_count,
        ${dbUserId ? 'EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND tanka_id = t.id) as is_liked' : 'FALSE as is_liked'}
      FROM tankas t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN likes l ON t.id = l.tanka_id
      ${whereClause}
      GROUP BY t.id
      HAVING likes_count > 0
      ORDER BY likes_count DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `
    )
      .bind(...(dbUserId ? [dbUserId, per_page, offset] : [per_page, offset]))
      .all<TankaWithLikes>();

    return c.json({
      tankas: results,
      pagination: {
        current_page: page,
        has_next: offset + results.length < total,
      },
    });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app; 
