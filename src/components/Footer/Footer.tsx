import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.links}></div>
      <div className={styles.copyright}>© {currentYear} 57577.net</div>
    </footer>
  );
};
