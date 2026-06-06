
ALTER FUNCTION public.gen_code(text, int) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.gen_code(text, int) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_order_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_order_delivered() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_customer() FROM PUBLIC, anon, authenticated;
