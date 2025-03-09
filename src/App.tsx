import { useState, useEffect } from 'react'
import styles from '@/App.module.scss'
import type { Tanka } from './types/tanka'
import { ClerkProvider, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react'
import { jaLocalization } from './localization/ja'
import { UserMenu } from './components/UserMenu'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { UserPage } from './components/UserPage'
import { TankaPage } from './components/TankaPage'

type APIResponse = {
  tankas: Tanka[]
}

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const App = () => {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      localization={jaLocalization}
    >
      <Router>
        <Routes>
          <Route path="/" element={<TankaApp />} />
          <Route path="/users/:userId" element={<UserPage />} />
          <Route path="/tankas/:tankaId" element={<TankaPage />} />
        </Routes>
      </Router>
    </ClerkProvider>
  )
}

const TankaApp = () => {
  const [newTanka, setNewTanka] = useState('')
  const [tankas, setTankas] = useState<Tanka[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoaded } = useUser()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const response = await fetch('/api/tankas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: newTanka,
          clerk_id: user.id 
        }),
      })

      if (!response.ok) throw new Error('Failed to post tanka')
      
      // 投稿成功後に短歌一覧を再取得
      const data = await (await fetch('/api/tankas')).json() as APIResponse
      setTankas(data.tankas)
      setNewTanka('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '短歌の投稿に失敗しました')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.toolbar}>
        <a href="/" className={styles.logo}>57577.net</a>
        <div className={styles.auth}>
          {!isLoaded ? (
            <p>Loading...</p>
          ) : !user ? (
            <>
              <SignInButton mode="modal">
                <button className={styles.button}>ログイン</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className={styles.button}>新規登録</button>
              </SignUpButton>
            </>
          ) : (
            <UserMenu />
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
                  <Link to={`/tankas/${tanka.id}`} className={styles.tankaLink}>
                    <p>{tanka.content}</p>
                    <div className={styles.tankaMetadata}>
                      <small>by <a href={`/users/${tanka.clerk_id}`}>{tanka.display_name}</a></small>
                      <small>{new Date(tanka.created_at).toLocaleDateString('ja-JP')}</small>
                    </div>
                  </Link>
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
            placeholder={user ? "ここに短歌を入力してください" : "投稿するにはログインが必要です"}
            required
            disabled={!user}
          />
          <button 
            className={styles.button} 
            type="submit"
            disabled={!user}
          >
            投稿する
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
