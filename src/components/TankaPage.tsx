import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { TankaWithLikes } from '../types/types';
import { Header } from './Header/Header';
import styles from './TankaPage.module.scss';
import { LikeButton } from './LikeButton';
import { useUser } from '@clerk/clerk-react';
import BlockLoader from './BlockLoader';
import DeleteButton from './DeleteButton';
import Card from './Card';
import ButtonGroup from './ButtonGroup';
import Select from './Select';
import { Helmet } from 'react-helmet-async';

type APIResponse = {
  tanka: TankaWithLikes;
};

type DisplayMode = 'vertical' | 'horizontal';

export const TankaPage = () => {
  const { tankaId } = useParams<{ tankaId: string }>();
  const [tanka, setTanka] = useState<TankaWithLikes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('vertical');
  const navigate = useNavigate();
  const { user } = useUser();

  // 画面幅に基づいて初期表示モードを設定
  useEffect(() => {
    const setInitialDisplayMode = () => {
      // モバイルデバイスや狭い画面では横書きをデフォルトに
      if (window.innerWidth < 768) {
        setDisplayMode('vertical');
      } else {
        setDisplayMode('horizontal');
      }
    };

    // 初期設定
    setInitialDisplayMode();

    // ウィンドウサイズ変更時にも対応
    const handleResize = () => {
      setInitialDisplayMode();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchTanka = async () => {
      if (!tankaId) return;

      try {
        const response = await fetch(`/api/tankas/${tankaId}`);
        if (!response.ok) throw new Error('短歌の取得に失敗しました');
        const data = (await response.json()) as APIResponse;
        setTanka(data.tanka);
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTanka();
  }, [tankaId]);

  const handleDelete = async () => {
    if (!tankaId || !user || !tanka || user.id !== tanka.clerk_id) return;
    if (!window.confirm('この短歌を削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`/api/tankas/${tankaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('短歌の削除に失敗しました');

      // 削除成功後、トップページに戻る
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '短歌の削除に失敗しました');
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleTweet = () => {
    if (!tanka) return;

    const url = window.location.href;
    const text = `${tanka.content}\n／${tanka.display_name}\n\n`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(tweetUrl, '_blank');
  };

  const displayOptions = [
    { value: 'vertical', label: '縦書き' },
    { value: 'horizontal', label: '横書き' },
  ];

  // Safariかどうかを検出する関数を追加
  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
  };

  if (!tankaId)
    return (
      <div className={styles.container}>
        <Header />
        <div>短歌が見つかりません</div>
      </div>
    );

  if (isLoading)
    return (
      <div className={styles.container}>
        <Header />
        <p>
          Loading <BlockLoader mode={6} />
        </p>
      </div>
    );

  if (!tanka)
    return (
      <div className={styles.container}>
        <Header />
        <div>短歌が見つかりません</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <Header />
      {tanka && (
        <Helmet>
          <title>{tanka.content.substring(0, 30)}... - 57577.net</title>
          <meta property="og:title" content={`${tanka.content.substring(0, 30)}... - 57577.net`} />
          <meta property="og:description" content={tanka.content} />
          <meta property="og:url" content={`https://57577.net/tankas/${tankaId}`} />
          <meta property="og:type" content="article" />
          <meta name="twitter:title" content={`${tanka.content.substring(0, 30)}... - 57577.net`} />
          <meta name="twitter:description" content={tanka.content} />
        </Helmet>
      )}
      <div className={`${styles.cardContainer} ${styles[displayMode]}`}>
        <div className={styles.displayModeSelector}>
          <Select
            name="display-mode-select"
            options={displayOptions.map(option => option.label)}
            defaultValue={displayOptions.find(option => option.value === displayMode)?.label || ''}
            onChange={selectedLabel => {
              const option = displayOptions.find(option => option.label === selectedLabel);
              if (option) {
                setDisplayMode(option.value as DisplayMode);
              }
            }}
          />
        </div>
        <Card>
          <div className={styles.contentWrapper}>
            <p className={`${styles.content} ${styles[displayMode]}`}>
              {displayMode === 'vertical'
                ? tanka.content.split('').map((char, index) => {
                    // 英数字かどうかを判定
                    const isAlphaNumeric = /[a-zA-Z0-9]/.test(char);

                    // Safariの場合のみ句読点の置換処理
                    if (isSafari()) {
                      if (char === '。') {
                        return <span key={index}>&#xFE12;</span>; // U+FE12
                      } else if (char === '、') {
                        return <span key={index}>&#xFE11;</span>; // U+FE11
                      } else if (char === 'ー') {
                        return (
                          <span
                            key={index}
                            className={isSafari() ? styles.safariSpecificChars : styles.japanese}
                          >
                            {char}
                          </span>
                        );
                      }
                    }

                    if (isAlphaNumeric) {
                      return char;
                    } else {
                      return <span key={index}>{char}</span>;
                    }
                  })
                : tanka.content}
            </p>
          </div>
          <div className={styles.metadata}>
            <div className={styles.authorInfo}>
              <Link to={`/users/${tanka.clerk_id}`} className={styles.author}>
                {tanka.display_name}
              </Link>
            </div>
            <div className={styles.rightAlignedItems}>
              <time className={styles.date}>
                {
                  new Date(new Date(tanka.created_at).getTime() + 9 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                }
              </time>
              <LikeButton
                tankaId={tanka.id}
                initialLiked={tanka.is_liked}
                likesCount={tanka.likes_count}
              />
              {user?.id === tanka.clerk_id && (
                <DeleteButton onClick={handleDelete}>削除</DeleteButton>
              )}
            </div>
          </div>
        </Card>

        <div className={styles.buttonGroup}>
          <ButtonGroup
            items={[
              {
                body: (
                  <div onClick={handleCopyLink} title="Copy link">
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </div>
                ),
              },
              {
                body: (
                  <div onClick={handleTweet} title="Share on X">
                    Share on 𝕏
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
