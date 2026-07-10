
DROP POLICY IF EXISTS "authenticated read notifications" ON public.notifications;
DROP POLICY IF EXISTS "authenticated update notifications" ON public.notifications;
CREATE POLICY "admins read notifications" ON public.notifications FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins update notifications" ON public.notifications FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "authenticated read sources" ON public.notification_sources;

DROP POLICY IF EXISTS "authenticated read preferences" ON public.notification_preferences;

DROP POLICY IF EXISTS "authenticated read deliveries" ON public.notification_deliveries;
CREATE POLICY "admins read deliveries" ON public.notification_deliveries FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "authenticated read logs" ON public.notification_events_log;
CREATE POLICY "admins read logs" ON public.notification_events_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
