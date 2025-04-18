import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './CookiePolicy.module.scss';
import cookiePolicyMarkdown from '../assets/cookie-policy.md?raw';

const CookiePolicy: React.FC = () => {
  return (
    <div className={styles.container}>
      <div>
        <main className={styles.main}>
          <div className={styles.content}>
            <ReactMarkdown>{cookiePolicyMarkdown}</ReactMarkdown>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CookiePolicy;
