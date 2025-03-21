import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import styles from './PostTankaModal.module.scss';
import Button from './Button';
import CardDouble from './CardDouble';
import BlockLoader from './BlockLoader';
import Badge from './Badge';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
};

type UserResponse = {
  user: {
    id: number;
    clerk_id: string;
    display_name: string;
    created_at: string;
  };
};

const MAX_TANKA_LENGTH = 150;

export const PostTankaModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setIsLoadingUser(true);
      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (!response.ok) throw new Error('ユーザー情報の取得に失敗しました');

        const userData = (await response.json()) as UserResponse;
        setDisplayName(userData.user.display_name);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleClose}>
      <div
        className={`${styles.modal} ${isClosing ? styles.closing : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <CardDouble title="短歌を投稿">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="ここに短歌を入力してください"
              required
              maxLength={MAX_TANKA_LENGTH}
            />
            <div className={styles.userInfo}>
              {isLoadingUser ? (
                <Badge>
                  ユーザー情報を読み込み中
                  <BlockLoader mode={6} />
                </Badge>
              ) : (
                <Badge>{displayName}</Badge>
              )}
            </div>
            <div className={styles.buttons}>
              <Button type="button" onClick={handleClose} theme="SECONDARY">
                キャンセル
              </Button>
              <Button type="submit" isDisabled={isSubmitting} theme="PRIMARY">
                投稿
              </Button>
            </div>
          </form>
        </CardDouble>
      </div>
    </div>
  );
};
