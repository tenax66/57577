import { useUser } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import styles from './UserMenu.module.scss';

type User = {
  id: number;
  clerk_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type UserResponse = {
  user: User;
};

export const UserMenu = () => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUser) return;

      try {
        const response = await fetch(`/api/users/${clerkUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = (await response.json()) as UserResponse;
        setUser(data.user);
      } catch (e) {
        console.error('Error fetching user:', e);
      }
    };

    fetchUser();
  }, [clerkUser]);

  if (!clerkUser || !user) return null;

  return (
    <div className={styles.userMenu}>
      <a href={`/users/${clerkUser.id}`} className={styles.userProfile}>
        <Avatar src={user.avatar_url || ''}></Avatar>
        <span className={styles.userName}>{user.display_name}</span>
      </a>
      <button onClick={() => signOut()} className={`${styles.button} ${styles.logoutButton}`}>
        ログアウト
      </button>
    </div>
  );
};
