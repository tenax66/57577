import { useState, useEffect, Fragment } from 'react';
import styles from '@/App.module.scss';
import type { TankaWithLikes, PaginationInfo } from './types/types';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { jaJP } from './localization/ja-JP';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserPage } from './components/UserPage';
import { TankaPage } from './components/TankaPage';
import { Header } from './components/Header/Header';
import { LikeButton } from './components/LikeButton';
import { PostTankaModal } from './components/PostTankaModal';
import Button from './components/Button';
import Card from './components/Card';
import BlockLoader from './components/BlockLoader';
import Divider from './components/Divider';
import Grid from './components/Grid';
import Row from './components/Row';
import SearchPage from './components/SearchPage';
import Table from './components/Table';
import TableRow from './components/TableRow';
import TableColumn from './components/TableColumn';
import TermsOfService from './components/TermsOfService';
import TextArea from './components/TextArea';
import PrivacyPolicy from './components/PrivacyPolicy';
import { CookieConsentBanner } from './components/CookieConsent/CookieConsent';
import CookiePolicy from './components/CookiePolicy';
import { AccountManagePage } from './components/AccountManagePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import AlertBanner from './components/AlertBanner';
import Select from './components/Select';

type APIResponse = {
  tankas: TankaWithLikes[];
  pagination: PaginationInfo;
};

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} localization={jaJP}>
      <Router>
        <Routes>
          <Route path="/" element={<TankaApp />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/users/:userId" element={<UserPage />} />
          <Route element={<ProtectedRoute requireAuth={true} requireOwnership={true} />}>
            <Route path="/users/:userId/manage" element={<AccountManagePage />} />
          </Route>
          <Route path="/tankas/:tankaId" element={<TankaPage />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
        </Routes>
        <CookieConsentBanner />
      </Router>
    </ClerkProvider>
  );
};

const TankaApp = () => {
  const [tankas, setTankas] = useState<TankaWithLikes[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('created_at');

  useEffect(() => {
    const fetchTankas = async () => {
      try {
        const response = await fetch(`/api/tankas?page=${currentPage}&sort_by=${sortBy}`);
        if (!response.ok) throw new Error('Failed to fetch tankas');
        const data = (await response.json()) as APIResponse;
        setTankas(data.tankas);
        setPagination(data.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTankas();
  }, [currentPage, sortBy]);

  const handleSubmit = async (content: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/tankas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          clerk_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to post tanka');

      // 投稿成功後に短歌一覧を再取得（sort_byパラメータを追加）
      const data = (await (
        await fetch(`/api/tankas?page=${currentPage}&sort_by=${sortBy}`)
      ).json()) as APIResponse;
      setTankas(data.tankas);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : '短歌の投稿に失敗しました');
    }
  };

  // ソート順変更のハンドラー
  const handleSortChange = (selectedValue: string) => {
    setSortBy(selectedValue);
    setCurrentPage(1); // ソート順変更時にページを1に戻す
  };

  // オプションの表示名マッピング
  const sortOptions = [
    { value: 'created_at', label: '新着順' },
    { value: 'likes', label: '人気順' },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <Grid>
        <Row>
          <TextArea
            autoPlay="57577.netは短歌投稿サイトです。"
            autoPlaySpeedMS={50}
            disabled={true}
            isBlink={true}
          />
        </Row>
      </Grid>
      <AlertBanner>
        🚧 ベータテスト中です。ユーザや短歌のデータは予告なく削除されることがあります。
      </AlertBanner>

      <main>
        <Card title="最新の短歌" style={{ padding: '0.5rem', marginTop: '1.5rem' }}>
          <div className={styles.sortSelector}>
            <Select
              name="sort-select"
              options={sortOptions.map(option => option.label)}
              defaultValue={sortOptions.find(option => option.value === sortBy)?.label || ''}
              onChange={selectedLabel => {
                const option = sortOptions.find(option => option.label === selectedLabel);
                if (option) {
                  handleSortChange(option.value);
                }
              }}
            />
          </div>
          <div className={styles.tankaBox}>
            {isLoading ? (
              <p>
                Loading <BlockLoader mode={6} />
              </p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : (
              <>
                {tankas.map(tanka => (
                  <Fragment key={tanka.id}>
                    <div className={styles.tankaBlock}>
                      <Table>
                        <TableRow>
                          <TableColumn>
                            <div className={styles.columnContent}>
                              <Link to={`/tankas/${tanka.id}`} className={styles.tankaLink}>
                                <p>{tanka.content}</p>
                              </Link>
                            </div>
                          </TableColumn>
                        </TableRow>
                        <TableRow>
                          <TableColumn className={styles.metadataColumn}>
                            <div className={styles.metadataRow}>
                              <Link to={`/users/${tanka.clerk_id}`}>{tanka.display_name}</Link>
                              <div className={styles.rightAlignedItems}>
                                <span>
                                  {new Date(tanka.created_at).toISOString().split('T')[0]}
                                </span>
                                <LikeButton
                                  tankaId={tanka.id}
                                  initialLiked={tanka.is_liked}
                                  likesCount={tanka.likes_count}
                                />
                              </div>
                            </div>
                          </TableColumn>
                        </TableRow>
                      </Table>
                    </div>
                    <Divider />
                  </Fragment>
                ))}

                {pagination && (
                  <div className={styles.pagination}>
                    <Button
                      onClick={() => setCurrentPage(p => p - 1)}
                      isDisabled={currentPage === 1}
                    >
                      前のページ
                    </Button>
                    <span className={styles.pageInfo}>{currentPage}</span>
                    <Button
                      onClick={() => setCurrentPage(p => p + 1)}
                      isDisabled={!pagination.has_next}
                    >
                      次のページ
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </main>

      <Button
        onClick={() => setIsModalOpen(true)}
        className={styles.floatingButton}
        disabled={!user}
        title={user ? undefined : 'ログインが必要です'}
      >
        投稿
      </Button>

      <PostTankaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default App;
