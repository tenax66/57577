import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { UserMenu } from '../UserMenu';
import styles from './Header.module.scss';
import BlockLoader from '../BlockLoader';
import ButtonGroup from '../ButtonGroup';
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
            <SignInButton mode="modal">
              <ActionButton>LOGIN</ActionButton>
            </SignInButton>
            <SignUpButton mode="modal">
              <ActionButton>SIGNUP</ActionButton>
            </SignUpButton>
          </>
        ) : (
          <UserMenu />
        )}
      </div>
    </header>
  );
};
