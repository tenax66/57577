import { useUser, useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import styles from './AccountManagePage.module.scss';
import { Header } from './Header/Header';
import Button from './Button';
import Card from './Card';
import BlockLoader from './BlockLoader';

export const AccountManagePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== clerkUser?.primaryEmailAddress?.emailAddress) {
      setError('メールアドレスが一致しません');
      return;
    }

    try {
      setIsDeleting(true);
      await clerkUser?.delete();
      await signOut();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アカウントの削除に失敗しました');
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>アカウント管理</h1>

        <Card title="アカウント削除" className={styles.dangerCard}>
          <p className={styles.warning}>
            アカウントを削除すると、今まで投稿した短歌を含むすべてのデータが完全に削除され、元に戻すことはできません。
          </p>
          <div className={styles.deleteConfirmation}>
            <p>削除を確認するには、あなたのメールアドレスを入力してください: </p>
            <p className={styles.emailDisplay}>{clerkUser?.primaryEmailAddress?.emailAddress}</p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={e => setDeleteConfirmation(e.target.value)}
              placeholder="メールアドレスを入力"
              className={styles.confirmationInput}
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button
              onClick={handleDeleteAccount}
              isDisabled={
                isDeleting || deleteConfirmation !== clerkUser?.primaryEmailAddress?.emailAddress
              }
              style={{
                backgroundColor:
                  isDeleting || deleteConfirmation !== clerkUser?.primaryEmailAddress?.emailAddress
                    ? undefined
                    : 'var(--theme-warning-text)',
              }}
            >
              {isDeleting ? <BlockLoader mode={6} /> : 'アカウントを削除する'}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
