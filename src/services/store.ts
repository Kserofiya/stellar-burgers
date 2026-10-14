import { configureStore } from '@reduxjs/toolkit';
import {
  useDispatch as dispatchHook,
  useSelector as selectorHook,
} from 'react-redux';

import { rootReducer } from './rootReducer';
import { socketMiddleware } from './middleware/socketMiddleware';
import {
  wsConnectionStart as feedWsStart,
  wsConnectionSuccess as feedWsSuccess,
  wsConnectionClosed as feedWsClose,
  wsConnectionError as feedWsError,
  wsGetMessage as feedWsMessage,
} from './slices/feedSlice';
import {
  ordersWsConnectionStart,
  ordersWsConnectionSuccess,
  ordersWsConnectionClosed,
  ordersWsConnectionError,
  ordersWsGetMessage,
} from './slices/ordersSlice';

const WS_FEED_URL = 'wss://norma.ffapi.ru/orders/all';
const WS_ORDERS_URL = 'wss://norma.ffapi.ru/orders';

const feedMiddleware = socketMiddleware(WS_FEED_URL, {
  wsInit: feedWsStart.type,
  onOpen: feedWsSuccess.type,
  onClose: feedWsClose.type,
  onError: feedWsError.type,
  onMessage: feedWsMessage.type,
});

const ordersMiddleware = socketMiddleware(WS_ORDERS_URL, {
  wsInit: ordersWsConnectionStart.type,
  onOpen: ordersWsConnectionSuccess.type,
  onClose: ordersWsConnectionClosed.type,
  onError: ordersWsConnectionError.type,
  onMessage: ordersWsGetMessage.type,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(feedMiddleware, ordersMiddleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = dispatchHook.withTypes<AppDispatch>();
export const useSelector = selectorHook.withTypes<RootState>();

export default store;
