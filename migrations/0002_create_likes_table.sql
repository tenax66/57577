CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tanka_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tanka_id) REFERENCES tankas(id) ON DELETE CASCADE,
  UNIQUE(user_id, tanka_id)
);

CREATE INDEX idx_likes_user_tanka ON likes(user_id, tanka_id); 
