import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFICATION_EVENTS = [
  { category: 'quotes', event_type: 'created', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'quotes', event_type: 'status_changed', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'quotes', event_type: 'approval_requested', default_in_app: true, default_email: true, default_recipient_rule: 'role:admin' },
  { category: 'quotes', event_type: 'approved', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'quotes', event_type: 'rejected', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'quotes', event_type: 'exported', default_in_app: true, default_email: false, default_recipient_rule: 'actor_only' },
  { category: 'projects', event_type: 'created', default_in_app: true, default_email: false, default_recipient_rule: 'role:admin' },
  { category: 'projects', event_type: 'archived', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'projects', event_type: 'client_assigned', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'projects', event_type: 'deadline_approaching', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'rooms', event_type: 'created', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'rooms', event_type: 'design_completed', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'rooms', event_type: 'validation_failed', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'rooms', event_type: 'equipment_added', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'rooms', event_type: 'equipment_removed', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'drawings', event_type: 'generated', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'drawings', event_type: 'exported', default_in_app: true, default_email: false, default_recipient_rule: 'project_team' },
  { category: 'drawings', event_type: 'regeneration_needed', default_in_app: true, default_email: true, default_recipient_rule: 'project_team' },
  { category: 'equipment', event_type: 'added', default_in_app: true, default_email: false, default_recipient_rule: 'all_members' },
  { category: 'equipment', event_type: 'pricing_updated', default_in_app: true, default_email: true, default_recipient_rule: 'all_members' },
  { category: 'equipment', event_type: 'discontinued', default_in_app: true, default_email: true, default_recipient_rule: 'all_members' },
  { category: 'equipment', event_type: 'spec_sheet_updated', default_in_app: true, default_email: false, default_recipient_rule: 'all_members' },
  { category: 'standards', event_type: 'rule_added', default_in_app: true, default_email: false, default_recipient_rule: 'role:admin' },
  { category: 'standards', event_type: 'rule_modified', default_in_app: true, default_email: false, default_recipient_rule: 'role:admin' },
  { category: 'standards', event_type: 'rule_deactivated', default_in_app: true, default_email: true, default_recipient_rule: 'role:admin' },
  { category: 'standards', event_type: 'compliance_alert', default_in_app: true, default_email: true, default_recipient_rule: 'role:admin' },
  { category: 'system', event_type: 'app_update_available', default_in_app: true, default_email: true, default_recipient_rule: 'all_members' },
  { category: 'system', event_type: 'sync_completed', default_in_app: true, default_email: false, default_recipient_rule: 'all_members' },
  { category: 'system', event_type: 'sync_failed', default_in_app: true, default_email: true, default_recipient_rule: 'all_members' },
  { category: 'system', event_type: 'storage_warning', default_in_app: true, default_email: true, default_recipient_rule: 'all_members' },
  { category: 'team', event_type: 'user_invited', default_in_app: true, default_email: true, default_recipient_rule: 'role:admin' },
  { category: 'team', event_type: 'user_joined', default_in_app: true, default_email: false, default_recipient_rule: 'role:admin' },
  { category: 'team', event_type: 'user_role_changed', default_in_app: true, default_email: true, default_recipient_rule: 'role:admin' },
  { category: 'team', event_type: 'user_removed', default_in_app: true, default_email: true, default_recipient_rule: 'role:admin' },
];

