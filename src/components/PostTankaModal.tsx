import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import styles from './PostTankaModal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
};

const MAX_TANKA_LENGTH = 150;

export const PostTankaModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>短歌を投稿</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="ここに短歌を入力してください"
            required
            maxLength={MAX_TANKA_LENGTH}
          />
          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              キャンセル
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              投稿
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
