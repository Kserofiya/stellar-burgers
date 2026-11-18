import type { TOrder } from '@utils-types';

export type FeedUIProps = {
  orders: TOrder[];
  isLoading: boolean;
  handleGetFeeds: () => void;
};
