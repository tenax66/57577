import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import type { Tanka } from '../types/tanka'
import styles from './UserPage.module.scss'

type APIResponse = {
  tankas: Tanka[]
}

export const UserPage = () => {
  const { user } = useUser()
  const [tankas, setTankas] = useState<Tanka[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserTankas = async () => {
      try {
        // TODO: ユーザーIDに基づいて短歌を取得するAPIエンドポイントを実装
        const response = await fetch(`/api/users/${user?.id}/tankas`)
        if (!response.ok) throw new Error('短歌の取得に失敗しました')
        const data = await response.json() as APIResponse
        setTankas(data.tankas)
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserTankas()
    }
  }, [user])

  if (!user) return <div>ログインが必要です</div>

  return (
    <div className={styles.container}>
      <div className={styles.userProfile}>
        <img 
          src={user.imageUrl} 
          alt={user.username || ''} 
          className={styles.userAvatar}
        />
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>{user.username || 'ユーザー'}</h1>
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
