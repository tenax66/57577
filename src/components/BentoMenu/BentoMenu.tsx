import { useState } from 'react';
import styles from './BentoMenu.module.scss';

export const BentoMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={styles.bentoButton} aria-label="メニュー" onClick={() => setIsOpen(true)}>
        <div className={styles.bentoGrid}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className={styles.bentoDot} />
          ))}
        </div>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.menu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuHeader}>
              <h2>メニュー</h2>
              <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
            <div className={styles.menuContent}>
              <ul>
                <li>ホーム</li>
                <li>最新の短歌</li>
                <li>人気の短歌</li>
                <li>設定</li>
                <li>ヘルプ</li>
                <li>お問い合わせ</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
