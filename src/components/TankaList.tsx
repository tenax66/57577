import { Link } from 'react-router-dom';
import type { TankaWithLikes } from '../types/types';
import styles from './TankaList.module.scss';
import DeleteButton from './DeleteButton';
import BlockLoader from './BlockLoader';
import Button from './Button';
import { LikeButton } from './LikeButton';
import UserAvatar from './UserAvatar';

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
}: TankaListProps) => {
  return (
    <div className={styles.tankaSection}>
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
                <div className={styles.userInfo}>
                  {/* FIXME ここでいろいろ判定するかわりにオプションをつけたい */}
                  {tanka.clerk_id && tanka.display_name && (
                    <>
                      <a href={`/users/${tanka.clerk_id}`} style={{ background: 'none' }}>
                        <UserAvatar clerkId={tanka.clerk_id} />
                      </a>
                      <Link to={`/users/${tanka.clerk_id}`}>{tanka.display_name}</Link>
                    </>
                  )}
                </div>
                <div className={styles.rightAlignedItems}>
                  <span>
                    {
                      new Date(new Date(tanka.created_at).getTime() + 9 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0]
                    }
                  </span>
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
