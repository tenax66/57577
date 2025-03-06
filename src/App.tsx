import { useState, useEffect } from 'react'
import styles from '@/App.module.scss'
import type { Tanka } from './types/tanka'
import { ClerkProvider, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react'
import { jaLocalization } from './localization/ja'
import { UserMenu } from './components/UserMenu'

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
      <TankaApp />
    </ClerkProvider>
  )
}

const TankaApp = () => {
  const [newTanka, setNewTanka] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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

  useEffect(() => {
    setIsLoggedIn(!!user)
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/tankas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newTanka }),
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

  const handleLogin = () => {
    setIsLoggedIn(true)
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
            placeholder={isLoggedIn ? "ここに短歌を入力してください" : "投稿するにはログインが必要です"}
            required
            disabled={!isLoggedIn}
          />
          <button 
            className={styles.button} 
            type="submit"
            disabled={!isLoggedIn}
          >
            投稿する
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
