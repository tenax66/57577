import { useState } from 'react'
import styles from '@/App.module.scss'

const mockTankas = [
  { id: 1, text: "春の日に 心うきたつ 花の色 風にそよげる 若葉のように", author: "user1" },
  { id: 2, text: "夏の夜の まどろみの中 虫の音 遠き記憶を 呼び覚ますか", author: "user2" },
]

const App = () => {
  const [newTanka, setNewTanka] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('投稿された短歌:', newTanka)
    setNewTanka('')
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <div className={styles.container}>
      <header className={styles.toolbar}>
        <a href="/" className={styles.logo}>57577.net</a>
        <div className={styles.auth}>
          {!isLoggedIn ? (
            <>
              <button className={styles.button} onClick={handleLogin}>
                Googleでログイン
              </button>
              <button className={styles.button}>
                ユーザー登録
              </button>
            </>
          ) : (
            <button className={styles.button} onClick={() => setIsLoggedIn(false)}>
              ログアウト
            </button>
          )}
        </div>
      </header>

      <main>
        <div className={styles.tankaBox}>
          <h2>最新の短歌</h2>
          <ul className={styles.tankaList}>
            {mockTankas.map(tanka => (
              <li key={tanka.id} className={styles.tankaItem}>
                <p>{tanka.text}</p>
                <small>by {tanka.author}</small>
              </li>
            ))}
          </ul>
        </div>

        <form className={styles.postForm} onSubmit={handleSubmit}>
          <h2>短歌を投稿</h2>
          <textarea
            value={newTanka}
            onChange={(e) => setNewTanka(e.target.value)}
            placeholder="ここに短歌を入力してください"
            required
          />
          <button className={styles.button} type="submit">
            投稿する
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
