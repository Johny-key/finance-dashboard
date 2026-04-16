# PROJECT.md — Финансовый трекер

> Next.js 16 · Supabase · Tailwind CSS 4 · TypeScript  
> Дизайн-стиль: hear.ai (тёмная тема, glassmorphism, coral/teal акценты)

---

## 1. Архитектура приложения

```
Browser
  └── Next.js App Router (React 19, TypeScript)
        ├── Middleware        — защита маршрутов, редирект на /login
        ├── Server Components — загрузка данных, layouts, статичный контент
        ├── Client Components — интерактивность, формы, графики
        └── Supabase Client (JS SDK v2)
              ├── Auth     — email/password, сессии через cookies
              └── Database — PostgreSQL + RLS
```

### 1.1 Когда использовать Server vs Client компоненты

**Server Component** — используй по умолчанию. Подходит когда:
- Нужно загрузить данные из Supabase перед рендером
- Компонент не требует `useState`, `useEffect` или обработчиков событий
- Это layout, страница, список транзакций, статистика

**Client Component** (`"use client"`) — только когда необходимо:
- Форма с `useState` / `onChange`
- Модальное окно с локальным состоянием открытия/закрытия
- График (recharts требует браузерный DOM)
- Любое взаимодействие с пользователем в реальном времени

> **Правило**: делай страницу Server Component, который загружает данные и
> передаёт их через props в Client Component-обёртки (формы, графики).

### 1.2 Паттерн работы с данными

| Слой | Ответственность |
|------|----------------|
| `lib/supabase/server.ts` | Чтение данных в Server Components и Server Actions |
| `lib/supabase/client.ts` | Чтение данных в Client Components (если необходимо) |
| `app/actions/*.ts` | Все мутации: INSERT / UPDATE / DELETE через `"use server"` |
| `lib/utils/*.ts` | Чистые функции: форматирование, расчёты — **без Supabase** |
| `router.refresh()` | Обновление Server Components после мутации |

### 1.3 Где живёт бизнес-логика

- **`lib/utils/calculations.ts`** — чистые расчёты: баланс, норма сбережений,
  процент расходов. Принимают данные как аргументы, не обращаются к БД.
- **`app/actions/*.ts`** — валидация входных данных, запрос к Supabase,
  возврат `{ data, error }`. Вся логика, требующая БД, живёт здесь.
- **Компоненты** — только отображение. Никакой логики расчётов.

### 1.4 MVP-ограничения (намеренные упрощения)

- **Realtime НЕ реализуем в MVP.** Supabase Realtime — лишняя сложность
  на старте. Обновление данных обеспечивается через `router.refresh()`
  после Server Action. Этого достаточно.
- **Zustand и React Query НЕ нужны.** Данные загружаются в Server Components
  и передаются через props. Нет необходимости в глобальном state-менеджере.
  Если понадобится — добавим позже, не в MVP.

---

## 2. Структура базы данных (Supabase / PostgreSQL)

### Таблица `categories`

| Поле       | Тип         | Ограничения           | Описание                  |
|------------|-------------|----------------------|---------------------------|
| id         | uuid        | PK, DEFAULT gen_random_uuid() | Первичный ключ     |
| user_id    | uuid        | NOT NULL, FK → auth.users.id | Владелец           |
| name       | text        | NOT NULL              | Название категории        |
| color      | text        | NOT NULL, DEFAULT '#FF7056' | HEX-цвет          |
| icon       | text        | NULL                  | Имя иконки lucide-react   |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Дата создания           |

### Таблица `transactions`

