
REVOKE EXECUTE ON FUNCTION public.notify_new_order() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_new_customer() FROM anon, authenticated, public;