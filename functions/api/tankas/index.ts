import { Hono } from 'hono';
import type { Bindings, TankaWithLikes } from '../../types';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { D1Database } from '@cloudflare/workers-types';
const app = new Hono<{ Bindings: Bindings }>();

// トークン分割用のセグメンター
const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });

app.get('/', async c => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const per_page = 10;
    const offset = (page - 1) * per_page;
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

    // 短歌とライク情報を取得
    const { results } = await c.env.DB.prepare(
      `
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
    `
    )
      .bind(...(dbUserId ? [dbUserId, per_page + 1, offset] : [per_page + 1, offset]))
      .all<TankaWithLikes>();

    const hasNextPage = results.length > per_page;
    const tankas = results.slice(0, per_page);

    return c.json({
      tankas,
      pagination: {
        current_page: page,
        has_next: hasNextPage,
      },
    });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 短歌投稿 - 認証必須
app.post('/', clerkMiddleware(), async c => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { content } = await c.req.json();

    // 文字数チェックを追加
    if (!content || content.length > 150) {
      return c.json({ error: '短歌は1文字以上150文字以下で入力してください' }, 400);
    }

    // clerk_idはリクエストボディからではなく、認証情報から取得
    const clerk_id = auth.userId;

    // ユーザーIDの取得
    const { results } = await c.env.DB.prepare('SELECT id FROM users WHERE clerk_id = ?')
      .bind(clerk_id)
      .all<{ id: number }>();

    if (results.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user_id = results[0].id;

    const response = await c.env.DB.prepare('INSERT INTO tankas (content, user_id) VALUES (?, ?)')
      .bind(content, user_id)
      .run();

    if (!response.success) throw new Error('Failed to insert tanka');

    // 全文検索用の処理を関数呼び出しに変更
    await indexContentForSearch(c.env.DB, response.meta.last_row_id, content);

    return c.json({ message: 'Created' }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 全文検索用のトークン化と保存を行う関数
async function indexContentForSearch(db: D1Database, rowId: number, content: string) {
  // Intl.Segmenter を利用して、受け取ったデータからトークンを抽出する
  const segments = Array.from(segmenter.segment(`${content}`))
    .filter(s => s.isWordLike)
    .map(s => s.segment);

  // 作成したトークンをスペース区切りで結合し、fts テーブルに追加する
  await db
    .prepare('INSERT INTO fts (rowid, segments) VALUES (?1, ?2)')
    .bind(rowId, segments.join(' '))
    .run();
}

app.get('/:id', async c => {
  try {
    const tankaId = c.req.param('id');
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

    // 短歌とライク情報を取得
    const { results } = await c.env.DB.prepare(
      `
      SELECT 
        t.*,
        u.display_name,
        u.clerk_id,
        COUNT(l.id) as likes_count,
        ${dbUserId ? 'EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND tanka_id = t.id) as is_liked' : 'FALSE as is_liked'}
      FROM tankas t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN likes l ON t.id = l.tanka_id
      WHERE t.id = ?
      GROUP BY t.id
    `
    )
      .bind(...(dbUserId ? [dbUserId, tankaId] : [tankaId]))
      .all<TankaWithLikes>();

    if (results.length === 0) {
      return c.json({ error: 'Tanka not found' }, 404);
    }

    return c.json({ tanka: results[0] });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// いいねを追加/削除するエンドポイント
app.post('/:id/likes', clerkMiddleware(), async c => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tankaId = c.req.param('id');

    // ユーザーIDの取得
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT id FROM users WHERE clerk_id = ?'
    )
      .bind(auth.userId)
      .all<{ id: number }>();

    if (userResults.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userId = userResults[0].id;

    // いいねの存在確認
    const { results: likeResults } = await c.env.DB.prepare(
      'SELECT id FROM likes WHERE user_id = ? AND tanka_id = ?'
    )
      .bind(userId, tankaId)
      .all();

    if (likeResults.length > 0) {
      // いいねが存在する場合は削除
      await c.env.DB.prepare('DELETE FROM likes WHERE user_id = ? AND tanka_id = ?')
        .bind(userId, tankaId)
        .run();

      return c.json({ liked: false });
    } else {
      // いいねが存在しない場合は追加
      await c.env.DB.prepare('INSERT INTO likes (user_id, tanka_id) VALUES (?, ?)')
        .bind(userId, tankaId)
        .run();

      return c.json({ liked: true });
    }
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// いいねの状態を取得するエンドポイント
app.get('/:id/likes/status', clerkMiddleware(), async c => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tankaId = c.req.param('id');

    // ユーザーIDの取得
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT id FROM users WHERE clerk_id = ?'
    )
      .bind(auth.userId)
      .all<{ id: number }>();

    if (userResults.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userId = userResults[0].id;

    // いいねの存在確認
    const { results: likeResults } = await c.env.DB.prepare(
      'SELECT id FROM likes WHERE user_id = ? AND tanka_id = ?'
    )
      .bind(userId, tankaId)
      .all();

    return c.json({ liked: likeResults.length > 0 });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// いいね数を取得するエンドポイント
app.get('/:id/likes/count', async c => {
  try {
    const tankaId = c.req.param('id');

    const { results } = await c.env.DB.prepare(
      `
      SELECT COUNT(*) as count
      FROM likes
      WHERE tanka_id = ?
    `
    )
      .bind(tankaId)
      .all<{ count: number }>();

    return c.json({ count: results[0].count });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 短歌削除API
app.delete('/:id', clerkMiddleware(), async c => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tankaId = c.req.param('id');

    // 短歌の所有者を確認
    const { results } = await c.env.DB.prepare(
      `
        SELECT t.id 
        FROM tankas t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ? AND u.clerk_id = ?
      `
    )
      .bind(tankaId, auth.userId)
      .all();

    if (results.length === 0) {
      return c.json({ error: 'Unauthorized or tanka not found' }, 404);
    }

    // 短歌を削除
    await c.env.DB.prepare('DELETE FROM tankas WHERE id = ?').bind(tankaId).run();

    // 全文検索用のテーブルからもデータを削除する
    await c.env.DB.prepare('DELETE FROM fts WHERE rowid = ?').bind(tankaId).run();

    return c.json({ message: 'Tanka deleted successfully' });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app;