| Поле        | Тип           | Ограничения                              | Описание               |
|-------------|---------------|------------------------------------------|------------------------|
| id          | uuid          | PK, DEFAULT gen_random_uuid()            | Первичный ключ         |
| user_id     | uuid          | NOT NULL, FK → auth.users.id             | Владелец               |
| category_id | uuid          | NULL, FK → categories.id ON DELETE SET NULL | Категория           |
| type        | text          | NOT NULL, CHECK IN ('income','expense')  | Тип транзакции         |
| amount      | numeric(14,2) | NOT NULL, CHECK > 0                      | Сумма (положительная)  |
| description | text          | NULL                                     | Описание               |
| date        | date          | NOT NULL, DEFAULT CURRENT_DATE           | Дата транзакции        |
| created_at  | timestamptz   | NOT NULL, DEFAULT now()                  | Дата создания записи   |

### Таблица `budgets`

| Поле         | Тип           | Ограничения                                     | Описание              |
|--------------|---------------|-------------------------------------------------|-----------------------|
| id           | uuid          | PK, DEFAULT gen_random_uuid()                   | Первичный ключ        |
| user_id      | uuid          | NOT NULL, FK → auth.users.id                    | Владелец              |
| category_id  | uuid          | NOT NULL, FK → categories.id ON DELETE CASCADE  | Категория             |
| month        | date          | NOT NULL, CHECK DAY = 1                         | Первый день месяца    |
| limit_amount | numeric(14,2) | NOT NULL, CHECK > 0                             | Лимит расходов        |
| created_at   | timestamptz   | NOT NULL, DEFAULT now()                         | Дата создания         |
|              |               | UNIQUE (user_id, category_id, month)            | Один бюджет/месяц     |

> **Важно:** `month` хранится как `date`, всегда первый день месяца
> (например, `'2026-04-01'`). Это позволяет использовать нативные
> date-функции PostgreSQL и правильно сортировать. Применяй CHECK:
> `EXTRACT(DAY FROM month) = 1`.
>
> В коде при создании бюджета передавай:
> ```typescript
> month: new Date(year, monthIndex, 1).toISOString().slice(0, 10) // '2026-04-01'
> ```

### 2.1 Индексы и производительность

Все dashboard-запросы фильтруют по `user_id` и агрегируют по месяцу.
Без индексов PostgreSQL делает sequential scan по всей таблице.

```sql
-- Покрывает: WHERE user_id = ? ORDER BY date DESC
-- Используется в: список транзакций, последние транзакции на дашборде
CREATE INDEX idx_transactions_user_date
  ON transactions(user_id, date DESC);

-- Покрывает: JOIN/GROUP BY category_id в агрегациях расходов
-- Используется в: расчёт бюджета, donut-чарт
CREATE INDEX idx_transactions_category
  ON transactions(category_id);

-- Покрывает: WHERE user_id = ? при загрузке категорий
-- Используется в: все страницы, которые грузят список категорий
CREATE INDEX idx_categories_user
  ON categories(user_id);
```

**Почему эти индексы?**
- `(user_id, date DESC)` — составной индекс покрывает самый частый запрос:
  «все транзакции этого пользователя за текущий месяц, свежие первыми».
  PostgreSQL не трогает остальные строки таблицы.
- `(category_id)` — ускоряет агрегации `GROUP BY category_id` при подсчёте
  расходов по категориям для бюджетов и графиков.
- `(user_id)` на categories — небольшая таблица, но запрашивается на каждой
  странице. Индекс убирает seq scan при большом числе пользователей.

### 2.2 Оптимизация запросов для Dashboard

Dashboard делает несколько запросов при загрузке. Все они должны быть
параллельными (`Promise.all`) и ограниченными по диапазону дат:

```typescript
// Пример: загрузка данных для дашборда — всё параллельно
const [transactions, categories, budgets] = await Promise.all([
  supabase
    .from('transactions')
    .select('*')
    .gte('date', startOfMonth)   // '2026-04-01'
    .lte('date', endOfMonth)     // '2026-04-30'
    .order('date', { ascending: false }),

  supabase.from('categories').select('*'),

  supabase
    .from('budgets')
    .select('*')
    .eq('month', startOfMonth),  // '2026-04-01'
]);
```

