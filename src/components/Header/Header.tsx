import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { UserMenu } from '../UserMenu';
import { BentoMenu } from '../BentoMenu/BentoMenu';
import styles from './Header.module.scss';
import BlockLoader from '../BlockLoader';
import ActionButton from '../ActionButton';

export const Header = () => {
  const { user, isLoaded } = useUser();

  return (
    <header className={styles.toolbar}>
      <Link to="/" className={styles.logo}>
        57577.net
      </Link>
      <div className={styles.auth}>
        {!isLoaded ? (
          <p>
            Loading <BlockLoader mode={6} />
          </p>
        ) : !user ? (
          <>
            <div style={{ marginRight: '0.75rem' }}>
              <SignInButton mode="modal">
                <ActionButton>ログイン</ActionButton>
              </SignInButton>
            </div>
            <BentoMenu />
          </>
        ) : (
          <>
            <UserMenu />
            <BentoMenu />
          </>
        )}
      </div>
    </header>
  );
};
