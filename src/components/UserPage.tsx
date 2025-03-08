import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import type { Tanka } from '../types/tanka'
import styles from './UserPage.module.scss'

type User = {
  id: number
  clerk_id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

type APIResponse = {
  tankas: Tanka[]
}

type UserResponse = {
  user: User
}

export const UserPage = () => {
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [tankas, setTankas] = useState<Tanka[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return

      try {
        // ユーザー情報を取得
        const userResponse = await fetch(`/api/users/${clerkUser.id}`)
        if (!userResponse.ok) throw new Error('ユーザー情報の取得に失敗しました')
        const userData = await userResponse.json() as UserResponse
        setUser(userData.user)

        // 短歌を取得
        const tankasResponse = await fetch(`/api/users/${clerkUser.id}/tankas`)
        if (!tankasResponse.ok) throw new Error('短歌の取得に失敗しました')
        const tankasData = await tankasResponse.json() as APIResponse
        setTankas(tankasData.tankas)
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [clerkUser])

  if (!clerkUser || !user) return <div>ログインが必要です</div>

  return (
    <div className={styles.container}>
      <div className={styles.userProfile}>
        <img 
          src={user.avatar_url || ''} 
          alt={user.display_name} 
          className={styles.userAvatar}
        />
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>{user.display_name}</h1>
          <p className={styles.userStats}>投稿数: {tankas.length}</p>
        </div>
      </div>

      <div className={styles.tankaSection}>
        <h2>投稿した短歌</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : tankas.length === 0 ? (
          <p>まだ短歌を投稿していません</p>
        ) : (
          <ul className={styles.tankaList}>
            {tankas.map(tanka => (
              <li key={tanka.id} className={styles.tankaItem}>
                <p>{tanka.content}</p>
                <small>{new Date(tanka.created_at).toLocaleDateString('ja-JP')}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 
