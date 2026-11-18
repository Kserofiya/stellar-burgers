import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', { url: '**/api/ingredients' });
    await page.routeFromHAR('tests/hars/user.har', { url: '**/api/auth/user' });
    await page.routeFromHAR('tests/hars/orders.har', { url: '**/api/orders' });

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    await page.context().addCookies([
      { name: 'accessToken', value: 'mock-access-token', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/');
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();
  });

  test('Добавление ингредиента из списка в конструктор', async ({ page }) => {
    await page.locator('li').filter({ hasText: 'Краторная булка N-200i' }).getByRole('button', { name: 'Добавить' }).click();
    await page.locator('li').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('2934', { exact: true })).toBeVisible();
  });

  test('Работа модальных окон ингредиента', async ({ page }) => {
    await page.getByText('Краторная булка N-200i').click();

    const modal = page.locator('div').filter({ has: page.locator('h3', { hasText: 'Детали ингредиента' }) });

    await expect(modal.getByText('Краторная булка N-200i')).toBeVisible();
    await expect(modal.getByText('Калории, ккал')).toBeVisible();
    await expect(modal.getByText('420')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

    // Открываем снова и закрываем по оверлею
    await page.getByText('Краторная булка N-200i').click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();

    // Клик по оверлею
    await page.mouse.click(10, 10);
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('Создание заказа', async ({ page }) => {
    await page.locator('li').filter({ hasText: 'Краторная булка N-200i' }).getByRole('button', { name: 'Добавить' }).click();
    await page.locator('li').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).getByRole('button', { name: 'Добавить' }).click();

    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    const modal = page.locator('div').filter({ has: page.getByRole('button', { name: 'Закрыть' }) });

    await expect(modal.locator('h2')).toHaveText('98765');
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(page.getByRole('button', { name: 'Закрыть' })).not.toBeVisible();

    const constructorSection = page.locator('section').filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });
    await expect(constructorSection.getByText(/Краторная булка N-200i/)).not.toBeVisible();
    await expect(constructorSection.getByText(/Биокотлета из марсианской Магнолии/)).not.toBeVisible();
    await expect(constructorSection.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructorSection.getByText('Выберите начинку')).toHaveCount(1);
    await expect(page.getByText('2934', { exact: true })).not.toBeVisible();
    await expect(page.getByText('0', { exact: true })).toBeVisible();
  });
});
