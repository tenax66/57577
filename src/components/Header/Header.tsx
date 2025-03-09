import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { UserMenu } from '../UserMenu'
import styles from './Header.module.scss'

export const Header = () => {
  const { user, isLoaded } = useUser()

  return (
    <header className={styles.toolbar}>
      <Link to="/" className={styles.logo}>57577.net</Link>
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
  )
} 
