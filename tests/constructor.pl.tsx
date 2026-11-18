import { test, expect } from '@playwright/test';

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/ingredients', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: '1', name: 'Краторная булка N-200i', type: 'bun',
              proteins: 80, fat: 24, carbohydrates: 53, calories: 420, price: 1255,
              image: 'https://code.s3.yandex.net/react/code/bun-02.png',
              image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
              image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png', __v: 0,
            },
            {
              _id: '2', name: 'Биокотлета из марсианской Магнолии', type: 'main',
              proteins: 420, fat: 142, carbohydrates: 242, calories: 4242, price: 424,
              image: 'https://code.s3.yandex.net/react/code/meat-01.png',
              image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
              image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png', __v: 0,
            }
          ]
        })
      });
    });

    await page.goto('/');
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();
  });

  test('Добавление ингредиента из списка в конструктор', async ({ page }) => {
    // Находим карточку булки и добавляем её
    const bunCard = page.locator('li').filter({ hasText: 'Краторная булка N-200i' }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    // Находим карточку начинки и добавляем её
    const mainCard = page.locator('li').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    // Проверяем, что цена обновилась: Булка (1255 * 2) + Начинка (424) = 2934
    await expect(page.getByText('2934', { exact: true })).toBeVisible();
  });

  test('Работа модальных окон ингредиента', async ({ page }) => {
    // 1. Открытие модального окна
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();

    // Проверяем, что в модалке отображаются данные ИМЕННО ТОГО ингредиента, по которому кликнули
    await expect(page.getByText('Краторная булка N-200i').last()).toBeVisible();
    await expect(page.getByText('Калории, ккал')).toBeVisible();
    await expect(page.getByText('420')).toBeVisible(); // Проверяем калории этой булки

    // 2. Закрытие по крестику
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await closeButton.click();
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();

    // 3. Закрытие по оверлею (клик в верхний левый угол экрана)
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('Создание заказа', async ({ page }) => {
    // 1. Мокаем данные пользователя
    await page.route('**/api/auth/user', (route) => {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { email: 'test@test.ru', name: 'Test' } }),
      });
    });

    // 2. Мокаем создание заказа
    await page.route('**/api/orders', (route) => {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, order: { number: 98765 } }),
      });
    });

    // 3. Подставляем фейковые токены авторизации в localStorage и cookie
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    await page.context().addCookies([{
        name: 'accessToken', value: 'mock-access-token', domain: 'localhost', path: '/',
    }]);

    // 4. Перезагружаем страницу, чтобы приложение подхватило токены
    await page.reload();
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();

    // 5. Собираем бургер
    const bunCard = page.locator('li').filter({ hasText: 'Краторная булка N-200i' }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const mainCard = page.locator('li').filter({ hasText: 'Биокотлета из марсианской Магнолии' }).first();
    await mainCard.getByRole('button', { name: 'Добавить' }).click();

    // 6. Кликаем "Оформить заказ"
    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    // 7. Проверяем модалку с верным номером заказа
    await expect(page.getByText(/98765/)).toBeVisible();
    await expect(page.getByText('идентификатор заказа')).toBeVisible();

    // 8. Закрываем модалку и проверяем, что она закрылась
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await closeButton.click();
    await expect(page.getByText(/98765/)).not.toBeVisible();

    // 9. Проверяем, что конструктор пуст (цена сбросилась)
    await expect(page.getByText('2934', { exact: true })).not.toBeVisible();
    await expect(page.getByText('0', { exact: true })).toBeVisible();
  });
});
