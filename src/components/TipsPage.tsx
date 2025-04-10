import React from 'react';
import styles from './TipsPage.module.scss';

import Message from './Message';
import MessageViewer from './MessageViewer';
import Card from './Card';

export const TipsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Card title="Tips & FAQ" style={{ marginTop: 0 }}>
        <Message>
          個別ページで短歌が縦書きになったとき、数字や記号が90°回転した状態で表示されてしまいます。
        </Message>
        <MessageViewer>
          数字や記号を縦中横で表示したい場合は、全角数字で入力してみてください。
        </MessageViewer>
      </Card>
    </div>
  );
};

export default TipsPage;