Агрегации (сумма доходов/расходов) считаются на клиенте в `lib/utils/calculations.ts`
из уже загруженных данных — не делаем лишних SQL-запросов.

### 2.3 RLS — безопасность на уровне строк

**Зачем RLS?**

Supabase anon key намеренно публичен — он встроен в браузерный JS-бандл.
Без RLS любой, кто знает твой URL и anon key, мог бы читать транзакции
всех пользователей напрямую через API. RLS делает это невозможным:
политики выполняются **внутри PostgreSQL** на каждый запрос, до того как
строки покидают БД. Даже баг в твоём коде не сможет вернуть чужие данные.

**Как работает:**
1. Supabase JS SDK автоматически передаёт JWT-токен текущего пользователя
   в каждый запрос.
2. PostgreSQL вызывает `auth.uid()` — возвращает ID из токена.
3. Политика `USING (auth.uid() = user_id)` фильтрует строки прямо в БД.
4. Если пользователь не залогинен — `auth.uid()` вернёт `null`,
   и ни одна строка не вернётся.

**Шаблон policies (одинаковый для всех трёх таблиц):**

```sql
-- categories: замени на transactions / budgets для остальных таблиц

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON categories
  FOR DELETE USING (auth.uid() = user_id);
```

> Никогда не отключай RLS и не создавай политику `FOR ALL USING (true)` —
> это сделает таблицу полностью открытой.

---

## 3. Структура файлов

```
finance-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx             # Страница входа (Server Component)
│   │   └── register/
│   │       └── page.tsx             # Страница регистрации
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Layout с Sidebar + Header
│   │   ├── page.tsx                 # Dashboard (Server Component, загружает данные)
│   │   ├── transactions/
│   │   │   └── page.tsx             # Список транзакций
│   │   ├── categories/
│   │   │   └── page.tsx             # Управление категориями
│   │   └── budget/
│   │       └── page.tsx             # Бюджет
│   ├── actions/
│   │   ├── transactions.ts          # Server Actions: add, delete транзакций
│   │   ├── categories.ts            # Server Actions: add, update, delete категорий
│   │   └── budgets.ts               # Server Actions: upsert бюджетов
│   ├── globals.css                  # Глобальные стили (готово)
│   └── layout.tsx                   # Root layout (html, body, lang)
│
├── components/
│   ├── ui/                          # Переиспользуемые primitive-компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx            # Client Component: форма входа
│   │   └── RegisterForm.tsx         # Client Component: форма регистрации
│   ├── dashboard/
│   │   ├── StatCard.tsx             # Карточка метрики (Server)
│   │   ├── BalanceHero.tsx          # Большой баланс (Server)
│   │   ├── RecentTransactions.tsx   # Последние транзакции (Server)
│   │   ├── CategoryPieChart.tsx     # Donut-чарт (Client — recharts)
│   │   └── SpendingAreaChart.tsx    # Area-чарт динамики (Client — recharts)
│   ├── transactions/
│   │   ├── TransactionList.tsx      # Server: список с props
│   │   ├── TransactionRow.tsx       # Server: одна строка
│   │   ├── TransactionFilters.tsx   # Client: select/input фильтры
│   │   └── AddTransactionModal.tsx  # Client: форма + модалка
│   ├── categories/
│   │   ├── CategoryList.tsx         # Server
│   │   └── CategoryForm.tsx         # Client: форма создания/редактирования
│   ├── budget/
│   │   ├── BudgetList.tsx           # Server
│   │   ├── BudgetProgressBar.tsx    # Server: полоса прогресса
│   │   └── SetBudgetModal.tsx       # Client: форма установки лимита
│   ├── layout/
│   │   ├── Sidebar.tsx              # Client: навигация с активным состоянием
│   │   └── Header.tsx               # Client: кнопка добавления, имя страницы
│   └── providers/
│       └── SupabaseProvider.tsx     # Передаёт сессию в дочерние компоненты
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # createBrowserClient (для Client Components)
│   │   ├── server.ts                # createServerClient + cookies (Server/Actions)
│   │   └── middleware.ts            # updateSession (для middleware.ts)
│   └── utils/
│       ├── currency.ts              # formatRub(amount): '₽ 12 500'
│       ├── date.ts                  # getMonthRange(), formatDate(), monthToDate()
│       └── calculations.ts          # calcBalance(), calcSavingsRate(), isOverBudget()
│
├── types/
│   └── database.ts                  # TypeScript-типы: Transaction, Category, Budget
│
├── middleware.ts                    # Защита маршрутов (корень проекта)
├── .env.local                       # Ключи (не в git)
├── PROJECT.md
└── SETUP.md
```

