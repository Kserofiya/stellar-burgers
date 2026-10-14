import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Preloader, OrderInfoUI } from '@ui';
import { useDispatch, useSelector } from '@services/store';
import { getOrderByNumber } from '@slices/orderSlice';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);
  const dispatch = useDispatch();

  // Ищем заказ в трёх местах по приоритету
  const orderData = useSelector((state) => {
    if (state.order.currentOrder?.number === orderNumber) {
      return state.order.currentOrder;
    }
    const fromFeed = state.feed.orders.find((o) => o.number === orderNumber);
    if (fromFeed) return fromFeed;
    const fromOrders = state.orders.orders.find((o) => o.number === orderNumber);
    return fromOrders;
  });

  const ingredients = useSelector((state) => state.ingredients.ingredients);

  // Если заказа нет нигде — дозапрашиваем
  useEffect(() => {
    if (!orderData && orderNumber) {
      dispatch(getOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<
      string,
      TIngredient & { count: number }
    >;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = { ...ingredient, count: 1 };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
