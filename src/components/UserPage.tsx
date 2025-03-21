import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { TankaWithLikes, TankasResponse } from '../types/types';
import styles from './UserPage.module.scss';
import { Header } from './Header/Header';
import BlockLoader from './BlockLoader';
import ActionButton from './ActionButton';
import ActionListItem from './ActionListItem';
import Button from './Button';
import { useClerk } from '@clerk/clerk-react';
import TankaList from './TankaList';

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

const MAX_DISPLAY_NAME_LENGTH = 30;

export const UserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [tankas, setTankas] = useState<TankaWithLikes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarHash, setAvatarHash] = useState<string>(Date.now().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<TankasResponse['pagination'] | null>(null);

  // 自分のページかどうかを判定
  const isOwnProfile = clerkUser?.id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        // ユーザー情報を取得
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) throw new Error('ユーザー情報の取得に失敗しました');
        const userData = (await userResponse.json()) as UserResponse;
        setUser(userData.user);
        setNewDisplayName(userData.user.display_name);

        // 短歌を取得（ページネーション付き）
        const tankasResponse = await fetch(`/api/users/${userId}/tankas?page=${currentPage}`);
        if (!tankasResponse.ok) throw new Error('短歌の取得に失敗しました');
        const tankasData = (await tankasResponse.json()) as TankasResponse;
        setTankas(tankasData.tankas);
        setPagination(tankasData.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentPage]);

  const handleUpdateDisplayName = async () => {
    if (!user || !isOwnProfile) return;

    try {
      const response = await fetch(`/api/users/${user.clerk_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ display_name: newDisplayName }),
      });

      if (!response.ok) throw new Error('Failed to update display name');

      // 更新成功後、ユーザー情報を再取得
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = (await userResponse.json()) as UserResponse;
      setUser(userData.user);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '表示名の更新に失敗しました');
    }
  };

  const handleAvatarUpdate = async () => {
    if (!clerkUser || !isOwnProfile) return;

    try {
      setIsUpdatingAvatar(true);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          // Clerkのアバター画像を更新
          await clerkUser.setProfileImage({
            file: file,
          });

          // 少し待つ
          await new Promise(resolve => setTimeout(resolve, 1000));

          // ユーザ情報取得
          const userResponse = await fetch(`/api/users/${userId}`);
          const userData = (await userResponse.json()) as UserResponse;
          setUser(userData.user);

          // 画像更新時にハッシュを更新して強制的に再レンダリング
          setAvatarHash(Date.now().toString());
        } catch (e) {
          setError(e instanceof Error ? e.message : 'アバター画像の更新に失敗しました');
        } finally {
          setIsUpdatingAvatar(false);
        }
      };

      input.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アバター画像の更新に失敗しました');
      setIsUpdatingAvatar(false);
    }
  };

  const handleDelete = async (tankaId: number) => {
    if (!window.confirm('この短歌を削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`/api/tankas/${tankaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('短歌の削除に失敗しました');

      // 短歌一覧を更新
      setTankas(tankas.filter(t => t.id !== tankaId));
    } catch (e) {
      setError(e instanceof Error ? e.message : '短歌の削除に失敗しました');
    }
  };

  if (!userId)
    return (
      <div className={styles.container}>
        <Header />
        <div>ユーザーが見つかりません</div>
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

  if (!user)
    return (
      <div className={styles.container}>
        <Header />
        <div>ユーザーが見つかりません</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <Header />
      <div>
        <table className={styles.profileTable}>
          <tbody>
            <tr>
              <td rowSpan={2} className={styles.avatarCell}>
                <div className={styles.avatarContainer}>
                  <img
                    src={`${user?.avatar_url || ''}${user?.avatar_url?.includes('?') ? '&' : '?'}h=${avatarHash}`}
                    alt={user?.display_name}
                    className={styles.userAvatar}
                  />
                  {isOwnProfile && (
                    <ActionButton onClick={handleAvatarUpdate} disabled={isUpdatingAvatar}>
                      {isUpdatingAvatar ? (
                        <span>
                          更新中
                          <BlockLoader mode={6} />
                        </span>
                      ) : (
                        '画像を変更'
                      )}
                    </ActionButton>
                  )}
                </div>
              </td>
              <td className={styles.infoCell}>
                {isEditing ? (
                  <div className={styles.editNameForm}>
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={e => setNewDisplayName(e.target.value)}
                      maxLength={MAX_DISPLAY_NAME_LENGTH}
                      className={styles.displayNameInput}
                      required
                    />
                    <div className={styles.charCount}>
                      {newDisplayName.length}/{MAX_DISPLAY_NAME_LENGTH}
                    </div>
                    <div className={styles.buttons}>
                      <Button onClick={handleUpdateDisplayName}>保存</Button>
                      <Button
                        theme="SECONDARY"
                        onClick={() => {
                          setIsEditing(false);
                          setNewDisplayName(user.display_name);
                        }}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.nameContainer}>
                    {user.display_name}
                    {isOwnProfile && (
                      <div className={styles.editButtonWrapper}>
                        <ActionButton onClick={() => setIsEditing(true)}>編集</ActionButton>
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isOwnProfile && (
        <div style={{ margin: '2rem 0' }}>
          <ActionListItem icon={`⭢`} onClick={() => signOut()}>
            ログアウト
          </ActionListItem>
          <ActionListItem icon={`⭢`} href={`/users/${userId}/manage`}>
            アカウント管理
          </ActionListItem>
        </div>
      )}

      <h2>投稿した短歌</h2>

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
