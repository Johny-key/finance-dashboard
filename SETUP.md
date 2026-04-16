# SETUP.md — Настройка и запуск проекта

---

## 1. Переменные окружения

Создай файл `.env.local` в корне проекта:

```env
# Supabase — URL проекта
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

# Supabase — Anon public key (безопасен для браузера, RLS всё защищает)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Где взять:** Supabase Dashboard → Settings → API →
> Project URL + anon/public key.

### Почему anon key безопасен

Anon key — это публичный JWT без прав admin. Он намеренно предназначен для
встраивания в браузерный код. Безопасность обеспечивается RLS-политиками
в PostgreSQL: каждый запрос с anon key видит только строки, где
`user_id = auth.uid()`. Без валидного JWT пользователя данные недоступны.

**Никогда не добавляй `service_role` ключ в браузерный код или `.env.local`.**
Этот ключ обходит RLS и предназначен только для серверных admin-операций.
Если нужен — добавляй только в Vercel Environment Variables (без префикса
`NEXT_PUBLIC_`), чтобы он никогда не попал в браузер.

---

## 2. Настройка Supabase

### 2.1 Создание проекта

1. Зайди на [supabase.com](https://supabase.com) → New Project
2. Запомни **Database Password** (понадобится для прямого подключения через psql)
3. Выбери регион поближе к пользователям (Europe West — оптимально для РФ)
4. Подожди ~2 минуты пока поднимется инстанс

### 2.2 SQL: создание таблиц

Открой **SQL Editor** в Supabase Dashboard и выполни целиком:

```sql
-- ══════════════════════════════════════════════
-- 1. ТАБЛИЦЫ
-- ══════════════════════════════════════════════

CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  color       text        NOT NULL DEFAULT '#FF7056',
  icon        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id  uuid           REFERENCES categories(id) ON DELETE SET NULL,
  type         text           NOT NULL CHECK (type IN ('income', 'expense')),
  amount       numeric(14,2)  NOT NULL CHECK (amount > 0),
  description  text,
  date         date           NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz    NOT NULL DEFAULT now()
);

-- month хранится как date, всегда первый день месяца ('2026-04-01')
-- CHECK гарантирует, что никто не запишет '2026-04-15'
CREATE TABLE budgets (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   uuid           NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month         date           NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  limit_amount  numeric(14,2)  NOT NULL CHECK (limit_amount > 0),
  created_at    timestamptz    NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, month)
);

-- ══════════════════════════════════════════════
-- 2. ИНДЕКСЫ
-- ══════════════════════════════════════════════

-- Основной индекс для дашборда: фильтр по пользователю + сортировка по дате
CREATE INDEX idx_transactions_user_date
  ON transactions(user_id, date DESC);

-- Ускоряет GROUP BY category_id при подсчёте расходов по бюджету
CREATE INDEX idx_transactions_category
  ON transactions(category_id);

-- Ускоряет загрузку категорий пользователя (запрос на каждой странице)
CREATE INDEX idx_categories_user
  ON categories(user_id);

-- ══════════════════════════════════════════════
-- 3. RLS — ROW LEVEL SECURITY
-- ══════════════════════════════════════════════

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets       ENABLE ROW LEVEL SECURITY;

-- categories
CREATE POLICY "select_own_categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- transactions
CREATE POLICY "select_own_transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- budgets
CREATE POLICY "select_own_budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);
```

### 2.3 SQL: стартовые категории (seed)

Выполни после того, как зарегистрируешь первого пользователя через приложение.
Подставь реальный UUID пользователя из Supabase Dashboard → Authentication → Users.

```sql
-- Замени '00000000-0000-0000-0000-000000000000' на реальный user_id
INSERT INTO categories (user_id, name, color, icon) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Еда',            '#FF7056', 'UtensilsCrossed'),
  ('00000000-0000-0000-0000-000000000000', 'Транспорт',      '#3BE8D0', 'Car'),
  ('00000000-0000-0000-0000-000000000000', 'Развлечения',    '#a78bfa', 'Gamepad2'),
  ('00000000-0000-0000-0000-000000000000', 'ЖКХ',            '#4DA3FF', 'Home'),
  ('00000000-0000-0000-0000-000000000000', 'Здоровье',       '#34d399', 'Heart'),
  ('00000000-0000-0000-0000-000000000000', 'Одежда',         '#f97316', 'ShoppingBag'),
  ('00000000-0000-0000-0000-000000000000', 'Зарплата',       '#00D1A0', 'Briefcase'),
  ('00000000-0000-0000-0000-000000000000', 'Фриланс',        '#FF9F43', 'Laptop'),
  ('00000000-0000-0000-0000-000000000000', 'Прочее',         '#8A9099', 'MoreHorizontal');
```

> В финальном приложении можно автоматически создавать дефолтные категории
> при первой регистрации пользователя через Server Action `signUp`.

### 2.4 Настройка Auth

1. Supabase Dashboard → **Authentication** → **Providers**
2. Email — включён по умолчанию, ничего не меняй
3. **Для разработки** — отключи подтверждение email:
   Auth → Settings → «Enable email confirmations» → **OFF**
4. **Для продакшна** — оставь подтверждение включённым

### 2.5 Настройка URL редиректов

Supabase Dashboard → Authentication → **URL Configuration**:

```
Site URL:       https://your-app.vercel.app

