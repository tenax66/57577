import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { Link } from 'react-router-dom';
import styles from './CookieConsent.module.scss';

export const CookieConsentBanner: React.FC = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="同意する"
      declineButtonText="拒否"
      enableDeclineButton
      style={{
        background: 'var(--theme-cookie-consent-background)',
        borderTop: '1px solid var(--theme-divider)',
      }}
      buttonStyle={{
        background: 'var(--theme-button)',
        color: 'var(--theme-button-text)',
        padding: '0.5em 1em',
        cursor: 'pointer',
        fontSize: '1em',
      }}
      buttonClasses={styles.button}
      declineButtonStyle={{
        background: 'var(--theme-background)',
        color: 'var(--theme-text)',
        padding: '0.5em 1em',
        cursor: 'pointer',
        boxShadow: 'inset 0 0 0 1px var(--theme-border)',
        fontSize: '1em',
      }}
      declineButtonClasses={styles.declineButton}
      onAccept={() => {
        // use no cookies currently
      }}
      onDecline={() => {
        // use no cookies currently
      }}
      containerClasses={styles.container}
      contentClasses={styles.content}
    >
      このウェブサイトでは、Cookieを使用しています。
      <Link to="/cookie-policy" className={styles.link}>
        Cookieポリシー
      </Link>
      および
      <Link to="/privacy-policy" className={styles.link}>
        プライバシーポリシー
      </Link>
      をご確認ください。
    </CookieConsent>
  );
};
