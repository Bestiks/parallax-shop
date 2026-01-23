-- Удаление существующих объектов (для чистой установки)
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    public_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    full_name text,
    phone text,
    username text UNIQUE,
    role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    balance_rub integer DEFAULT 0,
    banned boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50)
);

-- Таблица продуктов
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    price_rub integer NOT NULL CHECK (price_rub > 0),
    category text NOT NULL,
    subcategory text,
    image_url text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Таблица баннеров
CREATE TABLE public.banners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    link_url text,
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Таблица потоков чата (по одному на пользователя)
CREATE TABLE public.chat_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Таблица сообщений чата
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid REFERENCES public.chat_threads(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    attachment_url text,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Таблица заявок на пополнение
CREATE TABLE public.topup_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_rub integer NOT NULL CHECK (amount_rub > 0),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    receipt_url text,
    admin_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Таблица транзакций баланса
CREATE TABLE public.balance_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_rub integer NOT NULL,
    type text NOT NULL CHECK (type IN ('topup', 'purchase', 'refund', 'manual')),
    description text,
    reference_id uuid,
    created_at timestamptz DEFAULT now()
);

-- Индексы для производительности
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_public_id ON public.profiles(public_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_banners_active_sort ON public.banners(active, sort_order);
CREATE INDEX idx_chat_threads_user_id ON public.chat_threads(user_id);
CREATE INDEX idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX idx_topup_requests_user_id ON public.topup_requests(user_id);
CREATE INDEX idx_topup_requests_status ON public.topup_requests(status);
CREATE INDEX idx_balance_transactions_user_id ON public.balance_transactions(user_id);

-- Функция проверки админских прав
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
    );
    
    -- Создаем поток чата для пользователя
    INSERT INTO public.chat_threads (user_id) VALUES (new.id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления времени изменения
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topup_requests_updated_at BEFORE UPDATE ON public.topup_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Включаем RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Пользователи могут читать свой профиль" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Пользователи могут обновлять свой профиль" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Админы могут читать все профили" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Админы могут обновлять все профили" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Политики для products
CREATE POLICY "Все могут читать активные продукты" ON public.products
    FOR SELECT USING (active = true);

CREATE POLICY "Админы могут читать все продукты" ON public.products
    FOR ALL USING (public.is_admin(auth.uid()));

-- Политики для banners
CREATE POLICY "Все могут читать активные баннеры" ON public.banners
    FOR SELECT USING (active = true);

CREATE POLICY "Админы могут управлять баннерами" ON public.banners
    FOR ALL USING (public.is_admin(auth.uid()));

-- Политики для chat_threads
CREATE POLICY "Пользователи могут читать свой поток" ON public.chat_threads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Админы могут читать все потоки" ON public.chat_threads
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Политики для chat_messages
CREATE POLICY "Пользователи могут читать сообщения в своих потоках" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_threads 
            WHERE id = thread_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Пользователи могут отправлять сообщения" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Админы могут читать все сообщения" ON public.chat_messages
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Админы могут отправлять сообщения" ON public.chat_messages
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Политики для topup_requests
CREATE POLICY "Пользователи могут читать свои заявки" ON public.topup_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать заявки" ON public.topup_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Админы могут читать все заявки" ON public.topup_requests
    FOR ALL USING (public.is_admin(auth.uid()));

-- Политики для balance_transactions
CREATE POLICY "Пользователи могут читать свои транзакции" ON public.balance_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Админы могут читать все транзакции" ON public.balance_transactions
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Создаем Storage бакет для чеков
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage.buckets
CREATE POLICY "Пользователи могут загружать свои чеки" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'receipts' 
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND (LOWER(RIGHT(name, 4)) IN ('.jpg', '.jpeg', '.png', '.pdf'))
    );

CREATE POLICY "Пользователи могут читать свои чеки" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'receipts' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Админы могут читать все чеки" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'receipts' 
        AND public.is_admin(auth.uid())
    );

-- Вставляем демо данные
INSERT INTO public.products (title, description, price_rub, category, subcategory, image_url) VALUES
('iPhone 15 Pro', 'Флагманский смартфон Apple с процессором A17 Pro', 99990, 'smartphones', 'iphone', '/placeholder-1.jpg'),
('Samsung Galaxy S24', 'Смартфон Samsung с камерой 200MP', 84990, 'smartphones', 'android', '/placeholder-2.jpg'),
('Apple Watch Series 9', 'Умные часы с функциями здоровья', 39990, 'watches', 'smartwatch', '/placeholder-3.jpg'),
('MacBook Pro 16"', 'Ноутбук для профессионалов с чипом M3', 199990, 'laptops', 'apple', '/placeholder-4.jpg'),
('Игровой ПК', 'Мощный компьютер для игр', 149990, 'computers', 'gaming', '/placeholder-1.jpg');

INSERT INTO public.banners (title, subtitle, image_url, link_url, sort_order, active) VALUES
('Новая коллекция', 'Скидки до 30% на смартфоны', '/placeholder-1.jpg', '/catalog?category=smartphones', 1, true),
('Apple Watch', 'Следите за здоровьем', '/placeholder-2.jpg', '/catalog?category=watches', 2, true),
('Игровые ноутбуки', 'Максимальная производительность', '/placeholder-3.jpg', '/catalog?category=laptops', 3, true);

-- Создаем функцию для пополнения баланса
CREATE OR REPLACE FUNCTION public.complete_topup(request_id uuid, admin_id uuid)
RETURNS void AS $$
DECLARE
    user_uuid uuid;
    amount integer;
BEGIN
    -- Получаем данные заявки
    SELECT user_id, amount_rub INTO user_uuid, amount
    FROM public.topup_requests 
    WHERE id = request_id AND status = 'processing';
    
    IF user_uuid IS NOT NULL THEN
        -- Обновляем баланс
        UPDATE public.profiles 
        SET balance_rub = balance_rub + amount 
        WHERE id = user_uuid;
        
        -- Обновляем статус заявки
        UPDATE public.topup_requests 
        SET status = 'completed', 
            updated_at = now()
        WHERE id = request_id;
        
        -- Записываем транзакцию
        INSERT INTO public.balance_transactions (user_id, amount_rub, type, description, reference_id)
        VALUES (user_uuid, amount, 'topup', 'Пополнение баланса', request_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
