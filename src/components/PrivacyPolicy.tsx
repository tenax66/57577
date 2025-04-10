import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './PrivacyPolicy.module.scss';
import termsMarkdown from '../assets/privacy-policy.md?raw';

const TermsOfService: React.FC = () => {
  return (
    <div className={styles.container}>
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
