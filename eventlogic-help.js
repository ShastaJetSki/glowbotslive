/* ============================================================================
   Event Logic Pro — Page Help & First-Visit Onboarding
   ----------------------------------------------------------------------------
   Drop this ONE file into every page:

       <script src="eventlogic-help.js" defer></script>

   It does three things:
     1. First time a user lands on a page, the page's instructions open
        automatically, front and center.
     2. When they dismiss with "Got it", the panel collapses to its home —
        a quiet floating "?" button that sits in the same place on every page.
     3. The very first time a user hides a guide, that home button flashes
        ONCE (with a small "Help lives here" hint) so they learn where the
        instructions went. It never flashes again after that.

   All instruction copy lives in ELP_HELP_CONTENT below — edit in one place.
   Every page guide includes a worked "For example" so it is easy to learn
   and easy to come back to as a reference.

   It supersedes the old inline help block: if a legacy "?" button or modal
   is present, this script hides them so there is only one home.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------- CONFIG ----------------------------------- */
  var CONFIG = {
    autoShowOnFirstVisit: true,   // open the guide automatically on first visit
    settleMs: 650,                // wait this long after load before auto-showing
    flashScope: 'perpage',        // 'perpage' = flash once per page (first dismiss each)
                                  // 'once'    = flash home button one time ever
    flashHint: 'Help lives here', // tiny label shown beside the button when it flashes
    hideLegacyHelpButton: true,   // hide any old header "?" so there's a single home
    storagePrefix: 'elp_help_',   // localStorage key prefix

    // Home-screen / "install as app" support (injects manifest + icon meta if missing)
    addHomeScreenMeta: true,
    appName: 'Event Logic Pro',
    themeColor: '#DC2626',
    touchIcon: 'favicon-eventlogic-192.png',  // existing icon file in your folder
    manifestHref: 'manifest.json'             // upload manifest.json alongside your pages
  };

  /* ------------------------- INSTRUCTION CONTENT --------------------------
     Each entry: a one-line "what it's for" (lead), a "How to use it" list,
     a concrete "For example" walkthrough, and a "Get the most out of it" tip.
  ------------------------------------------------------------------------- */
  var ELP_HELP_CONTENT = {
    dashboard: {
      title: 'Dashboard',
      lead: 'Your home base — every event in one place, with live numbers and one-click jumps into any section.',
      body: [
        ['How to use it', [
          '<b>+ New Event</b> — start from scratch or from a template that pre-loads departments and tasks.',
          '<b>Event cards</b> — each card has Tasks / Budget / Packages buttons that open straight into that event.',
          '<b>Open an event</b> — click anywhere on a card (not a button) to jump into its Tasks view.',
          '<b>KPIs</b> — track upcoming events, task completion, budget, projected income, and net P/L across everything.',
          '<b>Collapse All</b> — tidy the view when you are running a lot of events at once.'
        ]],
        ['Add it to your phone', 'Put Event Logic Pro on your home screen so it opens full-screen like a real app — one tap, no browser bar. You only do this once per phone.'],
        ['On iPhone &amp; iPad (Safari)', [
          'Open the app in <b>Safari</b> — it has to be Safari, not Chrome.',
          'Tap the <b>Share</b> icon (the square with an arrow pointing up).',
          'Scroll down and tap <b>Add to Home Screen</b>.',
          'Tap <b>Add</b> — the Event Logic Pro icon lands on your home screen.'
        ]],
        ['On Android (Chrome)', [
          'Open the app in <b>Chrome</b>.',
          'Tap the <b>\u22ee menu</b> (three dots, top-right).',
          'Tap <b>Add to Home screen</b> (some phones say <b>Install app</b>).',
          'Tap <b>Add</b> / <b>Install</b> — the icon appears with your other apps.'
        ]],
        ['For example', 'Say you manage three events. The Dashboard shows your <b>Summer Fest</b> at 64% of tasks done, the <b>Corporate Gala</b> already in the black, and a <b>Wedding</b> you just created. Click the Summer Fest card to drop into its tasks — or click <b>+ New Event</b>, pick your "Music Festival" template, and the next event spins up with its departments already built.'],
        ['Get the most out of it', 'Build an event from a template — it instantly fills Tasks with the right departments and adds start/end milestones to your Calendar, so a new event is half set up the moment you create it.']
      ]
    },
    calendar: {
      title: 'Calendar',
      lead: 'A visual timeline across all of your events. Anything scheduled inside an event shows up here automatically.',
      body: [
        ['How to use it', [
          '<b>Switch views</b> — Month, Week, or Day using the arrows and the view toggle.',
          '<b>Today</b> — jump back to the current date at any time.',
          '<b>Click a date</b> — add a quick item with a time, location, and notes.',
          '<b>Click an item</b> — edit, move, or delete it.',
          '<b>My Calendars</b> — create color-coded layers and toggle which events are visible.'
        ]],
        ['For example', 'Create a red <b>Summer Fest</b> layer, then click Aug 14 and add "Vendor load-in" at 6:00 AM, and Aug 15 for "Final walkthrough." Toggle every other event\u2019s color off and the grid shows just this festival\u2019s run of dates — clean enough to share in a planning meeting.'],
        ['Get the most out of it', 'New events drop a milestone on their start and end dates automatically. Use color layers to keep multiple events readable at a glance instead of one crowded grid. On mobile, tap the drawer icon to manage layers.']
      ]
    },
    tasks: {
      title: 'Tasks',
      lead: 'The detailed task workspace for one event at a time. Pick the event in the dropdown to load its work.',
      body: [
        ['How to use it', [
          '<b>Departments</b> — group tasks by team (Logistics, Marketing, Production, and so on). Your own department is highlighted.',
          '<b>Add tasks</b> — give each one a title, owner, deadline, cost, and timing (Pre / Day-of / Post).',
          '<b>Status</b> — click the checkbox to cycle a task open \u2192 done \u2192 cancelled. Overdue tasks are flagged red.',
          '<b>Templates</b> — apply a reusable task template to bootstrap a new event in seconds.',
          '<b>Vendors</b> — attach vendors to tasks so ownership is clear.'
        ]],
        ['For example', 'Under <b>Production</b>, add "Build main stage" — assign it to Maria, deadline Aug 13, cost $4,200, timing Day-of. It shows $4,200 in Production\u2019s running cost and counts toward the progress bar at the top. When Maria ticks it done, the Dashboard completion percentage ticks up too.'],
        ['Get the most out of it', 'The cost on each task rolls straight into that event\u2019s Budget, and completion rolls up to the Dashboard KPIs — so keeping tasks current keeps your whole event accurate with no double entry.']
      ]
    },
    budget: {
      title: 'Budget',
      lead: 'Build, review, and publish budgets for an event. Several drafts can compete before one becomes official.',
      body: [
        ['How to use it', [
          '<b>My Budgets</b> — your working drafts. Add expense departments and revenue sources, each with line items.',
          '<b>Estimated vs Actual</b> — enter both per line; the net total updates live as you type.',
          '<b>Timing</b> — tag each item Pre / Day-of / Post to see when money actually moves.',
          '<b>Submit for Review</b> — send a draft to the review board for the team to vote and comment.',
          '<b>Publish as Official</b> — promote the chosen draft to the official budget. <b>Print</b> for a clean PDF.'
        ]],
        ['For example', 'Add an expense department <b>Staging</b> with a line "Main stage rental" — estimated $4,000, actual $4,200, timing Pre. Add a revenue source <b>Ticketing</b> with "GA tickets" estimated $30,000. The net flips to positive live as you type. Submit it to the review board; once the team votes, publish it as official and print the PDF for your client.'],
        ['Get the most out of it', 'Use the Pre / Day-of / Post breakdown as a cash-flow check, not just a total. Clone a finished budget to reuse it on the next event. Only the creator can delete or share a draft.']
      ]
    },
    packages: {
      title: 'Packages',
      lead: 'Sponsor package sheets — define tiers, benefits, pricing, and inventory, then forecast revenue.',
      body: [
        ['How to use it', [
          '<b>+ New Sheet</b> — start a sponsorship lineup for an event.',
          '<b>Tiers & benefits</b> — add levels (Gold, Silver, and so on) with custom benefit lists, value, and cost.',
          '<b>Inventory</b> — track how many of each tier are available versus sold.',
          '<b>Estimate revenue</b> — set quantities to project income against your goal.',
          '<b>Submit for Review / Publish</b> — same drafts \u2192 review \u2192 official flow as budgets. <b>Print</b> a prospect-ready sheet.'
        ]],
        ['For example', 'Create a <b>Gold</b> tier at $10,000 with benefits: logo on the main stage (value $3,000, cost $400) and 20 VIP passes (value $2,000, cost $300). Set inventory to 4 available. When 3 sell, the sheet reads 3/4 sold and $30,000 flows into Projected Income on the Dashboard.'],
        ['Get the most out of it', '"Value" is what the sponsor receives; "Cost" is what it costs you to deliver — the gap is your margin. Sold packages feed Projected Income on the Dashboard, so this sheet doubles as your revenue forecast.']
      ]
    },
    schedule: {
      title: 'Schedule',
      lead: 'The day-of run-of-show. Build a minute-by-minute timeline, organized by stage, that crew can follow.',
      body: [
        ['How to use it', [
          '<b>+ Stage</b> — add each stage or area, then add timed items beneath it.',
          '<b>Items</b> — give each a time, title, location, owner, and notes.',
          '<b>Duplicate</b> — copy a stage or item to build repeating blocks fast.',
          '<b>Reorder</b> — drag items to fix the running order.',
          '<b>Print</b> — generate a clean hand-out for the crew.'
        ]],
        ['For example', 'Add a <b>Main Stage</b>, then items: 5:00 PM Gates open, 6:00 PM Opening act, 8:30 PM Headliner, 10:30 PM Breakdown — each with an owner. Duplicate the whole stage to start your <b>Second Stage</b> in one click, adjust the times, and print both for the crew.'],
        ['Get the most out of it', 'Schedule items also surface on the main Calendar, so the whole team sees the day-of plan without opening this page. Build one stage cleanly, then duplicate it as your starting point for the rest.']
      ]
    },
    documents: {
      title: 'Documents',
      lead: 'Central storage for everything paper — contracts, permits, certificates, vendor agreements, and decks.',
      body: [
        ['How to use it', [
          '<b>+ Upload</b> — drag and drop files or click to browse.',
          '<b>Organize by event</b> — keep documents grouped with the event they belong to.',
          '<b>Share</b> — generate a link for a vendor or partner, or use Share All for a full set.',
          '<b>Replace</b> — upload a new version to keep a document current while older copies stay accessible.'
        ]],
        ['For example', 'Upload the signed venue contract and the city noise permit and tag both to <b>Summer Fest 2026</b>. When the venue asks for your certificate of insurance, hit <b>Share</b> and send them one link — instead of digging through email threads.'],
        ['Get the most out of it', 'Keep signed contracts and permits here rather than in email — when a vendor or venue asks, you send one link instead of hunting through threads.']
      ]
    },
    contacts: {
      title: 'Contacts',
      lead: 'Your CRM for everyone in the event\u2019s orbit — sponsors, vendors, talent, media, venues, and VIPs.',
      body: [
        ['How to use it', [
          '<b>+ Add Contact</b> — name, organization, and phone are required; email, type, and notes are optional.',
          '<b>Type</b> — Band, DJ, Photographer, Caterer, Venue, Sponsor, Client, and more.',
          '<b>Assign</b> — own an account or hand a contact to a teammate.',
          '<b>Funnel stage</b> — track the pipeline from lead \u2192 qualified \u2192 proposal \u2192 close.',
          '<b>Customize KPIs</b> — choose which contact types show as summary cards up top.'
        ]],
        ['For example', 'Add <b>DJ Nova</b> — organization "Nova Sounds", type DJ, with a phone number, funnel stage <b>Proposal</b>, assigned to you. A week later you move them to <b>Close</b>. If you remove a contact by mistake, it isn\u2019t gone — it sits in the Vault for an admin to restore.'],
        ['Get the most out of it', 'Removed contacts go to the Vault rather than being deleted, so an admin can always recover one. Permissions scale by role: admins see all contacts, managers see their team\u2019s, staff see the ones assigned to them.']
      ]
    },
    questions: {
      title: 'Questions',
      lead: 'A shared Q&A for an event — staff onboarding, vendor briefings, or attendee-facing info.',
      body: [
        ['How to use it', [
          '<b>+ Add Dept</b> — group questions by area (logistics, payment, schedule).',
          '<b>+ Question</b> — add a question and its answer.',
          '<b>Mark Answered</b> — track which questions still need a response.',
          '<b>Save Redirect</b> — point a question at the right page or owner.'
        ]],
        ['For example', 'Create a <b>Payment</b> department and add "When do vendors get paid?" \u2192 "Net 15 after the event," then <b>Mark Answered</b>. Now every teammate and vendor gets the same answer — instead of the question bouncing around five inboxes.'],
        ['Get the most out of it', 'Treat this as the single source of truth for "how does X work" so the same question doesn\u2019t get answered five different ways across your team and vendors.']
      ]
    },
    sitemap: {
      title: 'Site Maps',
      lead: 'A visual venue layout. Place stages, booths, sponsor activations, entrances, restrooms — anything on the ground.',
      body: [
        ['How to use it', [
          '<b>BG Image</b> — upload an aerial photo or floor plan to trace over.',
          '<b>Shapes & Presets</b> — drop event presets or draw shapes, then label them.',
          '<b>Select / Draw tools</b> — move and resize with Select (V), add shapes with Draw. Delete removes the selected object.',
          '<b>Layers & color</b> — color-code by category and reorder with the layers panel.',
          '<b>Zoom / Grid</b> — zoom, pan, and toggle the grid to place things precisely. <b>Export PNG</b> when done.'
        ]],
        ['For example', 'Upload the venue\u2019s aerial photo, draw a rectangle for the main stage and label it, drop 12 booth shapes in green for vendors and two blue ones for restrooms, then <b>Export PNG</b> and send the map to your crew and the fire marshal.'],
        ['Get the most out of it', 'Save multiple maps per event (load-in, show layout, breakdown) and export each as a PNG — a print-ready map for crew, vendors, and emergency services beats a verbal description every time.']
      ]
    },
    settings: {
      title: 'Settings',
      lead: 'Account, team, branding, and preferences for your whole organization.',
      body: [
        ['What\u2019s in here', [
          '<b>Profile</b> — your name, phone, title, and password.',
          '<b>Team</b> — invite collaborators and set roles (admin / manager / staff).',
          '<b>Templates</b> — reusable task templates that speed up new-event setup.',
          '<b>Preferences</b> — dark mode and your default landing page.',
          '<b>Billing</b> — subscription, payment method, and invoices.'
        ]],
        ['For example', 'In <b>Templates</b>, build a "Music Festival" template with Production, Marketing, and Logistics departments and their standard tasks. Every new festival you create from it arrives pre-built — that one setup saves an hour of typing per event.'],
        ['Get the most out of it', 'Set up your task Templates once here — every new event you build from a template arrives pre-populated, which is where most of the time savings in the platform come from.']
      ]
    },
    billing: {
      title: 'Billing',
      lead: 'Your subscription, payment method, and invoice history.',
      body: [
        ['How to use it', [
          '<b>Plan</b> — see your current plan and what it includes.',
          '<b>Payment method</b> — add or update the card on file.',
          '<b>Invoices</b> — view and download past invoices for your records.'
        ]],
        ['For example', 'Your plan renews monthly. Before the card on file expires, update it under <b>Payment method</b>. At tax time, open <b>Invoices</b> and download last year\u2019s receipts in a couple of clicks.'],
        ['Get the most out of it', 'Download invoices straight from here at tax time instead of requesting them — they\u2019re always available under your account.']
      ]
    },
    members: {
      title: 'Team Members',
      lead: 'Manage who is on your team and what they can do.',
      body: [
        ['How to use it', [
          '<b>+ Add Member</b> — invite a teammate by email.',
          '<b>Roles</b> — set admin, manager, or staff to control what each person can see and edit.',
          '<b>Reassign</b> — move ownership of events and contacts between people.'
        ]],
        ['For example', 'Invite jordan@yourco.com as a <b>Manager</b> so they see their team\u2019s contacts and events but not billing. Set your seasonal staff to <b>Staff</b> so they only see the tasks and contacts assigned to them.'],
        ['Get the most out of it', 'Roles drive visibility across the whole app — for example, staff only see the contacts and tasks assigned to them — so getting roles right here keeps everyone focused on their own work.']
      ]
    }
  };

  /* Map a filename to a content slug when data-page is missing. */
  var FILE_SLUG = {
    'eventlogicpro-dashboard': 'dashboard',
    'eventlogicpro-calendar': 'calendar',
    'eventlogicpro': 'tasks',
    'eventlogicpro-budget': 'budget',
    'eventlogicpro-packages': 'packages',
    'eventlogicpro-schedule': 'schedule',
    'eventlogicpro-documents': 'documents',
    'eventlogicpro-contacts': 'contacts',
    'eventlogicpro-questions': 'questions',
    'eventlogicpro-sitemap': 'sitemap',
    'eventlogicpro-settings': 'settings',
    'eventlogicpro-billing': 'billing',
    'eventlogicpro-members': 'members'
  };

  /* ----------------------------- HELPERS ---------------------------------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function seenKey(slug) { return CONFIG.storagePrefix + 'seen_' + slug; }
  function flashKey(slug) {
    return CONFIG.flashScope === 'perpage'
      ? CONFIG.storagePrefix + 'flashed_' + slug
      : CONFIG.storagePrefix + 'home_shown';
  }

  function resolveSlug() {
    var dp = document.body.getAttribute('data-page');
    if (dp && ELP_HELP_CONTENT[dp]) return dp;
    var file = (location.pathname.split('/').pop() || '').replace(/\.html?$/i, '').replace(/__\d+_$/, '');
    if (FILE_SLUG[file] && ELP_HELP_CONTENT[FILE_SLUG[file]]) return FILE_SLUG[file];
    return null; // unknown page (e.g. media) — no auto-show, no button
  }

  function buildBodyHTML(entry) {
    var html = '<p class="elp-help-lead">' + entry.lead + '</p>';
    entry.body.forEach(function (section) {
      if (Array.isArray(section[1])) {
        html += '<h3>' + section[0] + '</h3>';
        html += '<ul>' + section[1].map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</ul>';
      } else if (section[0] === 'For example') {
        html += '<div class="elp-help-eg"><span class="elp-help-eg-tag">For example</span>' + section[1] + '</div>';
      } else {
        html += '<h3>' + section[0] + '</h3><p>' + section[1] + '</p>';
      }
    });
    return html;
  }

  /* ----------------- HOME-SCREEN / INSTALL-AS-APP META --------------------
     Adds a web manifest + iOS/Android meta so "Add to Home Screen" produces a
     proper app icon. Only adds tags that are missing, so it won't duplicate
     anything a page already has. */
  function setMetaName(name, content) {
    if (document.querySelector('meta[name="' + name + '"]')) return;
    var m = document.createElement('meta');
    m.setAttribute('name', name); m.setAttribute('content', content);
    document.head.appendChild(m);
  }
  function setLinkRel(rel, href) {
    if (document.querySelector('link[rel="' + rel + '"]')) return;
    var l = document.createElement('link');
    l.setAttribute('rel', rel); l.setAttribute('href', href);
    document.head.appendChild(l);
  }
  function ensureHomeScreenMeta() {
    if (!CONFIG.addHomeScreenMeta) return;
    setLinkRel('manifest', CONFIG.manifestHref);
    setMetaName('theme-color', CONFIG.themeColor);
    setMetaName('apple-mobile-web-app-capable', 'yes');
    setMetaName('mobile-web-app-capable', 'yes');
    setMetaName('apple-mobile-web-app-status-bar-style', 'default');
    setMetaName('apple-mobile-web-app-title', CONFIG.appName);
    setLinkRel('apple-touch-icon', CONFIG.touchIcon);
  }

  /* ------------------------------ STYLES ---------------------------------- */
  /* Uses the app's own CSS variables, so it follows light/dark automatically. */
  function injectStyles() {
    if (document.getElementById('elpHelpStyles')) return;
    var css = `
.elp-help-fab{position:fixed;right:20px;bottom:24px;z-index:99998;width:46px;height:46px;border-radius:50%;
  background:var(--bg-card,#fff);color:var(--accent,#DC2626);border:1.5px solid var(--accent,#DC2626);
  font-size:20px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 22px rgba(0,0,0,.16);transition:transform .15s ease, background .15s ease, color .15s ease;}
.elp-help-fab:hover{background:var(--accent,#DC2626);color:#fff;transform:translateY(-1px);}
.elp-help-fab:focus-visible{outline:3px solid var(--accent,#DC2626);outline-offset:2px;}
@media(max-width:768px){.elp-help-fab{bottom:150px;right:16px;width:42px;height:42px;font-size:18px;}}

.elp-help-fab.elp-flash{animation:elpHelpPulse 1.4s ease-out 1;}
@keyframes elpHelpPulse{
  0%{box-shadow:0 6px 22px rgba(0,0,0,.16),0 0 0 0 var(--accent,#DC2626);transform:scale(1);}
  18%{transform:scale(1.14);}
  100%{box-shadow:0 6px 22px rgba(0,0,0,.16),0 0 0 22px rgba(220,38,38,0);transform:scale(1);}
}

.elp-help-hint{position:fixed;right:74px;bottom:30px;z-index:99998;background:var(--accent,#DC2626);color:#fff;
  font:600 13px/1.2 inherit;padding:9px 13px;border-radius:9px;box-shadow:0 6px 22px rgba(0,0,0,.22);
  opacity:0;transform:translateX(6px);pointer-events:none;transition:opacity .25s ease, transform .25s ease;white-space:nowrap;}
.elp-help-hint::after{content:"";position:absolute;right:-6px;top:50%;margin-top:-6px;border:6px solid transparent;border-left-color:var(--accent,#DC2626);}
.elp-help-hint.show{opacity:1;transform:translateX(0);}
@media(max-width:768px){.elp-help-hint{right:64px;bottom:154px;}}

.elp-help-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:20px;
  background:rgba(0,0,0,.55);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}
.elp-help-overlay.show{display:flex;animation:elpHelpFade .2s ease;}
@keyframes elpHelpFade{from{opacity:0}to{opacity:1}}

.elp-help-card{background:var(--bg-card,#fff);color:var(--text-primary,#111);border:1px solid var(--border,#e2e4e8);
  border-radius:16px;max-width:600px;width:100%;max-height:86vh;overflow-y:auto;position:relative;
  box-shadow:0 24px 70px rgba(0,0,0,.35);animation:elpHelpRise .24s cubic-bezier(.2,.7,.3,1);}
@keyframes elpHelpRise{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.elp-help-card-head{padding:22px 26px 6px;}
.elp-help-eyebrow{font:600 11px/1 inherit;letter-spacing:.12em;text-transform:uppercase;color:var(--accent,#DC2626);margin:0 0 6px;}
.elp-help-card h2{font-size:22px;font-weight:700;margin:0;letter-spacing:-.2px;}
.elp-help-x{position:absolute;top:14px;right:16px;background:none;border:none;font-size:26px;line-height:1;cursor:pointer;color:var(--text-secondary,#6b7280);}
.elp-help-x:hover{color:var(--accent,#DC2626);}
.elp-help-body{padding:4px 26px 8px;}
.elp-help-lead{font-size:14px;line-height:1.6;color:var(--text-secondary,#444);margin:8px 0 4px;}
.elp-help-body h3{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-primary,#111);margin:18px 0 6px;}
.elp-help-body ul{margin:0 0 4px;padding:0 0 0 18px;}
.elp-help-body li{font-size:13.5px;line-height:1.6;color:var(--text-secondary,#444);margin-bottom:5px;}
.elp-help-body p{font-size:13.5px;line-height:1.6;color:var(--text-secondary,#444);margin:4px 0;}
.elp-help-body b{color:var(--text-primary,#111);font-weight:600;}
.elp-help-eg{position:relative;background:var(--bg-hover,#f0f0f3);border-left:3px solid var(--accent,#DC2626);
  padding:12px 14px 12px;border-radius:0 9px 9px 0;font-size:13px;line-height:1.62;color:var(--text-secondary,#444);margin:14px 0 2px;}
.elp-help-eg-tag{display:block;font:700 10px/1 inherit;letter-spacing:.1em;text-transform:uppercase;color:var(--accent,#DC2626);margin-bottom:6px;}
.elp-help-eg b{color:var(--text-primary,#111);font-weight:600;}
.elp-help-foot{padding:12px 26px 22px;display:flex;align-items:center;justify-content:flex-end;gap:10px;position:sticky;bottom:0;background:var(--bg-card,#fff);}
.elp-help-got{appearance:none;border:none;cursor:pointer;font:600 14px/1 inherit;padding:11px 20px;border-radius:9px;margin-left:auto;
  background:var(--accent,#DC2626);color:#fff;transition:background .15s ease;}
.elp-help-got:hover{background:var(--accent-hover,#B91C1C);}
.elp-help-got:focus-visible{outline:3px solid var(--text-primary,#111);outline-offset:2px;}
.elp-help-install{appearance:none;cursor:pointer;font:600 14px/1 inherit;padding:10px 16px;border-radius:9px;
  background:transparent;color:var(--accent,#DC2626);border:1.5px solid var(--accent,#DC2626);transition:all .15s ease;display:inline-flex;align-items:center;gap:6px;}
.elp-help-install:hover{background:var(--accent,#DC2626);color:#fff;}
.elp-help-install:disabled{opacity:.6;cursor:default;}
.elp-help-iosnote{background:var(--bg-hover,#f0f0f3);border:1px solid var(--accent,#DC2626);border-radius:9px;
  padding:11px 13px;font-size:13px;line-height:1.55;color:var(--text-secondary,#444);margin:0 0 12px;}
.elp-help-iosnote b{color:var(--text-primary,#111);}

@media(prefers-reduced-motion:reduce){
  .elp-help-fab.elp-flash{animation:none;}
  .elp-help-overlay.show,.elp-help-card{animation:none;}
}`;
    var s = document.createElement('style');
    s.id = 'elpHelpStyles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ------------------------- BUILD DOM PIECES ----------------------------- */
  var overlay, card, fab, hint, lastFocus;
  var deferredInstall = null, refreshInstallBtn = null, installBtn = null;

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
           window.navigator.standalone === true;
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isMobileUA() { return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent); }

  function showIosHint() {
    if (!overlay) return;
    var body = overlay.querySelector('.elp-help-body');
    if (!body) return;
    if (!overlay.querySelector('.elp-help-iosnote')) {
      var note = document.createElement('div');
      note.className = 'elp-help-iosnote';
      note.innerHTML = 'iPhone can\u2019t add the icon for you automatically. In <b>Safari</b>, tap the <b>Share</b> icon (the square with an up arrow), then <b>Add to Home Screen</b>.';
      body.insertBefore(note, body.firstChild);
      note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function buildOverlay(entry) {
    overlay = document.createElement('div');
    overlay.className = 'elp-help-overlay';
    overlay.id = 'elpHelpOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', entry.title + ' help');
    overlay.innerHTML =
      '<div class="elp-help-card" role="document">' +
        '<button class="elp-help-x" aria-label="Close">&times;</button>' +
        '<div class="elp-help-card-head">' +
          '<p class="elp-help-eyebrow">How to use this page</p>' +
          '<h2>' + entry.title + '</h2>' +
        '</div>' +
        '<div class="elp-help-body">' + buildBodyHTML(entry) + '</div>' +
        '<div class="elp-help-foot"><button class="elp-help-install" id="elpInstallBtn" type="button" style="display:none;">Add to phone</button><button class="elp-help-got">Got it</button></div>' +
      '</div>';
    document.body.appendChild(overlay);
    card = overlay.querySelector('.elp-help-card');

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.elp-help-x').addEventListener('click', close);
    overlay.querySelector('.elp-help-got').addEventListener('click', close);

    installBtn = overlay.querySelector('#elpInstallBtn');
    refreshInstallBtn = function () {
      if (!installBtn) return;
      if (isStandalone()) { installBtn.style.display = 'none'; return; }      // already installed
      if (deferredInstall) { installBtn.textContent = isMobileUA() ? 'Add to phone' : 'Install app'; installBtn.style.display = ''; return; }
      if (isIOS()) { installBtn.textContent = 'Add to iPhone'; installBtn.style.display = ''; return; }
      installBtn.style.display = 'none';                                      // not installable here
    };
    installBtn.addEventListener('click', function () {
      if (deferredInstall) {                  // Android / Chromium: one-tap native install
        installBtn.disabled = true;
        deferredInstall.prompt();
        Promise.resolve(deferredInstall.userChoice).then(function (c) {
          if (c && c.outcome === 'accepted') installBtn.textContent = '\u2713 Added';
          deferredInstall = null; installBtn.disabled = false;
          setTimeout(refreshInstallBtn, 1500);
        }).catch(function () { installBtn.disabled = false; });
      } else if (isIOS()) {                   // iPhone: Apple allows manual only — show the steps
        showIosHint();
      }
    });
    refreshInstallBtn();
  }

  function buildFab() {
    fab = document.createElement('button');
    fab.className = 'elp-help-fab';
    fab.id = 'elpHelpFab';
    fab.type = 'button';
    fab.textContent = '?';
    fab.title = 'How to use this page';
    fab.setAttribute('aria-label', 'How to use this page');
    fab.addEventListener('click', function () { open(); });
    document.body.appendChild(fab);

    hint = document.createElement('div');
    hint.className = 'elp-help-hint';
    hint.textContent = CONFIG.flashHint;
    document.body.appendChild(hint);
  }

  /* ---------------------------- OPEN / CLOSE ------------------------------ */
  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add('show');
    if (refreshInstallBtn) refreshInstallBtn();
    var got = overlay.querySelector('.elp-help-got');
    if (got) got.focus();
  }

  function close() {
    overlay.classList.remove('show');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lsSet(seenKey(slug), '1');
    maybeFlashHome();
  }

  function maybeFlashHome() {
    if (lsGet(flashKey(slug))) return;          // already taught — never again
    lsSet(flashKey(slug), '1');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    fab.classList.remove('elp-flash');
    void fab.offsetWidth;                        // restart animation
    if (!reduce) fab.classList.add('elp-flash');
    hint.classList.add('show');
    setTimeout(function () { hint.classList.remove('show'); }, 2600);
  }

  /* ------------------------- NEUTRALIZE LEGACY ---------------------------- */
  function neutralizeLegacy() {
    if (CONFIG.hideLegacyHelpButton) {
      document.querySelectorAll('.help-btn').forEach(function (b) { b.style.display = 'none'; });
    }
    var legacy = document.getElementById('helpModalOverlay');
    if (legacy) legacy.remove();
    window.openHelpModal = function () { open(); };
    window.closeHelpModal = close;
  }

  /* -------------------------------- INIT ---------------------------------- */
  var slug;
  function init() {
    ensureHomeScreenMeta();            // make every page installable as an app
    slug = resolveSlug();
    if (!slug) return;                 // unknown/contextual page: stay invisible
    injectStyles();
    buildOverlay(ELP_HELP_CONTENT[slug]);
    buildFab();
    neutralizeLegacy();

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('show')) close();
    });

    // One-tap install support (Android / Chromium). iOS has no equivalent API.
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstall = e;
      if (refreshInstallBtn) refreshInstallBtn();
    });
    window.addEventListener('appinstalled', function () {
      deferredInstall = null;
      if (installBtn) installBtn.style.display = 'none';
    });

    if (CONFIG.autoShowOnFirstVisit && !lsGet(seenKey(slug))) {
      setTimeout(open, CONFIG.settleMs);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Testing helper: ElpHelp.reset() clears all "seen"/"flashed" flags. */
  window.ElpHelp = {
    open: function () { open(); },
    reset: function () {
      Object.keys(ELP_HELP_CONTENT).forEach(function (s) {
        try { localStorage.removeItem(seenKey(s)); localStorage.removeItem(CONFIG.storagePrefix + 'flashed_' + s); } catch (e) {}
      });
      try { localStorage.removeItem(CONFIG.storagePrefix + 'home_shown'); } catch (e) {}
    }
  };
})();
