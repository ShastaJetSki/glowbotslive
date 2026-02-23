/* ================================================================
   paygate.js — EventLogicPro Subscription Guard
   
   HOW TO USE:
   Add this ONE line to the <head> of every ELP page (after supabase):
   <script src="paygate.js"></script>
   
   It will:
   - Check the tenant's subscription status on every page load
   - Redirect to paywall if trial expired or payment lapsed
   - Show a trial countdown banner if within 5 days of expiry
   - Always let super_admins and glowbotsapp@gmail.com through
   - Never block: login.html, register.html, paywall.html, billing.html
================================================================ */

(function() {

  /* ── CONFIG ────────────────────────────────────────────────── */
  const SUPABASE_URL = 'https://kxqkwpkmtgvmthpafoqx.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4cWt3cGttdGd2bXRocGFmb3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDI1OTQsImV4cCI6MjA4MTAxODU5NH0.GT9pOMqrUr1EvVLh1magyoB4I_LprziRaybKsGHhrX4';

  // Pages that never get gated — always accessible
  const BYPASS_PAGES = [
    'login.html',
    'eventlogicpro-register.html',
    'eventlogicpro-paywall.html',
    'eventlogicpro-billing.html'
  ];

  // Emails that always bypass (super admins)
  const SUPER_ADMIN_EMAILS = [
    'glowbotsapp@gmail.com'
  ];

  // Show trial banner when this many days remain
  const TRIAL_WARN_DAYS = 5;

  /* ── HELPERS ───────────────────────────────────────────────── */
  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function isBypassPage() {
    const page = currentPage();
    return BYPASS_PAGES.some(p => page === p || page === '');
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function injectBanner(message, type) {
    // type: 'warning' | 'danger' | 'info'
    if (document.getElementById('paygate-banner')) return;

    const colors = {
      warning: { bg: '#f59e0b', text: '#000', border: '#d97706' },
      danger:  { bg: '#dc2626', text: '#fff', border: '#b91c1c' },
      info:    { bg: '#3b82f6', text: '#fff', border: '#2563eb' }
    };
    const c = colors[type] || colors.info;

    const banner = document.createElement('div');
    banner.id = 'paygate-banner';
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
      background: ${c.bg}; color: ${c.text}; border-bottom: 2px solid ${c.border};
      padding: 10px 20px; font-size: 13px; font-family: 'Courier New', monospace;
      font-weight: 600; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 16px;
    `;
    banner.innerHTML = `
      <span>${message}</span>
      <a href="eventlogicpro-billing.html" style="
        background: rgba(0,0,0,0.2); color: inherit; text-decoration: none;
        padding: 4px 12px; border-radius: 4px; font-size: 12px; white-space: nowrap;
      ">Manage Billing →</a>
      <button onclick="document.getElementById('paygate-banner').remove()" style="
        background: none; border: none; color: inherit; cursor: pointer;
        font-size: 18px; line-height: 1; padding: 0 4px; opacity: 0.7;
      ">×</button>
    `;

    // Push page content down so banner doesn't overlap
    document.addEventListener('DOMContentLoaded', () => {
      document.body.prepend(banner);
      document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0) + 44) + 'px';
    });
    if (document.body) {
      document.body.prepend(banner);
      document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0) + 44) + 'px';
    }
  }

  function redirectToPaywall(reason, tenantData) {
    // Store context so paywall page can show relevant info
    sessionStorage.setItem('paywall_reason', reason);
    if (tenantData) sessionStorage.setItem('paywall_tenant', JSON.stringify(tenantData));
    window.location.href = 'eventlogicpro-paywall.html';
  }

  /* ── MAIN GATE CHECK ───────────────────────────────────────── */
  async function runPaygate() {
    // Never gate bypass pages
    if (isBypassPage()) return;

    // Wait for supabase to be available
    if (!window.supabase) return;

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Get session
    let session = null;
    try {
      const { data } = await sb.auth.getSession();
      session = data.session;
      if (!session) {
        const token   = localStorage.getItem('sb_access_token');
        const refresh = localStorage.getItem('sb_refresh_token');
        if (token && refresh) {
          const { data: d2 } = await sb.auth.setSession({ access_token: token, refresh_token: refresh });
          session = d2?.session;
        }
      }
    } catch(e) { return; }

    if (!session) return; // login.html will handle redirect

    const email = session.user.email;

    // Super admin bypass
    if (SUPER_ADMIN_EMAILS.includes(email)) return;

    // Check DB role — super_admin role also bypasses
    try {
      const { data: userRow } = await sb.from('users')
        .select('role, tenant_id')
        .eq('email', email)
        .single();

      if (!userRow) return;
      if (userRow.role === 'super_admin') return;

      // Get tenant subscription status
      const { data: tenant } = await sb.from('tenants')
        .select('tenant_id, tenant_name, status, stripe_status, trial_ends_at, grace_period_ends_at, monthly_recurring_revenue')
        .eq('tenant_id', userRow.tenant_id)
        .single();

      if (!tenant) return;

      const status      = tenant.status;
      const stripeStatus = tenant.stripe_status;
      const trialDays   = daysUntil(tenant.trial_ends_at);
      const graceDays   = daysUntil(tenant.grace_period_ends_at);

      /* ── DECISION TREE ── */

      // 1. Suspended — hard block
      if (status === 'suspended' || status === 'cancelled') {
        redirectToPaywall('suspended', tenant);
        return;
      }

      // 2. Trial expired — no payment on file
      if (status === 'trial' && trialDays !== null && trialDays <= 0) {
        redirectToPaywall('trial_expired', tenant);
        return;
      }

      // 3. Past due + grace period expired
      if (stripeStatus === 'past_due' && graceDays !== null && graceDays <= 0) {
        redirectToPaywall('payment_failed', tenant);
        return;
      }

      /* ── WARNING BANNERS (no redirect, just notify) ── */

      // 4. Trial ending soon
      if (status === 'trial' && trialDays !== null && trialDays <= TRIAL_WARN_DAYS && trialDays > 0) {
        injectBanner(
          `⏳ Your free trial ends in ${trialDays} day${trialDays === 1 ? '' : 's'}.`,
          trialDays <= 2 ? 'danger' : 'warning'
        );
        return;
      }

      // 5. Payment past due — in grace period
      if (stripeStatus === 'past_due' && graceDays !== null && graceDays > 0) {
        injectBanner(
          `⚠️ Payment failed. Please update your payment method. ${graceDays} day${graceDays === 1 ? '' : 's'} remaining before access is suspended.`,
          'danger'
        );
        return;
      }

      // 6. Active — all good, no banner needed

    } catch(e) {
      // Fail open — don't block on errors
      console.warn('[paygate] check failed silently:', e.message);
    }
  }

  // Run immediately
  runPaygate();

})();
