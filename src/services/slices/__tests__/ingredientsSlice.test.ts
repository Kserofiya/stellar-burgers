import { ingredientsSlice, getIngredients } from '../ingredientsSlice';
import type { TIngredient } from '@utils-types';

describe('Тестирование редьюсера ingredientsSlice', () => {
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null,
  };

  const mockIngredients: TIngredient[] = [
    {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      proteins: 10,
      fat: 5,
      carbohydrates: 20,
      calories: 100,
      price: 50,
      image: 'image.png',
      image_mobile: 'image_mobile.png',
      image_large: 'image_large.png',
    },
  ];

  it('должен вернуть начальное состояние при undefined и неизвестном экшене', () => {
    const state = ingredientsSlice.reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  it('должен устанавливать isLoading = true при getIngredients.pending', () => {
    const state = ingredientsSlice.reducer(initialState, getIngredients.pending(''));
    expect(state).toEqual({
      ...initialState,
      isLoading: true,
      error: null,
    });
  });

  it('должен сохранять ингредиенты и isLoading = false при getIngredients.fulfilled', () => {
    const state = ingredientsSlice.reducer(
      { ...initialState, isLoading: true },
      getIngredients.fulfilled(mockIngredients, '')
    );
    expect(state).toEqual({
      ...initialState,
      ingredients: mockIngredients,
      isLoading: false,
    });
  });

  it('должен сохранять ошибку и isLoading = false при getIngredients.rejected', () => {
    const error = { message: 'Ошибка загрузки' };
    const state = ingredientsSlice.reducer(
      { ...initialState, isLoading: true },
      getIngredients.rejected(new Error('Ошибка загрузки'), '')
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeDefined();
  });
});
