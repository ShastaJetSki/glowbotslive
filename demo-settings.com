<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Settings — Life Logic</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
:root{
  --bg-primary:#f4f5f7;--bg-secondary:#ebedf1;--bg-card:#ffffff;--bg-hover:#f0f0f3;
  --border:#e2e4e8;--text-primary:#1a1a1a;--text-secondary:#6b7280;
  --accent:#4F46E5;--accent-hover:#4338CA;
  --accent-glow:rgba(79,70,229,.10);
  --shadow:0 2px 12px rgba(0,0,0,.06);--input-bg:#fafafa;--modal-overlay:rgba(0,0,0,.45);
  --green:#16A34A;--red:#DC2626;
}
body.dark{
  --bg-primary:#111;--bg-secondary:#1a1a1a;--bg-card:#222;--bg-hover:#2a2a2a;
  --border:#333;--text-primary:#f0f0f0;--text-secondary:#999;
  --accent:#6366F1;--accent-hover:#818CF8;
  --accent-glow:rgba(99,102,241,.15);
  --shadow:0 2px 12px rgba(0,0,0,.3);--input-bg:#1a1a1a;--modal-overlay:rgba(0,0,0,.75);
}
html{background:var(--bg-primary);}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg-primary);color:var(--text-primary);padding-bottom:140px;}

.desktop-header{position:sticky;top:0;z-index:100;background:var(--bg-primary);border-bottom:1px solid var(--border);}
.header-top{padding:10px 24px;display:flex;justify-content:space-between;align-items:center;}
.header-left{display:flex;align-items:center;gap:16px;}
.brand-icon{width:36px;height:36px;background:var(--accent);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.header-titles h1{font-size:24px;font-weight:700;}
.header-titles .sub{font-size:11px;color:var(--accent);font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
.header-right{display:flex;gap:10px;align-items:center;}
.dark-toggle{width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;}
.dark-toggle svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;}
.settings-link,.logout-link{font-size:13px;color:var(--text-secondary);text-decoration:none;cursor:pointer;padding:4px 8px;border-radius:6px;}
.settings-link:hover,.logout-link:hover{color:var(--text-primary);background:var(--bg-hover);}
.nav-bar{display:flex;justify-content:space-between;align-items:center;padding:0 24px;border-top:1px solid var(--border);}
.nav-left{display:flex;gap:4px;}
.nav-btn{padding:10px 16px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;border-radius:8px;}
.nav-btn:hover{color:var(--text-primary);background:var(--bg-hover);}
.nav-btn.active{color:var(--accent);font-weight:600;}

.mobile-top-header{display:none;position:sticky;top:0;z-index:100;background:var(--bg-primary);border-bottom:1px solid var(--border);}
.m-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;}
.m-title{font-size:17px;font-weight:700;}
.m-sub{font-size:10px;color:var(--accent);font-weight:600;}
.mobile-bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:var(--bg-card);border-top:1px solid var(--border);padding:8px 12px 20px;box-shadow:0 -4px 20px rgba(0,0,0,.08);}
.m-nav-top{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;}
.m-nav-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;border-radius:10px;text-decoration:none;color:var(--text-secondary);font-size:10px;font-weight:500;}
.m-nav-btn svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
.m-nav-btn.active{color:var(--accent);}
.m-nav-btn.active svg{stroke:var(--accent);}

.page-wrap{max-width:800px;margin:0 auto;padding:20px 24px;}
.section-hd{font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;margin-top:24px;}
.settings-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);margin-bottom:16px;}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);}
.settings-row:last-child{border-bottom:none;}
.settings-row-left{display:flex;align-items:center;gap:12px;}
.settings-row-icon{width:36px;height:36px;border-radius:9px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:17px;}
.settings-row-title{font-size:14px;font-weight:600;}
.settings-row-sub{font-size:12px;color:var(--text-secondary);margin-top:2px;}
.settings-row-right{display:flex;align-items:center;gap:10px;}
.btn-sm{padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--bg-hover);color:var(--text-primary);transition:all .15s;}
.btn-sm:hover{background:var(--bg-secondary);}
.btn-sm.accent{background:var(--accent);color:#fff;border-color:var(--accent);}
.btn-sm.accent:hover{background:var(--accent-hover);}
.btn-sm.danger{background:rgba(220,38,38,.1);color:var(--red);border-color:rgba(220,38,38,.2);}
.toggle-switch{width:42px;height:24px;background:var(--border);border-radius:12px;cursor:pointer;position:relative;transition:background .2s;}
.toggle-switch.on{background:var(--accent);}
.toggle-knob{position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);}
.toggle-switch.on .toggle-knob{left:20px;}

/* CATEGORIES LIST */
.cat-manage-list{padding:8px 0;}
.cat-manage-row{display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--border);transition:background .1s;}
.cat-manage-row:last-child{border-bottom:none;}
.cat-manage-row:hover{background:var(--bg-hover);}
.cat-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
.cat-manage-icon{font-size:18px;}
.cat-manage-name{flex:1;font-size:14px;font-weight:500;}
.cat-manage-meta{font-size:12px;color:var(--text-secondary);}
.cat-manage-btn{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text-secondary);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;}
.cat-manage-btn:hover{background:var(--bg-hover);}

