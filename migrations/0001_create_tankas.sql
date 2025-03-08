CREATE TABLE tankas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- テストデータ（usersテーブルのidを参照するように修正）
INSERT INTO tankas (user_id, content) VALUES 
(1, '春の日に 心うきたつ 花の色 風にそよげる 若葉のように'),
(2, '夏の夜の まどろみの中 虫の音 遠き記憶を 呼び覚ますか'); 
