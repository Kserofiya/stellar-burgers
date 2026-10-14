import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';

import { getOrdersApi } from '@api';
import type { TOrder } from '@utils-types';

type TOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: SerializedError | string | null;
};

const initialState: TOrdersState = {
  orders: [],
  isLoading: false,
  error: null,
};

export const getProfileOrders = createAsyncThunk(
  'orders/getProfileOrders',
  async () => getOrdersApi()
);

// createAction — чтобы payload был string, а не void
export const ordersWsConnectionStart = createAction<string>(
  'orders/wsConnectionStart'
);

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    wsConnectionSuccess: (state) => {
      state.isLoading = false;
    },
    wsConnectionError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    wsConnectionClosed: (state) => {
      state.isLoading = false;
    },
    wsGetMessage: (state, action: PayloadAction<TOrder[]>) => {
      state.orders = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const {
  wsConnectionSuccess: ordersWsConnectionSuccess,
  wsConnectionError: ordersWsConnectionError,
  wsConnectionClosed: ordersWsConnectionClosed,
  wsGetMessage: ordersWsGetMessage,
} = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;