/* MODAL */
.modal-overlay{display:none;position:fixed;inset:0;background:var(--modal-overlay);z-index:500;align-items:flex-end;justify-content:center;}
.modal-overlay.open{display:flex;}
.modal-content{background:var(--bg-card);width:100%;max-width:480px;border-radius:20px 20px 0 0;padding:24px;max-height:85vh;overflow-y:auto;}
@media(min-width:600px){.modal-content{border-radius:16px;margin-bottom:20px;}}
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.modal-title{font-size:18px;font-weight:700;}
.modal-close{width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-secondary);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;}
.form-group{margin-bottom:14px;}
.form-label{display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:5px;text-transform:uppercase;letter-spacing:.4px;}
.form-input,.form-select{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--input-bg);color:var(--text-primary);font-size:14px;outline:none;}
.form-input:focus,.form-select:focus{border-color:var(--accent);}
.emoji-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin-top:8px;}
.emoji-opt{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;border:2px solid transparent;}
.emoji-opt:hover{background:var(--bg-hover);}
.emoji-opt.selected{border-color:var(--accent);background:var(--accent-glow);}
.color-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}
.color-opt{width:32px;height:32px;border-radius:8px;cursor:pointer;border:3px solid transparent;}
.color-opt.selected{border-color:var(--text-primary);transform:scale(1.1);}
.form-actions{display:flex;gap:10px;margin-top:20px;}
.btn-primary{flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;}
.btn-primary:hover{background:var(--accent-hover);}
.btn-secondary{padding:12px 20px;background:var(--bg-hover);color:var(--text-primary);border:1px solid var(--border);border-radius:10px;font-size:15px;cursor:pointer;}
.btn-danger-full{padding:12px;background:rgba(220,38,38,.1);color:var(--red);border:1px solid rgba(220,38,38,.2);border-radius:10px;font-size:14px;cursor:pointer;font-weight:600;}

#toast{position:fixed;bottom:140px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:500;z-index:9999;opacity:0;pointer-events:none;transition:opacity .3s;white-space:nowrap;}
#toast.show{opacity:1;}
body.dark #toast{background:#f0f0f0;color:#111;}

.sql-box{background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'Courier New',monospace;font-size:11px;color:var(--text-secondary);line-height:1.6;overflow-x:auto;white-space:pre;}
.copy-btn{margin-top:8px;padding:6px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary);font-size:12px;cursor:pointer;}
.copy-btn:hover{background:var(--bg-hover);}

@media(max-width:768px){
  .desktop-header{display:none;}
  .mobile-top-header{display:block;}
  .mobile-bottom-nav{display:block;}
  .page-wrap{padding:12px 12px;}
}
@media(min-width:769px){
  .mobile-top-header{display:none;}
  .mobile-bottom-nav{display:none;}
}
  </style>
</head>
<body>

<div class="mobile-top-header">
  <div class="m-bar">
    <div><div class="m-title">Settings</div><div class="m-sub">Life Logic</div></div>
    <button class="dark-toggle" onclick="toggleDark()">
      <svg id="mMoon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg id="mSun" viewBox="0 0 24 24" style="display:none;"><circle cx="12" cy="12" r="5"/></svg>
    </button>
  </div>
</div>

<div class="desktop-header">
  <div class="header-top">
    <div class="header-left">
      <div class="brand-icon">✅</div>
      <div class="header-titles"><h1>Settings</h1><div class="sub">Life Logic</div></div>
    </div>
    <div class="header-right">
      <button class="dark-toggle" onclick="toggleDark()">
        <svg id="dMoon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg id="dSun" viewBox="0 0 24 24" style="display:none;"><circle cx="12" cy="12" r="5"/></svg>
      </button>
      <a class="logout-link" onclick="doLogout()">Logout</a>
    </div>
  </div>
  <div class="nav-bar">
    <div class="nav-left">
      <a href="demo-dashboard.html" class="nav-btn">🏠 Dashboard</a>
      <a href="demo-tasks.html" class="nav-btn">✅ Tasks</a>
      <a href="demo-calendar.html" class="nav-btn">📅 Calendar</a>
      <a href="demo-goals.html" class="nav-btn">🎯 Goals</a>
      <a href="demo-settings.html" class="nav-btn active">⚙️ Settings</a>
    </div>
  </div>
</div>

