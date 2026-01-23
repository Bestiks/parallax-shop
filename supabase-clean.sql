-- Отключаем триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_topup_requests_updated_at ON public.topup_requests;

-- Удаляем функции
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.complete_topup(uuid, uuid);

-- Удаляем таблицы (в правильном порядке из-за внешних ключей)
DROP TABLE IF EXISTS public.balance_transactions CASCADE;
DROP TABLE IF EXISTS public.topup_requests CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_threads CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Удаляем политики storage если они существуют
DROP POLICY IF EXISTS "Пользователи могут загружать свои чеки" ON storage.objects;
DROP POLICY IF EXISTS "Пользователи могут читать свои чеки" ON storage.objects;
DROP POLICY IF EXISTS "Админы могут читать все чеки" ON storage.objects;

-- Удаляем бакет (если нужно)
DELETE FROM storage.buckets WHERE id = 'receipts';

-- Удаляем схему public и создаем заново (осторожно!)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
