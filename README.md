# Parallax Shop

## Подготовка проекта

```bash
# Клонируйте или создайте папку с файлами проекта
mkdir parallax-shop
cd parallax-shop

# Установите зависимости
npm install

# Создайте файл .env.local на основе .env.local.example
cp .env.local.example .env.local

# Создайте плейсхолдер изображения в папке public
# Используйте любые изображения и назовите их placeholder-1.jpg, placeholder-2.jpg и т.д.
2. Настройка Supabase
Создайте проект на supabase.com

В SQL Editor выполните SQL из файла supabase.sql

Получите credentials:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY (в Project Settings > API)

3. Настройка переменных окружения
В файле .env.local укажите:

env
NEXT_PUBLIC_SUPABASE_URL=ваш_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Локальная проверка и деплой

```bash
# Запустите проект локально
npm run dev

# Проверьте сборку
npm run build
5. Деплой на Vercel
Запушите проект на GitHub

Войдите на vercel.com

Импортируйте проект из GitHub

Настройте Environment Variables в Vercel:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

NEXT_PUBLIC_SITE_URL (укажите ваш домен после деплоя)

Нажмите Deploy

6. Создание первого администратора
После деплоя:

Зарегистрируйте пользователя на сайте

В Supabase SQL Editor выполните:

sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE username = 'ваш_username';
Проверка работоспособности
Регистрация и вход - работает без вылетов

Просмотр каталога - доступен до/после логина

Чат с поддержкой - создается автоматически

Пополнение баланса - заявка → чек → подтверждение

Админка - видна только с role=admin

RLS - все политики работают

Хранение файлов - чеки в Supabase Storage

SEO - sitemap.xml, robots.txt, метаданные

Адаптивность - бургер-меню, мобильная версия

Скелетоны - загрузка на всех страницах
```
