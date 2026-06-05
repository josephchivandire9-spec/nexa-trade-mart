
-- Restrict realtime channel subscriptions to admins for the admin-notifications topic
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read admin-notifications channel" ON realtime.messages;
CREATE POLICY "Admins read admin-notifications channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'admin-notifications'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
