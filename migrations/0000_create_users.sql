CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,  -- Clerk のユーザーID
  display_name TEXT,
  avatar_url TEXT,      -- Clerk のプロフィール画像URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- トリガーを作成して updated_at を自動更新
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- テスト用のダミーユーザー
INSERT INTO users (clerk_id, display_name) VALUES 
('dummy_clerk_id_1', 'テストユーザー1'),
('dummy_clerk_id_2', 'テストユーザー2'); 
