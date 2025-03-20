import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchPage.module.scss';
import { Header } from './Header/Header';
import { SearchResult } from '../types/search';
import TableRow from './TableRow';
import TableColumn from './TableColumn';
import { LikeButton } from './LikeButton';
import Card from './Card';
import Button from './Button';

type SearchResponse = {
  tankas: SearchResult[];
  total: number;
  page: number;
  per_page: number;
};

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }
      const data = (await response.json()) as SearchResponse;
      setResults(data.tankas); // APIのレスポンス構造に合わせて修正
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
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
          <div className={styles.results}>
            <table className={styles.table}>
              <tbody>
                {results.map(result => (
                  <TableRow key={result.id}>
                    <TableColumn>
                      <div className={styles.tankaContent}>
                        <Link to={`/tankas/${result.id}`} className={styles.tankaLink}>
                          {result.content}
                        </Link>
                        <div className={styles.tankaMetadata}>
                          <Link to={`/users/${result.clerk_id}`} className={styles.authorLink}>
                            {result.display_name}
                          </Link>
                          <span className={styles.date}>
                            {new Date(result.created_at).toISOString().split('T')[0]}
                          </span>
                          <LikeButton
                            tankaId={result.id}
                            initialLiked={false}
                            likesCount={result.likes_count}
                          />
                        </div>
                      </div>
                    </TableColumn>
                  </TableRow>
                ))}
              </tbody>
            </table>
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