<div class="page-wrap">

  <!-- ACCOUNT -->
  <div class="section-hd">Account</div>
  <div class="settings-card">
    <div class="settings-row">
      <div class="settings-row-left">
        <div class="settings-row-icon">👤</div>
        <div>
          <div class="settings-row-title" id="userEmail">Loading…</div>
          <div class="settings-row-sub">Your account email</div>
        </div>
      </div>
    </div>
    <div class="settings-row">
      <div class="settings-row-left">
        <div class="settings-row-icon">🌙</div>
        <div>
          <div class="settings-row-title">Dark Mode</div>
          <div class="settings-row-sub">Toggle light / dark theme</div>
        </div>
      </div>
      <div class="settings-row-right">
        <div class="toggle-switch" id="darkToggle" onclick="toggleDarkSetting()"><div class="toggle-knob"></div></div>
      </div>
    </div>
    <div class="settings-row">
      <div class="settings-row-left">
        <div class="settings-row-icon">🚪</div>
        <div>
          <div class="settings-row-title">Sign Out</div>
          <div class="settings-row-sub">Log out of Life Logic</div>
        </div>
      </div>
      <div class="settings-row-right">
        <button class="btn-sm danger" onclick="doLogout()">Sign Out</button>
      </div>
    </div>
  </div>

  <!-- CATEGORIES -->
  <div class="section-hd" style="display:flex;justify-content:space-between;align-items:center;">
    <span>Categories</span>
    <button class="btn-sm accent" onclick="openCatModal()">+ New Category</button>
  </div>
  <div class="settings-card">
    <div id="catManageList"><div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">Loading…</div></div>
  </div>

  <!-- SUBSCRIPTION -->
  <div class="section-hd">Subscription</div>
  <div class="settings-card">
    <div class="settings-row">
      <div class="settings-row-left">
        <div class="settings-row-icon">💳</div>
        <div>
          <div class="settings-row-title">Life Logic Monthly</div>
          <div class="settings-row-sub" id="subStatus">Checking subscription status…</div>
        </div>
      </div>
      <div class="settings-row-right">
        <button class="btn-sm accent" onclick="manageSubscription()">Manage</button>
      </div>
    </div>
  </div>

  <!-- DATABASE SETUP -->
  <div class="section-hd">Database Setup (Run Once in Supabase)</div>
  <div class="settings-card">
    <div style="padding:16px;">
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px;">Run this SQL in your Supabase SQL Editor to create all required tables:</div>
      <div class="sql-box" id="sqlBox">-- LIFE LOGIC TABLES (all prefixed todo_)

