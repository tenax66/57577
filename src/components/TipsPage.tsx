import React from 'react';
import styles from './TipsPage.module.scss';

interface TipsItem {
  question: string;
  answer: string;
}

export const TipsPage: React.FC = () => {
  const tipsItems: TipsItem[] = [
    {
      question: 'タンカとは何ですか？',
      answer:
        '短歌は5-7-5-7-7の31音からなる日本の伝統的な詩の形式です。自然、季節、感情などを表現するのに使われます。',
    },
    {
      question: 'アカウントの作成方法は？',
      answer:
        'トップページの「サインアップ」ボタンをクリックして、必要な情報を入力するだけです。メールアドレスと安全なパスワードが必要です。',
    },
    {
      question: '短歌を投稿するには？',
      answer:
        'ログイン後、メインメニューから「投稿する」ボタンをクリックすると、短歌を作成して投稿できます。',
    },
    {
      question: 'ランキングシステムはどのように機能しますか？',
      answer:
        '他のユーザーからの「いいね」の数に基づいて短歌がランク付けされます。人気のある短歌はランキングページで確認できます。',
    },
    {
      question: 'プロフィールを編集するには？',
      answer:
        'ユーザーページにアクセスして「プロフィール編集」ボタンをクリックすると、プロフィール情報を更新できます。',
    },
  ];

  return (
    <div className={styles.faqContainer}>
      <h1 className={styles.faqTitle}>Tips</h1>
      <div className={styles.faqList}>
        {tipsItems.map((item, index) => (
          <div key={index} className={styles.faqItem}>
            <h3 className={styles.question}>Q: {item.question}</h3>
            <p className={styles.answer}>A: {item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsPage;
