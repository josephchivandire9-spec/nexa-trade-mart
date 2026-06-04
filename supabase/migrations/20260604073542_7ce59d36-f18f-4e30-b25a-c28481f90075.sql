
-- 1. Extend profiles with phone + address
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Orders: link to customer + payment status
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- Let customers view their own orders
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT
  TO authenticated USING (customer_id = auth.uid());

-- 3. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  meta jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(is_read) WHERE is_read = false;

-- 4. Triggers to auto-create notifications
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(type, title, body, link, meta)
  VALUES (
    'order',
    'New order from ' || NEW.customer_name,
    'Total ' || NEW.total::text || ' · ' || NEW.customer_phone,
    '/admin/orders',
    jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'phone', NEW.customer_phone)
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_notify_insert ON public.orders;
CREATE TRIGGER orders_notify_insert AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(type, title, body, link, meta)
  VALUES (
    'message',
    'New message from ' || NEW.name,
    COALESCE(NEW.subject, LEFT(NEW.message, 80)),
    '/admin/messages',
    jsonb_build_object('message_id', NEW.id, 'email', NEW.email, 'phone', NEW.phone)
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS messages_notify_insert ON public.contact_messages;
CREATE TRIGGER messages_notify_insert AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

CREATE OR REPLACE FUNCTION public.notify_new_customer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(type, title, body, link, meta)
  VALUES (
    'customer',
    'New customer registered',
    COALESCE(NEW.full_name, NEW.email, 'New user'),
    '/admin/customers',
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_notify_insert ON public.profiles;
CREATE TRIGGER profiles_notify_insert AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_customer();

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