---

## 4. Ключевые фичи

### 4.1 Авторизация
- Supabase Auth с email/password
- Сессии через httpOnly cookies (SSR-совместимо, безопасно)
- Middleware проверяет сессию на каждый запрос:
  - нет сессии → редирект на `/login`
  - есть сессия, запрос на `/login` → редирект на `/`
- После логина → `/` (dashboard)
- Выход — Server Action, очищает сессию и редиректит на `/login`

### 4.2 Dashboard
- **BalanceHero** — баланс текущего месяца (доходы − расходы)
- **StatCards** — 4 карточки: Баланс, Доходы, Расходы, Норма сбережений
- **CategoryPieChart** — donut-чарт распределения расходов
- **SpendingAreaChart** — area-чарт динамики за последние 6 месяцев
- **RecentTransactions** — последние 10 транзакций

### 4.3 Транзакции
- Список с пагинацией (20/страница)
- Фильтры: тип, категория, диапазон дат
- Поиск по описанию
- Добавить транзакцию (модальное окно)
- Удалить транзакцию

### 4.4 Категории
- Создать / переименовать / удалить
- Выбрать цвет из палитры
- Защита: если у категории есть транзакции — предупреждение перед удалением

### 4.5 Бюджет
- Установить лимит по категории на месяц
- Progress bar: потрачено / лимит
- Amber warning если > 80%, coral error если > 100%
- Итоговая строка: суммарный лимит vs суммарные расходы

---

## 5. Бизнес-логика

Все функции живут в `lib/utils/calculations.ts`. Принимают массивы данных,
не делают запросов к БД.

```typescript
// Баланс за период
balance = Σ(income.amount) − Σ(expense.amount)

// Норма сбережений (0 если нет доходов)
savingsRate = income > 0 ? (balance / income) * 100 : 0

// Расходы по категории
categorySpent = Σ(expense.amount WHERE category_id = id)

// Превышение бюджета
isOverBudget  = categorySpent > budget.limit_amount
isNearBudget  = categorySpent > budget.limit_amount * 0.8  && !isOverBudget

// Процент расходов категории от общих
categoryPct = totalExpenses > 0 ? (categorySpent / totalExpenses) * 100 : 0
```

---

## 6. Обработка ошибок

### 6.1 Паттерн Server Actions

Все Server Actions возвращают единый тип результата:

```typescript
type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string };
```

Внутри Action:
1. Валидируй входные данные (пустые поля, диапазоны чисел)
2. Проверь авторизацию (`getUser()` — не полагайся только на RLS)
3. Выполни запрос Supabase
4. Верни `{ success: false, error: '...' }` при любой ошибке — никогда не
   бросай исключение из Action (это ломает Client Component)

### 6.2 Типичные ошибки Auth

| Код ошибки Supabase          | Что показать пользователю          |
|------------------------------|------------------------------------|
| `invalid_credentials`        | Неверный email или пароль          |
| `user_already_exists`        | Пользователь с таким email уже существует |
| `weak_password`              | Пароль слишком короткий (мин. 6 символов) |
| `email_not_confirmed`        | Подтвердите email (если включено)  |
| Нет соединения / 5xx         | Ошибка сервера, попробуйте позже   |

### 6.3 Типичные ошибки базы данных

