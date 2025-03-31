import { useState, useEffect } from 'react';
import { Header } from './Header/Header';
import styles from './RankingPage.module.scss';
import Card from './Card';
import TankaList from './TankaList';
import type { TankaWithLikes, PaginationInfo } from '../types/types';
import Select from '../components/Select';

type RankingResponse = {
  tankas: TankaWithLikes[];
  pagination: PaginationInfo;
};

type PeriodOption = {
  value: string;
  label: string;
};

const RankingPage = () => {
  const [tankas, setTankas] = useState<TankaWithLikes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState<string>('week');

  const periodOptions: PeriodOption[] = [
    { value: 'week', label: '今週' },
    { value: 'month', label: '今月' },
    { value: 'all', label: '全期間' },
  ];

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ranking?page=${currentPage}&period=${period}`);
        if (!response.ok) {
          throw new Error('ランキングの取得に失敗しました');
        }
        const data = (await response.json()) as RankingResponse;
        setTankas(data.tankas);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setError(err instanceof Error ? err.message : 'ランキングの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, [currentPage, period]);

  const handlePeriodChange = (selectedLabel: string) => {
    const option = periodOptions.find(option => option.label === selectedLabel);
    if (option) {
      setPeriod(option.value);
      setCurrentPage(1); // 期間変更時にページを1に戻す
    }
  };

  // 削除機能はランキングページでは使用しないためダミー関数を用意
  const handleDelete = () => {};

  return (
    <div className={styles.rankingPage}>
      <Header />
      <main>
        <Card title="ランキング" style={{ padding: '0.5rem', marginTop: '1.5rem' }}>
          <div className={styles.periodSelector}>
            <Select
              name="period-select"
              options={periodOptions.map(option => option.label)}
              defaultValue={periodOptions.find(option => option.value === period)?.label || ''}
              onChange={handlePeriodChange}
            />
          </div>

          <TankaList
            tankas={tankas}
            isLoading={isLoading}
            error={error}
            isOwnProfile={false}
            onDelete={handleDelete}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            showRank={true}
          />
        </Card>
      </main>
    </div>
  );
};

export default RankingPage;
