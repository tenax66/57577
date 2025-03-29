import { useState } from 'react';
import styles from './BentoMenu.module.scss';
import CardDouble from '../CardDouble';
import { Link } from 'react-router-dom';
import ActionListItem from '../ActionListItem';

export const BentoMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, 300);
  };

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
        <div
          className={`${styles.overlay} ${isClosing ? styles.closing : ''}`}
          onClick={handleClose}
        >
          <div
            className={`${styles.menu} ${isClosing ? styles.closing : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <CardDouble title="メニュー">
              <div className={styles.menuContent}>
                <ActionListItem icon={`⭢`} href="/">
                  トップページ
                </ActionListItem>
                <ActionListItem icon={`⭢`} href="/search">
                  検索
                </ActionListItem>
                <ActionListItem icon={`⭢`} href="/ranking">
                  ランキング
                </ActionListItem>
                <ActionListItem icon={`⊹`} href="/terms-of-service">
                  利用規約
                </ActionListItem>
                <ActionListItem icon={`⊹`} href="/privacy-policy">
                  プライバシーポリシー
                </ActionListItem>
              </div>
            </CardDouble>
          </div>
        </div>
      )}
    </>
  );
};