CREATE TABLE IF NOT EXISTS todo_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid,
  name text NOT NULL,
  icon text DEFAULT '📋',
  color text DEFAULT '#4F46E5',
  section text DEFAULT 'life',
  sort_order int DEFAULT 0,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todo_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid,
  category_id uuid REFERENCES todo_categories(id),
  parent_id uuid REFERENCES todo_tasks(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo',
  priority text DEFAULT 'medium',
  due_date date,
  completed_at timestamptz,
  sort_order int DEFAULT 0,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todo_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid,
  category_id uuid,
  name text NOT NULL,
  description text,
  type text DEFAULT 'goal',
  status text DEFAULT 'dreaming',
  target_date date,
  estimated_cost numeric,
  notes text,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security (enable for each table)
ALTER TABLE todo_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users own categories" ON todo_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own tasks" ON todo_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own goals" ON todo_goals FOR ALL USING (auth.uid() = user_id);</div>
      <button class="copy-btn" onclick="copySQL()">📋 Copy SQL</button>
    </div>
  </div>

</div>

<!-- MOBILE BOTTOM NAV -->
<div class="mobile-bottom-nav">
  <div class="m-nav-top">
    <a href="demo-dashboard.html" class="m-nav-btn">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard
    </a>
    <a href="demo-tasks.html" class="m-nav-btn">
      <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Tasks
    </a>
    <a href="demo-calendar.html" class="m-nav-btn">
      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Calendar
    </a>
    <a href="demo-goals.html" class="m-nav-btn">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Goals
    </a>
    <a href="demo-settings.html" class="m-nav-btn active">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings
    </a>
  </div>
</div>

<!-- CAT MODAL -->
<div class="modal-overlay" id="catModal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-title" id="catModalTitle">New Category</div>
      <button class="modal-close" onclick="closeCatModal()">×</button>
    </div>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input type="text" class="form-input" id="catName" placeholder="e.g. House, Car, Work Project…">
    </div>
    <div class="form-group">
      <label class="form-label">Icon</label>
      <div class="emoji-grid" id="emojiGrid"></div>
    </div>
    <div class="form-group">
      <label class="form-label">Color</label>
      <div class="color-grid" id="colorGrid"></div>
    </div>
    <div class="form-group">
      <label class="form-label">Section</label>
      <select class="form-select" id="catSection">
        <option value="life">🏡 Life</option>
        <option value="work">💼 Work</option>
        <option value="personal">👤 Personal</option>
        <option value="hobbies">🎨 Hobbies</option>
        <option value="goals">🎯 Goals & Dreams</option>
      </select>
    </div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeCatModal()">Cancel</button>
      <div style="display:flex;gap:8px;flex:1;">
        <button class="btn-danger-full" id="catDeleteBtn" onclick="deleteCat()" style="display:none;">Delete</button>
        <button class="btn-primary" onclick="saveCat()">Save</button>
      </div>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>

// ===== MOCK DATA =====
var userId = 'demo-user';
var tenantId = 'demo-tenant';

var today = new Date();
function ds(offsetDays) {
  var d = new Date(today); d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}
function ts(offsetDays) {
  var d = new Date(today); d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

var allCategories = [
  { id:'cat1',  name:'House',            icon:'🏠', color:'#2563EB', section:'life',     sort_order:1, is_active:true },
  { id:'cat2',  name:'Motorcycle',       icon:'🏍️', color:'#DC2626', section:'life',     sort_order:2, is_active:true },
  { id:'cat3',  name:'Jet Ski',          icon:'🚤', color:'#0891B2', section:'life',     sort_order:3, is_active:true },
  { id:'cat4',  name:'Car',              icon:'🚗', color:'#7C3AED', section:'life',     sort_order:4, is_active:true },
  { id:'cat5',  name:'Garden',           icon:'🌱', color:'#16A34A', section:'life',     sort_order:5, is_active:true },
  { id:'cat6',  name:'Q3 Launch',        icon:'🚀', color:'#D97706', section:'work',     sort_order:1, is_active:true },
  { id:'cat7',  name:'Client Projects',  icon:'💼', color:'#4F46E5', section:'work',     sort_order:2, is_active:true },
  { id:'cat8',  name:'Fitness',          icon:'💪', color:'#EA580C', section:'personal', sort_order:1, is_active:true },
  { id:'cat9',  name:'Health',           icon:'🏥', color:'#BE185D', section:'personal', sort_order:2, is_active:true },
  { id:'cat10', name:'Guitar',           icon:'🎸', color:'#7C3AED', section:'hobbies',  sort_order:1, is_active:true },
  { id:'cat11', name:'Travel Planning',  icon:'✈️', color:'#0891B2', section:'hobbies',  sort_order:2, is_active:true },
];

var allTasks = [
  // HOUSE
  { id:'t1',  user_id:'demo-user', category_id:'cat1', parent_id:null, title:'Fix roof leak above garage',        status:'todo',        priority:'urgent', due_date:ds(-3),  is_active:true, completed_at:null },
  { id:'t2',  user_id:'demo-user', category_id:'cat1', parent_id:null, title:'Paint living room & hallway',       status:'in_progress', priority:'medium', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t3',  user_id:'demo-user', category_id:'cat1', parent_id:null, title:'Replace water heater',             status:'todo',        priority:'high',   due_date:ds(5),   is_active:true, completed_at:null },
  { id:'t4',  user_id:'demo-user', category_id:'cat1', parent_id:null, title:'Clean gutters & downspouts',       status:'done',        priority:'medium', due_date:ds(-10), is_active:true, completed_at:ts(-10) },
  { id:'t5',  user_id:'demo-user', category_id:'cat1', parent_id:null, title:'Install ceiling fan in bedroom',   status:'todo',        priority:'low',    due_date:ds(12),  is_active:true, completed_at:null },
  { id:'t6',  user_id:'demo-user', category_id:'cat1', parent_id:null, title:'Reseal driveway cracks',           status:'done',        priority:'medium', due_date:ds(-5),  is_active:true, completed_at:ts(-5) },
  { id:'t7',  user_id:'demo-user', category_id:'cat1', parent_id:'t2', title:'Buy paint supplies at Home Depot', status:'done',        priority:'medium', due_date:ds(-2),  is_active:true, completed_at:ts(-2) },
  { id:'t8',  user_id:'demo-user', category_id:'cat1', parent_id:'t2', title:'Tape trim and baseboards',         status:'in_progress', priority:'medium', due_date:ds(0),   is_active:true, completed_at:null },
  // MOTORCYCLE
  { id:'t9',  user_id:'demo-user', category_id:'cat2', parent_id:null, title:'Oil & filter change',              status:'todo',        priority:'urgent', due_date:ds(-5),  is_active:true, completed_at:null },
  { id:'t10', user_id:'demo-user', category_id:'cat2', parent_id:null, title:'Replace front & rear tires',       status:'todo',        priority:'high',   due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t11', user_id:'demo-user', category_id:'cat2', parent_id:null, title:'Chain lubrication & tension check',status:'done',        priority:'medium', due_date:ds(-7),  is_active:true, completed_at:ts(-7) },
  { id:'t12', user_id:'demo-user', category_id:'cat2', parent_id:null, title:'Renew registration tags',          status:'todo',        priority:'urgent', due_date:ds(-1),  is_active:true, completed_at:null },
  { id:'t13', user_id:'demo-user', category_id:'cat2', parent_id:null, title:'Full detail & polish bodywork',    status:'todo',        priority:'low',    due_date:ds(14),  is_active:true, completed_at:null },
  { id:'t14', user_id:'demo-user', category_id:'cat2', parent_id:null, title:'Check brake pads',                 status:'done',        priority:'high',   due_date:ds(-4),  is_active:true, completed_at:ts(-4) },
  // JET SKI
  { id:'t15', user_id:'demo-user', category_id:'cat3', parent_id:null, title:'Winterize and flush engine',       status:'done',        priority:'high',   due_date:ds(-14), is_active:true, completed_at:ts(-14) },
  { id:'t16', user_id:'demo-user', category_id:'cat3', parent_id:null, title:'Replace spark plugs',              status:'todo',        priority:'high',   due_date:ds(-2),  is_active:true, completed_at:null },
  { id:'t17', user_id:'demo-user', category_id:'cat3', parent_id:null, title:'Charge & test battery',            status:'todo',        priority:'medium', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t18', user_id:'demo-user', category_id:'cat3', parent_id:null, title:'Wax & buff hull',                  status:'todo',        priority:'low',    due_date:ds(7),   is_active:true, completed_at:null },
  { id:'t19', user_id:'demo-user', category_id:'cat3', parent_id:null, title:'Book marina storage slot',         status:'done',        priority:'medium', due_date:ds(-6),  is_active:true, completed_at:ts(-6) },
  { id:'t20', user_id:'demo-user', category_id:'cat3', parent_id:null, title:'Inspect life jackets & flares',    status:'todo',        priority:'medium', due_date:ds(3),   is_active:true, completed_at:null },
  // CAR
  { id:'t21', user_id:'demo-user', category_id:'cat4', parent_id:null, title:'Oil change — 5,000 miles overdue', status:'todo',        priority:'urgent', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t22', user_id:'demo-user', category_id:'cat4', parent_id:null, title:'Replace front brake pads',         status:'todo',        priority:'high',   due_date:ds(-1),  is_active:true, completed_at:null },
  { id:'t23', user_id:'demo-user', category_id:'cat4', parent_id:null, title:'Tire rotation & balance',          status:'done',        priority:'medium', due_date:ds(-8),  is_active:true, completed_at:ts(-8) },
  { id:'t24', user_id:'demo-user', category_id:'cat4', parent_id:null, title:'Interior detail & vacuum',         status:'todo',        priority:'low',    due_date:ds(6),   is_active:true, completed_at:null },
  { id:'t25', user_id:'demo-user', category_id:'cat4', parent_id:null, title:'Replace windshield wipers',        status:'done',        priority:'low',    due_date:ds(-3),  is_active:true, completed_at:ts(-3) },
  // GARDEN
  { id:'t26', user_id:'demo-user', category_id:'cat5', parent_id:null, title:'Plant tomatoes & peppers',         status:'todo',        priority:'medium', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t27', user_id:'demo-user', category_id:'cat5', parent_id:null, title:'Fertilize front lawn',             status:'todo',        priority:'medium', due_date:ds(3),   is_active:true, completed_at:null },
  { id:'t28', user_id:'demo-user', category_id:'cat5', parent_id:null, title:'Trim hedges & shape shrubs',       status:'todo',        priority:'low',    due_date:ds(-4),  is_active:true, completed_at:null },
  { id:'t29', user_id:'demo-user', category_id:'cat5', parent_id:null, title:'Install drip irrigation system',   status:'in_progress', priority:'high',   due_date:ds(10),  is_active:true, completed_at:null },
  { id:'t30', user_id:'demo-user', category_id:'cat5', parent_id:null, title:'Order heirloom seed packets',      status:'done',        priority:'low',    due_date:ds(-5),  is_active:true, completed_at:ts(-5) },
  // Q3 LAUNCH
  { id:'t31', user_id:'demo-user', category_id:'cat6', parent_id:null, title:'Finalize product specs doc',       status:'todo',        priority:'urgent', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t32', user_id:'demo-user', category_id:'cat6', parent_id:null, title:'Design review with UX team',       status:'todo',        priority:'high',   due_date:ds(-2),  is_active:true, completed_at:null },
  { id:'t33', user_id:'demo-user', category_id:'cat6', parent_id:null, title:'QA regression testing',            status:'in_progress', priority:'high',   due_date:ds(4),   is_active:true, completed_at:null },
  { id:'t34', user_id:'demo-user', category_id:'cat6', parent_id:null, title:'Write launch marketing brief',     status:'todo',        priority:'medium', due_date:ds(5),   is_active:true, completed_at:null },
  { id:'t35', user_id:'demo-user', category_id:'cat6', parent_id:null, title:'Launch day checklist review',      status:'done',        priority:'high',   due_date:ds(-1),  is_active:true, completed_at:ts(-1) },
  // CLIENT PROJECTS
  { id:'t36', user_id:'demo-user', category_id:'cat7', parent_id:null, title:'Proposal for Apex Corp project',   status:'todo',        priority:'urgent', due_date:ds(-3),  is_active:true, completed_at:null },
  { id:'t37', user_id:'demo-user', category_id:'cat7', parent_id:null, title:'Weekly status report',             status:'done',        priority:'medium', due_date:ds(-1),  is_active:true, completed_at:ts(-1) },
  { id:'t38', user_id:'demo-user', category_id:'cat7', parent_id:null, title:'Invoice — Smith & Co. retainer',   status:'todo',        priority:'high',   due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t39', user_id:'demo-user', category_id:'cat7', parent_id:null, title:'Prep slides for Thursday call',    status:'todo',        priority:'medium', due_date:ds(2),   is_active:true, completed_at:null },
  // FITNESS
  { id:'t40', user_id:'demo-user', category_id:'cat8', parent_id:null, title:'Morning 5-mile run',               status:'done',        priority:'medium', due_date:ds(0),   is_active:true, completed_at:ts(0) },
  { id:'t41', user_id:'demo-user', category_id:'cat8', parent_id:null, title:'Leg day at the gym',               status:'todo',        priority:'medium', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t42', user_id:'demo-user', category_id:'cat8', parent_id:null, title:'Sunday meal prep',                 status:'done',        priority:'medium', due_date:ds(-2),  is_active:true, completed_at:ts(-2) },
  { id:'t43', user_id:'demo-user', category_id:'cat8', parent_id:null, title:'Register for local 5K race',       status:'todo',        priority:'low',    due_date:ds(7),   is_active:true, completed_at:null },
  // HEALTH
  { id:'t44', user_id:'demo-user', category_id:'cat9', parent_id:null, title:'Annual physical exam',             status:'todo',        priority:'high',   due_date:ds(-6),  is_active:true, completed_at:null },
  { id:'t45', user_id:'demo-user', category_id:'cat9', parent_id:null, title:'Dentist — overdue 18 months',      status:'todo',        priority:'urgent', due_date:ds(-10), is_active:true, completed_at:null },
  { id:'t46', user_id:'demo-user', category_id:'cat9', parent_id:null, title:'Eye exam & new glasses',           status:'todo',        priority:'medium', due_date:ds(4),   is_active:true, completed_at:null },
  { id:'t47', user_id:'demo-user', category_id:'cat9', parent_id:null, title:'Pick up prescription refill',      status:'todo',        priority:'high',   due_date:ds(0),   is_active:true, completed_at:null },
  // GUITAR
  { id:'t48', user_id:'demo-user', category_id:'cat10', parent_id:null, title:'Practice F barre chord 30 min',  status:'todo',        priority:'medium', due_date:ds(0),   is_active:true, completed_at:null },
  { id:'t49', user_id:'demo-user', category_id:'cat10', parent_id:null, title:'Learn "Wonderwall" chord changes',status:'in_progress', priority:'low',    due_date:ds(6),   is_active:true, completed_at:null },
  { id:'t50', user_id:'demo-user', category_id:'cat10', parent_id:null, title:'Tune guitar & replace B string',  status:'done',        priority:'low',    due_date:ds(-3),  is_active:true, completed_at:ts(-3) },
  { id:'t51', user_id:'demo-user', category_id:'cat10', parent_id:null, title:'Buy a pack of Dunlop picks',      status:'todo',        priority:'low',    due_date:ds(5),   is_active:true, completed_at:null },
  // TRAVEL
  { id:'t52', user_id:'demo-user', category_id:'cat11', parent_id:null, title:'Book flights to Japan (Oct)',     status:'todo',        priority:'high',   due_date:ds(2),   is_active:true, completed_at:null },
  { id:'t53', user_id:'demo-user', category_id:'cat11', parent_id:null, title:'Research Kyoto ryokan hotels',    status:'in_progress', priority:'medium', due_date:ds(8),   is_active:true, completed_at:null },
  { id:'t54', user_id:'demo-user', category_id:'cat11', parent_id:null, title:'Get travel insurance quotes',     status:'todo',        priority:'high',   due_date:ds(-1),  is_active:true, completed_at:null },
  { id:'t55', user_id:'demo-user', category_id:'cat11', parent_id:null, title:'Buy new carry-on luggage',        status:'done',        priority:'medium', due_date:ds(-4),  is_active:true, completed_at:ts(-4) },
  { id:'t56', user_id:'demo-user', category_id:'cat11', parent_id:null, title:'Renew passport (expires Aug)',    status:'todo',        priority:'urgent', due_date:ds(-7),  is_active:true, completed_at:null },
];

var allGoals = [
  { id:'g1',  user_id:'demo-user', category_id:'cat11', name:'Japan Autumn Trip',           description:'2-week trip through Tokyo, Kyoto, and Osaka during fall foliage season.', type:'vacation',    status:'planning',    target_date:ds(180), estimated_cost:6500, is_active:true },
  { id:'g2',  user_id:'demo-user', category_id:'cat11', name:'Road Trip — Pacific Coast Hwy', description:'Drive Highway 1 from San Francisco to San Diego over 10 days.',           type:'vacation',    status:'dreaming',    target_date:ds(90),  estimated_cost:2200, is_active:true },
  { id:'g3',  user_id:'demo-user', category_id:'cat11', name:'Cancún All-Inclusive',         description:'Family beach vacation, all-inclusive resort for 7 days.',                  type:'vacation',    status:'booked',      target_date:ds(60),  estimated_cost:3800, is_active:true },
  { id:'g4',  user_id:'demo-user', category_id:'cat8',  name:'Run a Half Marathon',          description:'Train consistently and complete a 13.1 mile race.',                        type:'goal',        status:'in_progress', target_date:ds(120), estimated_cost:150,  is_active:true },
  { id:'g5',  user_id:'demo-user', category_id:'cat1',  name:'Finish Basement Renovation',   description:'Full basement finishing — drywall, flooring, bar area.',                   type:'goal',        status:'planning',    target_date:ds(365), estimated_cost:18000, is_active:true },
  { id:'g6',  user_id:'demo-user', category_id:'cat6',  name:'Launch SaaS Product v2.0',     description:'Full redesign and feature expansion for Q3 launch.',                       type:'goal',        status:'in_progress', target_date:ds(45),  estimated_cost:null, is_active:true },
  { id:'g7',  user_id:'demo-user', category_id:null,    name:'Skydive solo jump',            description:'Get licensed for solo skydiving. Complete AFF course.',                    type:'bucket_list', status:'dreaming',    target_date:null,    estimated_cost:2500, is_active:true },
  { id:'g8',  user_id:'demo-user', category_id:null,    name:'See the Northern Lights',      description:'Alaska or Iceland — witness aurora borealis in person.',                   type:'bucket_list', status:'dreaming',    target_date:null,    estimated_cost:4000, is_active:true },
  { id:'g9',  user_id:'demo-user', category_id:null,    name:'Ride motorcycle across country', description:'Coast-to-coast motorcycle trip on the open road.',                       type:'bucket_list', status:'planning',    target_date:null,    estimated_cost:3500, is_active:true },
  { id:'g10', user_id:'demo-user', category_id:null,    name:'Learn to surf',                description:'Take surfing lessons in Hawaii or California.',                             type:'bucket_list', status:'dreaming',    target_date:null,    estimated_cost:800,  is_active:true },
  { id:'g11', user_id:'demo-user', category_id:null,    name:'Write a novel',                description:'Finally commit to writing a full fiction novel. 80k words.',               type:'someday',     status:'dreaming',    target_date:null,    estimated_cost:null, is_active:true },
  { id:'g12', user_id:'demo-user', category_id:null,    name:'Buy a sailboat',               description:'Learn to sail and eventually own a 28ft+ sailboat.',                       type:'someday',     status:'dreaming',    target_date:null,    estimated_cost:35000, is_active:true },
  { id:'g13', user_id:'demo-user', category_id:null,    name:'Build a workshop garage',      description:'Detached workshop with woodworking tools and lift for the car.',            type:'someday',     status:'planning',    target_date:null,    estimated_cost:45000, is_active:true },
  { id:'g14', user_id:'demo-user', category_id:'cat11', name:'Europe River Cruise',          description:'7-day Rhine river cruise with stops in Germany, Austria, Switzerland.',    type:'vacation',    status:'dreaming',    target_date:ds(500), estimated_cost:7200, is_active:true },
  { id:'g15', user_id:'demo-user', category_id:null,    name:'Pay off the house',            description:'Accelerate mortgage payoff with extra principal payments.',                type:'goal',        status:'in_progress', target_date:ds(1800),estimated_cost:null, is_active:true },
];
// ===== END MOCK DATA =====

var SUPABASE_URL = 'https://kxqkwpkmtgvmthpafoqx.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4cWt3cGttdGd2bXRocGFmb3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDI1OTQsImV4cCI6MjA4MTAxODU5NH0.GT9pOMqrUr1EvVLh1magyoB4I_LprziRaybKsGHhrX4';
var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


var editingCatId = null;
var selectedEmoji = '📋', selectedColor = '#4F46E5';
var EMOJIS = ['🏠','🚗','🌿','💼','👤','🎨','🎯','✈️','🏋️','📚','🛒','💊','🔧','🎵','🍽️','💰','🐾','👶','💻','🌙','☀️','🎮','🏕️','🛁','🌺','🏔️','🎸','🎬','📝','⚽'];
var COLORS = ['#4F46E5','#DC2626','#16A34A','#D97706','#2563EB','#7C3AED','#EA580C','#0891B2','#BE185D','#065F46'];

var isDark = localStorage.getItem('ll_dark_mode') === 'true';
if (isDark) document.body.classList.add('dark');
function applyDarkIcons() {
  var d = document.body.classList.contains('dark');
  ['dMoon','mMoon'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=d?'none':'block'; });
  ['dSun','mSun'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display=d?'block':'none'; });
  var dt = document.getElementById('darkToggle');
  if (dt) dt.classList.toggle('on', d);
}
applyDarkIcons();
function toggleDark() { document.body.classList.toggle('dark'); isDark=document.body.classList.contains('dark'); localStorage.setItem('ll_dark_mode',isDark); applyDarkIcons(); }
function toggleDarkSetting() { toggleDark(); }
function toast(m) { var t=document.getElementById('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove('show'); },2400); }
async function doLogout() { await sb.auth.signOut(); localStorage.removeItem('sb_access_token'); localStorage.removeItem('sb_refresh_token'); location.replace('/'); }
async function checkAuth() {
  var r=await sb.auth.getSession(); var s=r.data.session;
  if(!s){ var t=localStorage.getItem('sb_access_token'),rf=localStorage.getItem('sb_refresh_token'); if(t&&rf){ var sr=await sb.auth.setSession({access_token:t,refresh_token:rf}); s=sr.data?.session; } if(!s){ location.replace('/'); return null; } }
  return s;
}
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function manageSubscription() { toast('Opening Stripe billing…'); }
function copySQL() {
  var sql = document.getElementById('sqlBox').textContent;
  navigator.clipboard.writeText(sql).then(function(){ toast('SQL copied!'); });
}

function renderCatList() {
  var el = document.getElementById('catManageList');
  if (!allCategories.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">No categories yet. Create your first one!</div>';
    return;
  }
  var sections = ['life','work','personal','hobbies','goals'];
  var secLabels = {life:'🏡 Life',work:'💼 Work',personal:'👤 Personal',hobbies:'🎨 Hobbies',goals:'🎯 Goals'};
  var html = '';
  sections.forEach(function(sec){
    var cats = allCategories.filter(function(c){ return c.section===sec; });
    if (!cats.length) return;
    html += '<div style="padding:8px 18px 4px;font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--border);">'+secLabels[sec]+'</div>';
    cats.forEach(function(c){
      var cnt = taskCounts[c.id] || 0;
      html += '<div class="cat-manage-row">' +
        '<div class="cat-dot" style="background:'+(c.color||'#4F46E5')+'"></div>' +
        '<span class="cat-manage-icon">'+(c.icon||'📋')+'</span>' +
        '<span class="cat-manage-name">'+esc(c.name)+'</span>' +
        '<span class="cat-manage-meta">'+cnt+' task'+(cnt!==1?'s':'')+'</span>' +
        '<button class="cat-manage-btn" onclick="openCatModal(\''+c.id+'\')">✏️</button>' +
      '</div>';
    });
  });
  el.innerHTML = html || '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">No categories yet.</div>';
}

function buildEmojiGrid() {
  document.getElementById('emojiGrid').innerHTML = EMOJIS.map(function(e){ return '<div class="emoji-opt'+(e===selectedEmoji?' selected':'')+'" onclick="selectEmoji(this,\''+e+'\')">'+e+'</div>'; }).join('');
}
function buildColorGrid() {
  document.getElementById('colorGrid').innerHTML = COLORS.map(function(c){ return '<div class="color-opt'+(c===selectedColor?' selected':'')+'" style="background:'+c+'" onclick="selectColor(this,\''+c+'\')"></div>'; }).join('');
}
function selectEmoji(el, e) { document.querySelectorAll('.emoji-opt').forEach(function(x){ x.classList.remove('selected'); }); el.classList.add('selected'); selectedEmoji=e; }
function selectColor(el, c) { document.querySelectorAll('.color-opt').forEach(function(x){ x.classList.remove('selected'); }); el.classList.add('selected'); selectedColor=c; }

function openCatModal(catId) {
  editingCatId = catId || null;
  selectedEmoji = '📋'; selectedColor = '#4F46E5';
  document.getElementById('catModalTitle').textContent = catId ? 'Edit Category' : 'New Category';
  document.getElementById('catDeleteBtn').style.display = catId ? 'block' : 'none';
  document.getElementById('catName').value = '';
  document.getElementById('catSection').value = 'life';
  if (catId) {
    var cat = allCategories.find(function(c){ return c.id===catId; });
    if (cat) {
      document.getElementById('catName').value = cat.name||'';
      document.getElementById('catSection').value = cat.section||'life';
      selectedEmoji = cat.icon||'📋';
      selectedColor = cat.color||'#4F46E5';
    }
  }
  buildEmojiGrid(); buildColorGrid();
  document.getElementById('catModal').classList.add('open');
}
function closeCatModal() { document.getElementById('catModal').classList.remove('open'); }

async function saveCat() {
  var name = document.getElementById('catName').value.trim();
  if (!name) { toast('Name required'); return; }
  var data = { name:name, icon:selectedEmoji, color:selectedColor, section:document.getElementById('catSection').value, user_id:userId, is_active:true };
  var r;
  if (editingCatId) {
    r = await sb.from('todo_categories').update(data).eq('id',editingCatId).select().single();
    if (!r.error) { var idx=allCategories.findIndex(function(c){ return c.id===editingCatId; }); if(idx>=0) allCategories[idx]=r.data; }
  } else {
    r = await sb.from('todo_categories').insert(data).select().single();
    if (!r.error) allCategories.push(r.data);
  }
  if (r.error) { toast('Error: '+r.error.message); return; }
  toast(editingCatId ? 'Category updated!' : 'Category created!');
  closeCatModal(); renderCatList();
}

async function deleteCat() {
  if (!editingCatId || !confirm('Delete this category? Tasks will remain.')) return;
  await sb.from('todo_categories').update({is_active:false}).eq('id',editingCatId);
  allCategories = allCategories.filter(function(c){ return c.id!==editingCatId; });
  closeCatModal(); renderCatList(); toast('Category deleted');
}

function loadData() {
  taskCounts = {};
  allTasks.forEach(function(t){ if(t.category_id) taskCounts[t.category_id]=(taskCounts[t.category_id]||0)+1; });
  renderCatList();
  document.getElementById('subStatus').textContent = '✅ Active subscription — Life Logic Pro';
}
document.getElementById('userEmail').textContent = 'demo@lifelogic.app';
loadData();
</script>
</body>
</html>