const ROLE_RULES: Record<string, string[]> = {
  'role:editor': ['owner', 'admin', 'member'],
  'role:admin': ['owner', 'admin'],
  'role:owner': ['owner'],
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function uniqueIds(ids: (string | null | undefined)[]) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: 'Missing Supabase service configuration' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload' }, 400);
  }

  const required = [
    'org_id',
    'category',
    'event_type',
    'severity',
    'title',
    'message',
    'entity_type',
    'entity_id',
    'actor_id',
  ];

  for (const key of required) {
    if (!payload[key]) {
      return jsonResponse({ error: `Missing ${key}` }, 400);
    }
  }

  const category = String(payload.category);
  const eventType = String(payload.event_type);
  const orgId = String(payload.org_id);

  const eventConfig = NOTIFICATION_EVENTS.find(
    (event) => event.category === category && event.event_type === eventType
  );

  if (!eventConfig) {
    return jsonResponse({ error: 'Unknown notification event' }, 400);
  }

  const { data: orgRule, error: ruleError } = await supabase
    .from('org_notification_rules')
    .select('recipient_rule')
    .eq('org_id', orgId)
    .eq('category', category)
    .eq('event_type', eventType)
    .maybeSingle();

  if (ruleError) {
    return jsonResponse({ error: ruleError.message }, 500);
  }

  const recipientRule = orgRule?.recipient_rule ?? eventConfig.default_recipient_rule;

  let recipients: string[] = [];
  const actorId = String(payload.actor_id);

  if (recipientRule === 'actor_only') {
    recipients = [actorId];
  } else if (recipientRule === 'project_team') {
    const projectId = payload.project_id ? String(payload.project_id) : null;
    if (!projectId) {
      recipients = [actorId];
    } else {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('owner_id, user_id, visibility')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) {
        return jsonResponse({ error: projectError.message }, 500);
      }

      const projectIds = uniqueIds([project?.owner_id, project?.user_id, actorId]);
      recipients = projectIds;

      if (project?.visibility === 'organization' || project?.visibility === 'client_team') {
        const { data: members, error: memberError } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('org_id', orgId);

        if (memberError) {
          return jsonResponse({ error: memberError.message }, 500);
        }

        const memberIds = (members || []).map((member) => member.user_id as string);
        recipients = uniqueIds([...recipients, ...memberIds]);
      }
    }
  } else if (recipientRule === 'all_members') {
    const { data: members, error: memberError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('org_id', orgId);

    if (memberError) {
      return jsonResponse({ error: memberError.message }, 500);
    }

    recipients = (members || []).map((member) => member.user_id as string);
  } else if (ROLE_RULES[recipientRule]) {
    const roles = ROLE_RULES[recipientRule];
    const { data: members, error: memberError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('org_id', orgId)
      .in('role', roles);

    if (memberError) {
      return jsonResponse({ error: memberError.message }, 500);
    }

    recipients = (members || []).map((member) => member.user_id as string);
  }

  recipients = uniqueIds(recipients);

  if (recipients.length === 0) {
    return jsonResponse({ recipients: 0, inAppSent: 0, emailSent: 0 });
  }

  const { data: preferences, error: prefError } = await supabase
    .from('notification_preferences')
    .select('user_id, in_app_enabled, email_enabled')
    .eq('category', category)
    .eq('event_type', eventType)
    .in('user_id', recipients);

  if (prefError) {
    return jsonResponse({ error: prefError.message }, 500);
  }

  const preferenceMap = new Map<string, { inApp: boolean; email: boolean }>();
  (preferences || []).forEach((pref) => {
    preferenceMap.set(pref.user_id as string, {
      inApp: Boolean(pref.in_app_enabled),
      email: Boolean(pref.email_enabled),
    });
  });

  const inAppRecipients: string[] = [];
  const emailRecipients: string[] = [];

  for (const userId of recipients) {
    const pref = preferenceMap.get(userId);
    const inAppEnabled = pref ? pref.inApp : eventConfig.default_in_app;
    const emailEnabled = pref ? pref.email : eventConfig.default_email;
    if (inAppEnabled) inAppRecipients.push(userId);
    if (emailEnabled) emailRecipients.push(userId);
  }

  let inAppSent = 0;
  if (inAppRecipients.length > 0) {
    const insertPayload = inAppRecipients.map((userId) => ({
      user_id: userId,
      category,
      event_type: eventType,
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(insertPayload);

    if (insertError) {
      return jsonResponse({ error: insertError.message }, 500);
    }

    inAppSent = inAppRecipients.length;
  }

  let emailSent = 0;
  const resendKey = Deno.env.get('RESEND_API_KEY');

  if (resendKey && emailRecipients.length > 0) {
    const fromAddress =
      Deno.env.get('NOTIFICATIONS_FROM_EMAIL') || 'notifications@av-designer.local';

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', emailRecipients);

    if (userError) {
      return jsonResponse({ error: userError.message }, 500);
    }

    const emailTargets = (users || []).filter((user) => user.email);
    const sendResults = await Promise.allSettled(
      emailTargets.map((user) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: user.email,
            subject: String(payload.title),
            text: String(payload.message),
          }),
        })
      )
    );

    emailSent = sendResults.filter((result) => {
      if (result.status !== 'fulfilled') return false;
      return result.value.ok;
    }).length;
  }

  return jsonResponse({
    recipients: recipients.length,
    inAppSent,
    emailSent,
  });
});