Redirect URLs:  https://your-app.vercel.app/**
                http://localhost:3000/**
```

Без этого Supabase будет блокировать редиректы после подтверждения email.

---

## 3. Установка зависимостей

```bash
npm install @supabase/ssr @supabase/supabase-js
```

Уже установлены в проекте:

| Пакет          | Версия   | Для чего                        |
|----------------|----------|---------------------------------|
| `next`         | 16.2.3   | Фреймворк                       |
| `react`        | 19       | UI                              |
| `recharts`     | ^3.8.1   | Графики                         |
| `lucide-react` | ^1.8.0   | Иконки                          |
| `tailwindcss`  | ^4       | Стили                           |
| `typescript`   | ^5       | Типизация                       |

---

## 4. Локальная разработка

### 4.1 Клонировать и установить

```bash
git clone <your-repo-url>
cd finance-dashboard
npm install
```

### 4.2 Создать `.env.local`

```bash
# Создай файл вручную или скопируй шаблон
cp .env.example .env.local

# Заполни два значения:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4.3 Запустить

```bash
npm run dev
# → http://localhost:3000
```

При первом запуске зайди на `/register`, создай аккаунт, затем выполни
SQL seed из раздела 2.3 чтобы добавить стартовые категории.

---

## 5. Структура ключей

| Ключ | Где хранится | Попадает в браузер | Для чего |
|------|--------------|--------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Да (это норма) | URL Supabase проекта |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Да (это норма) | Публичный ключ, RLS защищает данные |
| `SUPABASE_SERVICE_ROLE_KEY` | **только Vercel** | Нет (нет NEXT_PUBLIC_) | Admin-операции, обходит RLS |

---

## 6. Деплой на Vercel

### 6.1 Push в GitHub

```bash
git add .
git commit -m "feat: initial setup"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Убедись что `.gitignore` содержит `.env.local` (есть в Next.js по умолчанию).

### 6.2 Создать проект на Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Импортируй GitHub репозиторий
3. Framework Preset: **Next.js** (определится автоматически)
4. Root Directory: оставь пустым (если `package.json` в корне)

### 6.3 Переменные окружения в Vercel

Project → Settings → **Environment Variables** → добавь:

```
NEXT_PUBLIC_SUPABASE_URL        =  https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   =  eyJ...
```

Поставь галочки: **Production**, **Preview**, **Development**.

### 6.4 Deploy

```bash
# Автоматически при каждом git push в main
# Или вручную через CLI:
npx vercel --prod
```

### 6.5 После первого деплоя

Обнови в Supabase:  
Authentication → URL Configuration → **Site URL** = `https://your-app.vercel.app`

---

## 7. Проверочный чеклист

### Supabase
- [ ] Проект создан, регион выбран
- [ ] Таблицы `categories`, `transactions`, `budgets` созданы
- [ ] Поле `budgets.month` имеет тип `date` с CHECK `DAY = 1`
- [ ] Поле `transactions.type` имеет CHECK `IN ('income', 'expense')`
- [ ] 3 индекса созданы
- [ ] RLS включён на всех трёх таблицах (проверь в Table Editor → RLS)
- [ ] 4 политики (SELECT / INSERT / UPDATE / DELETE) созданы для каждой таблицы
- [ ] Email Auth включён
- [ ] Redirect URLs настроены

### Локальная разработка
- [ ] `.env.local` создан с двумя ключами
- [ ] `npm install @supabase/ssr @supabase/supabase-js` выполнен
- [ ] `npm run dev` запускается без ошибок
- [ ] Регистрация нового пользователя работает
- [ ] После логина — редирект на `/` (dashboard)
- [ ] Seed-категории добавлены для тест-пользователя
- [ ] Данные изолированы между пользователями (залогинься с двух аккаунтов и проверь)

### Vercel
- [ ] Репозиторий подключён
- [ ] Env variables заполнены в Vercel Dashboard
- [ ] Первый деплой прошёл без ошибок сборки
- [ ] Site URL в Supabase обновлён на prod URL

---

## 8. Типичные проблемы

### «Invalid API key» / «Failed to fetch»
Проверь `NEXT_PUBLIC_SUPABASE_ANON_KEY` — нет лишних пробелов или переносов строк.
Убедись что `.env.local` в корне проекта, а не внутри `app/`.

### RLS блокирует все запросы (пустые массивы)
`auth.uid()` возвращает `null` — пользователь не залогинен или сессия истекла.
Проверь что Middleware корректно обновляет сессию через `updateSession()`.

### Middleware не редиректит на `/login`
`middleware.ts` должен лежать в **корне проекта** (рядом с `app/`, `package.json`),
не внутри папки `app/`.

### Ошибка сборки Vercel: «supabaseUrl is required»
Env variables не добавлены в Vercel Dashboard. Добавь и пересобери (Deployments → Redeploy).

### `budgets.month` принимает любую дату
Убедись что CHECK constraint `EXTRACT(DAY FROM month) = 1` создан.
В коде всегда передавай первый день: `new Date(year, month, 1).toISOString().slice(0, 10)`.

### Ошибки UNIQUE при создании бюджета
На тот же месяц и категорию уже есть бюджет. Используй `upsert` вместо `insert`:
```typescript
supabase.from('budgets').upsert({ ...data }, { onConflict: 'user_id,category_id,month' })
```