| Ситуация                     | Как обработать                     |
|------------------------------|------------------------------------|
| Нарушение UNIQUE constraint  | «Бюджет на этот месяц уже задан»   |
| FK violation (category_id)   | «Выбери категорию перед сохранением» |
| RLS rejection (пустой результат) | Не ошибка — просто пустой список |
| `amount <= 0`                | Валидируй на клиенте до отправки   |

### 6.4 Пользовательский фидбэк (Toasts)

В MVP используем минималистичный toast без сторонних библиотек:
- Храним `{ message, type }` в `useState` внутри компонента формы
- Показываем маленький баннер под формой на 3 секунды
- Цвета: teal = успех, coral = ошибка, amber = предупреждение

Если понадобится глобальный toast — подключить `sonner` (маленький, без
зависимостей). Это не MVP-задача.

---

## 7. Дизайн-система (hear.ai стиль)

### Цвета
```
--bg:           #181818   тёмный фон
--bg-card:      #212121   карточки
--bg-elevated:  #2A2A2A   возвышенные элементы
--coral:        #FF7056   основной акцент (кнопки, активные состояния)
--teal:         #3BE8D0   вторичный акцент (доходы, успех)
--amber:        #FF9F43   предупреждения (> 80% бюджета)
--text-primary: #E4E3D9   основной текст (тёплый жемчужный)
--text-muted:   #4a5565   второстепенный текст
```

### Компоненты
- **Карточки**: `rounded-2xl`, border `rgba(228,227,217,0.08)`, inner highlight
- **Кнопки**: `rounded-[100px]` (pill-форма), coral gradient, тёмный текст
- **Инпуты**: `rounded-xl`, тёмный фон, тёплая рамка при фокусе
- **Модалки**: glassmorphism backdrop (`backdrop-blur`), `scale-in` анимация
- **Бейджи**: маленькие pill-бейджи с цветом категории

### Шрифты
- Body: **Inter** (enterprise, читаемость)
- Числа: **DM Mono** (моноширинный, для выравнивания)
- Заголовки: **DM Serif Display** (display, акцент)

---

## 8. План реализации по шагам

### Шаг 1 — Инфраструктура Supabase
1. Создать проект в Supabase
2. Выполнить SQL из `SETUP.md`: таблицы + индексы + RLS
3. Seed: добавить дефолтные категории (для теста)
4. Получить ключи API

### Шаг 2 — Next.js + Supabase интеграция
1. `npm install @supabase/ssr @supabase/supabase-js`
2. Создать `lib/supabase/{client,server,middleware}.ts`
3. Настроить `middleware.ts` (корень)
4. Создать `.env.local`

### Шаг 3 — Авторизация
1. Страницы `/login` и `/register`
2. Server Actions: `signIn`, `signUp`, `signOut`
3. Редиректы (Middleware)

### Шаг 4 — Layout
1. Root layout (html/body, lang="ru")
2. Dashboard layout: Sidebar + Header
3. Базовая адаптивность

### Шаг 5 — Dashboard
1. Server Component: `Promise.all` загрузка данных
2. StatCards, BalanceHero
3. Charts: CategoryPieChart, SpendingAreaChart
4. RecentTransactions

### Шаг 6 — CRUD транзакций
1. Server Actions: `addTransaction`, `deleteTransaction`
2. AddTransactionModal (Client)
3. TransactionList + Filters

### Шаг 7 — Категории
1. Server Actions: `addCategory`, `updateCategory`, `deleteCategory`
2. CategoryList + CategoryForm

### Шаг 8 — Бюджет
1. Server Action: `upsertBudget`
2. BudgetList с прогресс-барами и warning-логикой

### Шаг 9 — Полировка
1. Loading states (skeleton-заглушки)
2. Error states в формах
3. Toast-уведомления
4. Анимации (float-up, scale-in)

### Шаг 10 — Деплой
1. Push в GitHub
2. Vercel: импорт репозитория + env variables
3. Supabase: обновить Site URL
