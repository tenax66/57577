import styles from './BentoMenu.module.scss';

export const BentoMenu = () => {
  return (
    <button className={styles.bentoButton} aria-label="メニュー">
      <div className={styles.bentoGrid}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className={styles.bentoDot} />
        ))}
      </div>
    </button>
  );
}; 
