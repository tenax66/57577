import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <Link to="/" className={styles.link}>
          トップページ
        </Link>
        <Link to="/ranking" className={styles.link}>
          ランキング
        </Link>
        <Link to="/search" className={styles.link}>
          検索
        </Link>
      </div>
      <div className={styles.copyright}>
        © {currentYear} 57577.net
      </div>
    </footer>
  );
}; 
