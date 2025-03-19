import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Header } from './Header/Header';
import styles from './TermsOfService.module.scss';
import termsMarkdown from '../assets/terms-of-service.md?raw';

const TermsOfService: React.FC = () => {
  return (
    <div className={styles.container}>
      <Header />
      <div>
        <main className={styles.main}>
          <div className={styles.content}>
            <ReactMarkdown>{termsMarkdown}</ReactMarkdown>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;
