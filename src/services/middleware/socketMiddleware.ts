import type { Middleware, MiddlewareAPI, UnknownAction } from 'redux';

import type { AppDispatch, RootState } from '../store';

type TWsActions = {
  wsInit: string;
  onOpen: string;
  onClose: string;
  onError: string;
  onMessage: string;
};

type TWsAction = UnknownAction & {
  payload?: string;
};

export const socketMiddleware = (
  wsUrl: string,
  wsActions: TWsActions
): Middleware => {
  return ((store: MiddlewareAPI<AppDispatch, RootState>) => {
    let socket: WebSocket | null = null;

    return (next) => (action: TWsAction) => {
      const { dispatch } = store;
      const { type, payload } = action;
      const { wsInit, onOpen, onClose, onError, onMessage } = wsActions;

      if (type === wsInit) {
        if (socket) {
          closeSocket(socket);
          socket = null;
        }

        socket = new WebSocket(`${wsUrl}${payload ?? ''}`);

        socket.onopen = () => {
          dispatch({ type: onOpen });
        };

        socket.onerror = () => {
          dispatch({ type: onError, payload: 'Ошибка соединения' });
        };

        socket.onmessage = (event) => {
          const parsedData = JSON.parse(event.data);
          dispatch({ type: onMessage, payload: parsedData });
        };

        socket.onclose = () => {
          dispatch({ type: onClose });
          socket = null;
        };
      }

      if (type === onClose && socket) {
        closeSocket(socket);
        socket = null;
      }

      next(action);
    };
  }) as Middleware;
};

const closeSocket = (socket: WebSocket): void => {
  if (socket.readyState === WebSocket.CONNECTING) {
    socket.addEventListener('open', () => socket.close(), { once: true });
  } else if (
    socket.readyState === WebSocket.OPEN ||
    socket.readyState === WebSocket.CLOSING
  ) {
    socket.close();
  }
};
