import { useUser, useClerk } from '@clerk/clerk-react'
import styles from './UserMenu.module.scss'

export const UserMenu = () => {
  const { user } = useUser()
  const { signOut } = useClerk()

  if (!user) return null

  return (
    <div className={styles.userMenu}>
      <a href={`/users/${user.id}`} className={styles.userProfile}>
        <img 
          src={user.imageUrl} 
          alt={user.username || ''}
          className={styles.userAvatar}
        />
        <span className={styles.userName}>{user.username || 'ユーザー'}</span>
      </a>
      <button 
        onClick={() => signOut()} 
        className={`${styles.button} ${styles.logoutButton}`}
      >
        ログアウト
      </button>
    </div>
  )
} 
