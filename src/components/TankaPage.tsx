import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { TankaWithLikes } from '../types/types';
import { Header } from './Header/Header';
import styles from './TankaPage.module.scss';
import { LikeButton } from './LikeButton';
import { useUser } from '@clerk/clerk-react';
import BlockLoader from './BlockLoader';
import DeleteButton from './DeleteButton';
import Card from './Card';

type APIResponse = {
  tanka: TankaWithLikes;
};

export const TankaPage = () => {
  const { tankaId } = useParams<{ tankaId: string }>();
  const [tanka, setTanka] = useState<TankaWithLikes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchTanka = async () => {
      if (!tankaId) return;

      try {
        const response = await fetch(`/api/tankas/${tankaId}`);
        if (!response.ok) throw new Error('短歌の取得に失敗しました');
        const data = (await response.json()) as APIResponse;
        setTanka(data.tanka);
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTanka();
  }, [tankaId]);

  const handleDelete = async () => {
    if (!tankaId || !user || !tanka || user.id !== tanka.clerk_id) return;
    if (!window.confirm('この短歌を削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`/api/tankas/${tankaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('短歌の削除に失敗しました');

      // 削除成功後、トップページに戻る
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '短歌の削除に失敗しました');
    }
  };

  if (!tankaId)
    return (
      <div className={styles.container}>
        <Header />
        <div>短歌が見つかりません</div>
      </div>
    );

  if (isLoading)
    return (
      <div className={styles.container}>
        <Header />
        <p>
          Loading <BlockLoader mode={6} />
        </p>
      </div>
    );

  if (!tanka)
    return (
      <div className={styles.container}>
        <Header />
        <div>短歌が見つかりません</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <Header />
      <Card>
        <p className={styles.content}>{tanka.content}</p>
        <div className={styles.metadata}>
          <div className={styles.authorInfo}>
            <Link to={`/users/${tanka.clerk_id}`} className={styles.author}>
              {tanka.display_name}
            </Link>
          </div>
          <div className={styles.rightAlignedItems}>
            <time className={styles.date}>
              {
                new Date(new Date(tanka.created_at).getTime() + 9 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0]
              }
            </time>
            <LikeButton
              tankaId={tanka.id}
              initialLiked={tanka.is_liked}
              likesCount={tanka.likes_count}
            />
            {user?.id === tanka.clerk_id && (
              <DeleteButton onClick={handleDelete}>削除</DeleteButton>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
