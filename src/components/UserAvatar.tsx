import { useState, useEffect } from 'react';
import styles from './UserAvatar.module.scss';

type UserAvatarProps = {
  clerkId: string;
};

export const UserAvatar = ({ clerkId }: UserAvatarProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${clerkId}`);
        if (!response.ok) throw new Error('ユーザー情報の取得に失敗しました');

        const data = (await response.json()) as { user: { avatar_url?: string } };
        setAvatarUrl(data.user.avatar_url || null);
      } catch (error) {
        console.error('アバター取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [clerkId]);

  if (isLoading) return null;

  return avatarUrl ? (
    <img src={avatarUrl} alt="ユーザーアバター" className={styles.userAvatar} />
  ) : null;
};

export default UserAvatar;
