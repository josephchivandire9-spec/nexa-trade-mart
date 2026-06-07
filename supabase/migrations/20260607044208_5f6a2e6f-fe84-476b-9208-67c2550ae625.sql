CREATE POLICY "Public can subscribe to banners channel"
ON realtime.messages FOR SELECT
TO anon, authenticated
USING (realtime.topic() = 'banners-public');