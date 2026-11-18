import { memo, useCallback } from 'react';

import { BurgerConstructorElementUI } from '@ui';
import { useDispatch } from '@services/store';
import {
  removeIngredient,
  moveIngredient,
} from '@slices/burgerConstructorSlice';

import type { BurgerConstructorElementProps } from './type';

export const BurgerConstructorElement = memo(function BurgerConstructorElement({
  ingredient,
  index,
  totalItems,
}: BurgerConstructorElementProps): React.JSX.Element {
  const dispatch = useDispatch();

  const handleMoveUp = useCallback((): void => {
    if (index === 0) return;
    dispatch(moveIngredient({ from: index, to: index - 1 }));
  }, [dispatch, index]);

  const handleMoveDown = useCallback((): void => {
    if (index === totalItems - 1) return;
    dispatch(moveIngredient({ from: index, to: index + 1 }));
  }, [dispatch, index, totalItems]);

  const handleClose = useCallback((): void => {
    dispatch(removeIngredient(ingredient.id));
  }, [dispatch, ingredient.id]);

  return (
    <BurgerConstructorElementUI
      ingredient={ingredient}
      index={index}
      totalItems={totalItems}
      handleMoveUp={handleMoveUp}
      handleMoveDown={handleMoveDown}
      handleClose={handleClose}
    />
  );
});
