import { useState, useEffect } from 'react'
import styles from '@/App.module.scss'
import type { Tanka } from './types/tanka'

type APIResponse = {
  tankas: Tanka[]
}

const App = () => {
  const [newTanka, setNewTanka] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [tankas, setTankas] = useState<Tanka[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTankas = async () => {
      try {
        const response = await fetch('/api/tankas')
        if (!response.ok) throw new Error('Failed to fetch tankas')
        const data = await response.json() as APIResponse
        setTankas(data.tankas)
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTankas()
  }, [])

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
                ログイン
              </button>
              <button className={styles.button}>
                登録
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
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <ul className={styles.tankaList}>
              {tankas.map(tanka => (
                <li key={tanka.id} className={styles.tankaItem}>
                  <p>{tanka.content}</p>
                  <small>by {tanka.user_id}</small>
                </li>
              ))}
            </ul>
          )}
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
