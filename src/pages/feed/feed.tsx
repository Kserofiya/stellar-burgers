import { useEffect } from 'react';

import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useDispatch, useSelector } from '@services/store';
import {
  getFeeds,
  wsConnectionStart,
  wsConnectionClosed,
} from '@slices/feedSlice';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.feed.orders);
  const isLoading = useSelector((state) => state.feed.isLoading);

  useEffect(() => {
    // HTTP-запрос как страховка + WS для real-time
    dispatch(getFeeds());
    dispatch(wsConnectionStart());

    return () => {
      dispatch(wsConnectionClosed());
    };
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    dispatch(getFeeds());
    dispatch(wsConnectionClosed());
    dispatch(wsConnectionStart());
  };

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
