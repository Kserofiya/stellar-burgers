import {
  burgerConstructorSlice,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} from '../burgerConstructorSlice';
import type { TIngredient } from '@utils-types';

describe('Тестирование редьюсера burgerConstructorSlice', () => {
  const initialState = {
    bun: null,
    ingredients: [],
  };

  const mockBun: TIngredient = {
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
  };

  const mockIngredient: TIngredient = {
    ...mockBun,
    _id: '2',
    name: 'Начинка',
    type: 'main',
  };

  it('должен вернуть начальное состояние при undefined и неизвестном экшене', () => {
    const state = burgerConstructorSlice.reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  it('должен добавлять булку в конструктор', () => {
    const action = addIngredient(mockBun);
    const state = burgerConstructorSlice.reducer(initialState, action);

    expect(state.bun).toBeDefined();
    expect(state.bun?.name).toBe(mockBun.name);
    expect(state.ingredients).toEqual([]);
  });

  it('должен добавлять начинку в конструктор', () => {
    const action = addIngredient(mockIngredient);
    const state = burgerConstructorSlice.reducer(initialState, action);

    expect(state.bun).toBeNull();
    expect(state.ingredients.length).toBe(1);
    expect(state.ingredients[0].name).toBe(mockIngredient.name);
  });

  it('должен удалять ингредиент по id', () => {
    const addAction = addIngredient(mockIngredient);
    const stateWithIngredient = burgerConstructorSlice.reducer(initialState, addAction);
    const idToRemove = stateWithIngredient.ingredients[0].id;

    const state = burgerConstructorSlice.reducer(stateWithIngredient, removeIngredient(idToRemove));
    expect(state.ingredients).toEqual([]);
  });

  it('должен перемещать ингредиенты', () => {
    let state = burgerConstructorSlice.reducer(initialState, addIngredient(mockIngredient));
    state = burgerConstructorSlice.reducer(state, addIngredient({ ...mockIngredient, _id: '3', name: 'Второй' }));

    expect(state.ingredients[0].name).toBe('Начинка');
    expect(state.ingredients[1].name).toBe('Второй');

    const moveAction = moveIngredient({ from: 1, to: 0 });
    const stateMoved = burgerConstructorSlice.reducer(state, moveAction);

    expect(stateMoved.ingredients[0].name).toBe('Второй');
    expect(stateMoved.ingredients[1].name).toBe('Начинка');
  });

  it('должен очищать конструктор', () => {
    const stateWithBun = burgerConstructorSlice.reducer(initialState, addIngredient(mockBun));
    const stateWithIngredient = burgerConstructorSlice.reducer(stateWithBun, addIngredient(mockIngredient));

    const state = burgerConstructorSlice.reducer(stateWithIngredient, clearConstructor());
    expect(state).toEqual(initialState);
  });
});
