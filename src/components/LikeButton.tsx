import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import styles from './LikeButton.module.scss';

type Props = {
  tankaId: number;
  initialLiked: boolean;
  likesCount: number;
};

type LikeResponse = {
  liked: boolean;
};

type LikeStatusResponse = {
  liked: boolean;
};

type LikeCountResponse = {
  count: number;
};

export const LikeButton = ({ tankaId, initialLiked, likesCount: initialLikesCount }: Props) => {
  const { user, isLoaded } = useUser();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isProcessing, setIsProcessing] = useState(false);

  // いいねの状態といいね数を取得
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        // いいね数を取得
        const countResponse = await fetch(`/api/tankas/${tankaId}/likes/count`);
        if (!countResponse.ok) throw new Error('Failed to fetch like count');
        const { count } = (await countResponse.json()) as LikeCountResponse;
        setLikesCount(count);

        // ログイン中のみいいね状態を取得
        if (user) {
          const statusResponse = await fetch(`/api/tankas/${tankaId}/likes/status`);
          if (!statusResponse.ok) throw new Error('Failed to fetch like status');
          const { liked } = (await statusResponse.json()) as LikeStatusResponse;
          setIsLiked(liked);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchLikeData();
  }, [tankaId, user]);

  const handleLike = async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/tankas/${tankaId}/likes`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle like');

      // いいねの状態といいね数を再取得
      const [{ liked }, { count }] = await Promise.all([
        response.json() as Promise<LikeResponse>,
        (await fetch(`/api/tankas/${tankaId}/likes/count`)).json() as Promise<LikeCountResponse>,
      ]);

      setIsLiked(liked);
      setLikesCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <button
      onClick={handleLike}
      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
      disabled={!user || isProcessing}
      title={user ? undefined : 'いいねするにはログインが必要です'}
    >
      <span className={styles.icon}>♥</span>
      <span className={styles.count}>{likesCount}</span>
    </button>
  );
};
