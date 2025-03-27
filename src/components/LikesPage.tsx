import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import TankaList from './TankaList';
import type { TankaWithLikes } from '../types/types';
import styles from './LikesPage.module.scss';
import { Header } from './Header/Header';

type PaginationData = {
  current_page: number;
  has_next: boolean;
};

const LikesPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useUser();
  const [tankas, setTankas] = useState<TankaWithLikes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userName, setUserName] = useState<string>('');

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        const data = (await response.json()) as { user: { display_name: string } };
        setUserName(data.user.display_name);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('ユーザー情報の取得に失敗しました');
      }
    };

    fetchUserName();
  }, [userId]);

  useEffect(() => {
    const fetchLikes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}/likes?page=${currentPage}`);
        if (!response.ok) {
          throw new Error('いいねした短歌の取得に失敗しました');
        }
        const data = (await response.json()) as {
          tankas: TankaWithLikes[];
          pagination: PaginationData;
        };
        setTankas(data.tankas);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching likes:', err);
        setError('いいねした短歌の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();
  }, [userId, currentPage]);

  const handleDelete = async (tankaId: number) => {
    // いいね一覧ページでは削除機能は使用しないが、
    // TankaListコンポーネントの要件として必要
    console.log('Delete not implemented in likes page');
  };

  return (
    <div className={styles.likesPage}>
      <Header />
      <h1 className={styles.pageTitle}>{userName}がいいねした短歌</h1>
      <TankaList
        tankas={tankas}
        isLoading={isLoading}
        error={error}
        isOwnProfile={isOwnProfile}
        onDelete={handleDelete}
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default LikesPage;
