import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import BlockLoader from './BlockLoader';

type ProtectedRouteProps = {
  requireAuth?: boolean;
  requireOwnership?: boolean;
};

export const ProtectedRoute = ({
  requireAuth = true,
  requireOwnership = false,
}: ProtectedRouteProps) => {
  const { user, isLoaded } = useUser();
  const { userId } = useParams<{ userId: string }>();

  // ロード中は何も表示しない（またはローダーを表示）
  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <BlockLoader mode={6} />
      </div>
    );
  }

  // 認証が必要なのに未ログインの場合
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  // 所有権が必要なのに、自分のリソースでない場合
  if (requireOwnership && user?.id !== userId) {
    return <Navigate to="/" replace />;
  }

  // 条件を満たしていればコンテンツを表示
  return <Outlet />;
};
