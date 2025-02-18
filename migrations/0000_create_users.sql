CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Google Auth のユーザーID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  profile TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- テスト用のダミーユーザー
INSERT INTO users (id, email, display_name) VALUES 
('dummy_user1', 'user1@example.com', 'テストユーザー1'),
('dummy_user2', 'user2@example.com', 'テストユーザー2'); 
