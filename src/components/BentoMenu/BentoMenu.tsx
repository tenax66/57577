import { useState } from 'react';
import styles from './BentoMenu.module.scss';
import CardDouble from '../CardDouble';
import { Link } from 'react-router-dom';

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
            <CardDouble title="メニュー">
              <div className={styles.menuContent}>
                <ul>
                  <li>
                    <Link to="/" onClick={() => setIsOpen(false)}>
                      ホーム
                    </Link>
                  </li>
                  <li>
                    <Link to="/search" onClick={() => setIsOpen(false)}>
                      短歌を検索
                    </Link>
                  </li>
                  <li>
                    <Link to="/?sort=latest" onClick={() => setIsOpen(false)}>
                      最新の短歌
                    </Link>
                  </li>
                  <li>
                    <Link to="/?sort=popular" onClick={() => setIsOpen(false)}>
                      人気の短歌
                    </Link>
                  </li>
                  <li>設定</li>
                  <li>ヘルプ</li>
                  <li>お問い合わせ</li>
                </ul>
              </div>
            </CardDouble>
          </div>
        </div>
      )}
    </>
  );
};
