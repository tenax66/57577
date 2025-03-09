import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  const { userId } = useParams<{ userId: string }>()
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [tankas, setTankas] = useState<Tanka[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')

  // 自分のページかどうかを判定
  const isOwnProfile = clerkUser?.id === userId

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return

      try {
        // ユーザー情報を取得
        const userResponse = await fetch(`/api/users/${userId}`)
        if (!userResponse.ok) throw new Error('ユーザー情報の取得に失敗しました')
        const userData = await userResponse.json() as UserResponse
        setUser(userData.user)
        setNewDisplayName(userData.user.display_name) // 初期値をセット

        // 短歌を取得
        const tankasResponse = await fetch(`/api/users/${userId}/tankas`)
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
  }, [userId])

  const handleUpdateDisplayName = async () => {
    if (!user || !isOwnProfile) return

    try {
      const response = await fetch(`/api/users/${user.clerk_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ display_name: newDisplayName }),
      })

      if (!response.ok) throw new Error('Failed to update display name')

      // 更新成功後、ユーザー情報を再取得
      const userResponse = await fetch(`/api/users/${userId}`)
      const userData = await userResponse.json() as UserResponse
      setUser(userData.user)
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '表示名の更新に失敗しました')
    }
  }

  if (!userId) return <div>ユーザーが見つかりません</div>
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>ユーザーが見つかりません</div>

  return (
    <div className={styles.container}>
      <div className={styles.userProfile}>
        <img 
          src={user.avatar_url || ''} 
          alt={user.display_name} 
          className={styles.userAvatar}
        />
        <div className={styles.userInfo}>
          {isEditing ? (
            <div className={styles.editNameForm}>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className={styles.nameInput}
              />
              <div className={styles.editButtons}>
                <button 
                  onClick={handleUpdateDisplayName}
                  className={styles.saveButton}
                >
                  保存
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false)
                    setNewDisplayName(user.display_name)
                  }}
                  className={styles.cancelButton}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.nameContainer}>
              <h1 className={styles.userName}>{user.display_name}</h1>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  編集
                </button>
              )}
            </div>
          )}
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
