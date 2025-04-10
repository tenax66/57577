import { useState, useEffect } from 'react';
import styles from './SearchPage.module.scss';

import Card from './Card';
import Button from './Button';
import TankaList from './TankaList';
import type { TankaWithLikes } from '../types/types';

type SearchResponse = {
  tankas: TankaWithLikes[];
  total: number;
  page: number;
  per_page: number;
};

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TankaWithLikes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 検索クエリが変更されたときに自動的に検索を実行
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 500); // 500ミリ秒のディレイを設定

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }
      const data = (await response.json()) as SearchResponse;
      setResults(data.tankas);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // 削除機能は検索結果では使用しないためダミー関数を用意
  const handleDelete = () => {};

  return (
    <div className={styles.container}>
      <Card title="検索">
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="短歌の一部を入力"
            className={styles.searchInput}
          />
          <Button type="submit" disabled={isLoading} style={{ width: 'auto', minWidth: '80px' }}>
            検索
          </Button>
        </form>

        {isLoading && <div className={styles.loading}>検索中...</div>}

        {error && <div className={styles.error}>{error}</div>}

        {results.length > 0 ? (
          <div className={styles.searchResults}>
            <TankaList
              tankas={results}
              isLoading={false}
              error={null}
              isOwnProfile={false}
              onDelete={handleDelete}
              pagination={null}
              currentPage={1}
              setCurrentPage={() => {}}
            />
          </div>
        ) : (
          !isLoading &&
          searchQuery && <div className={styles.noResults}>検索結果が見つかりませんでした</div>
        )}
      </Card>
    </div>
  );
};

export default SearchPage;
