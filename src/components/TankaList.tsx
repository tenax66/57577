import { Link } from 'react-router-dom';
import type { TankaWithLikes } from '../types/types';
import styles from './TankaList.module.scss';
import DeleteButton from './DeleteButton';
import BlockLoader from './BlockLoader';
import Button from './Button';
import { LikeButton } from './LikeButton';

type TankaListProps = {
  tankas: TankaWithLikes[];
  isLoading: boolean;
  error: string | null;
  isOwnProfile: boolean;
  onDelete: (tankaId: number) => void;
  pagination: {
    has_next: boolean;
  } | null;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  hideTitle?: boolean;
  hideStats?: boolean;
};

const TankaList = ({
  tankas,
  isLoading,
  error,
  isOwnProfile,
  onDelete,
  pagination,
  currentPage,
  setCurrentPage,
  hideTitle = false,
  hideStats = false,
}: TankaListProps) => {
  return (
    <div className={styles.tankaSection}>
      {!hideTitle && <h2>投稿した短歌</h2>}
      {!hideStats && <p className={styles.userStats}>投稿数: {tankas.length}</p>}
      {isLoading ? (
        <p>
          Loading <BlockLoader mode={6} />
        </p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : tankas.length === 0 ? (
        <p>まだ短歌を投稿していません</p>
      ) : (
        <div className={styles.tankaList}>
          {tankas.map(tanka => (
            <div key={tanka.id} className={styles.tankaCard}>
              <Link to={`/tankas/${tanka.id}`} className={styles.tankaLink}>
                <p>{tanka.content}</p>
              </Link>
              <div className={styles.tankaMetadata}>
                <small>
                  <span>{new Date(tanka.created_at).toISOString().split('T')[0]}</span>
                </small>
                <div className={styles.rightActions}>
                  <LikeButton
                    tankaId={tanka.id}
                    initialLiked={tanka.is_liked}
                    likesCount={tanka.likes_count}
                  />
                  {isOwnProfile && (
                    <DeleteButton onClick={() => onDelete(tanka.id)}>削除</DeleteButton>
                  )}
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
    </div>
  );
};

export default TankaList;
