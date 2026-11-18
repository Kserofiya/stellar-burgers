import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';
import { Preloader } from '@ui';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
}: TProtectedRouteProps): React.JSX.Element => {
  const user = useSelector((state) => state.user.user);
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);
  const location = useLocation();

  // Пока не знаем, авторизован ли пользователь — показываем прелоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Только для авторизованных, а пользователя нет — на /login
  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Только для НЕавторизованных, а пользователь уже вошёл — на главную или «откуда пришёл»
  if (onlyUnAuth && user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
