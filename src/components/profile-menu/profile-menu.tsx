import { useNavigate, useLocation } from 'react-router-dom';

import { ProfileMenuUI } from '@ui';
import { useDispatch } from '@services/store';
import { logoutUser } from '@slices/userSlice';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate('/login', { replace: true });
      })
      .catch(() => {
      });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
