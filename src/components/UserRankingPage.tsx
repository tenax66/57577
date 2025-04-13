import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './UserRankingPage.module.scss';
import Card from './Card';
import Select from '../components/Select';
import BlockLoader from './BlockLoader';
import Button from './Button';
import UserAvatar from './UserAvatar';

type UserWithLikes = {
  id: number;
  clerk_id: string;
  display_name: string;
  total_likes: number;
};

type PaginationInfo = {
  current_page: number;
  has_next: boolean;
};

type RankingResponse = {
  users: UserWithLikes[];
  pagination: PaginationInfo;
};

type PeriodOption = {
  value: string;
  label: string;
};

const UserRankingPage = () => {
  const [users, setUsers] = useState<UserWithLikes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState<string>('week');

  const periodOptions: PeriodOption[] = [
    { value: 'week', label: '今週' },
    { value: 'month', label: '今月' },
    { value: 'all', label: '全期間' },
  ];

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ranking/users?page=${currentPage}&period=${period}`);
        if (!response.ok) {
          throw new Error('ユーザーランキングの取得に失敗しました');
        }
        const data = (await response.json()) as RankingResponse;
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching user ranking:', err);
        setError(err instanceof Error ? err.message : 'ユーザーランキングの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, [currentPage, period]);

  const handlePeriodChange = (selectedLabel: string) => {
    const option = periodOptions.find(option => option.label === selectedLabel);
    if (option) {
      setPeriod(option.value);
      setCurrentPage(1); // 期間変更時にページを1に戻す
    }
  };

  return (
    <div className={styles.userRankingPage}>
      <main>
        <Card title="ユーザーランキング" style={{ padding: '0.5rem', marginTop: '1.5rem' }}>
          <div className={styles.periodSelector}>
            <Select
              name="period-select"
              options={periodOptions.map(option => option.label)}
              defaultValue={periodOptions.find(option => option.value === period)?.label || ''}
              onChange={handlePeriodChange}
            />
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <p>
                Loading <BlockLoader mode={6} />
              </p>
            </div>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : users.length === 0 ? (
            <p className={styles.noResults}>該当するユーザーがいません</p>
          ) : (
            <div className={styles.userList}>
              {users.map((user, index) => (
                <div key={user.clerk_id} className={styles.userCard}>
                  <div className={styles.rankBadge}>
                    {currentPage === 1 ? index + 1 : (currentPage - 1) * 10 + index + 1}
                  </div>
                  <div className={styles.userInfo}>
                    <Link to={`/users/${user.clerk_id}`} className={styles.avatarLink}>
                      <UserAvatar clerkId={user.clerk_id} />
                    </Link>
                    <div className={styles.userDetails}>
                      <Link to={`/users/${user.clerk_id}`} className={styles.userName}>
                        {user.display_name}
                      </Link>
                      <div className={styles.likesCount}>
                        <span className={styles.likesIcon}>♥</span>
                        <span>{user.total_likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && (
            <div className={styles.pagination}>
              <Button onClick={() => setCurrentPage(p => p - 1)} isDisabled={currentPage === 1}>
                前のページ
              </Button>
              <span className={styles.pageInfo}>{currentPage}</span>
              <Button onClick={() => setCurrentPage(p => p + 1)} isDisabled={!pagination.has_next}>
                次のページ
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default UserRankingPage; 
