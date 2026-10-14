import { useEffect } from 'react';

import { ProfileOrdersUI } from '@ui-pages';
import { useDispatch, useSelector } from '@services/store';
import { getCookie } from '@utils/cookie';
import {
  getProfileOrders,
  ordersWsConnectionStart,
  ordersWsConnectionClosed,
} from '@slices/ordersSlice';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);

  useEffect(() => {
    const token = getCookie('accessToken');
    dispatch(getProfileOrders());
    dispatch(ordersWsConnectionStart(token ? `?token=${token}` : ''));

    return () => {
      dispatch(ordersWsConnectionClosed());
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
