// =============================================
// SUPABASE CONNECTION
// Add this to the <head> of your HTML files
// =============================================

/*
In your HTML <head>, add:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
*/

// =============================================
// Configuration
// =============================================
const SUPABASE_URL = 'https://vvkjydmzmevcfkxivrxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2p5ZG16bWV2Y2ZreGl2cnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDYxNTksImV4cCI6MjA4MDcyMjE1OX0.Np7X3nwwCK1k5p2UPByO7SONeZ_k4Gt5gK96vcfJHl0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// Authentication Functions
// =============================================

async function loginUser(email, password) {
  try {
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // Get user details from users table using auth_user_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userError) throw userError;

    // Format full name
    const fullName = `${userData.first_name || 'User'} ${userData.last_name || ''}`.trim();

    // Store session data
    sessionStorage.setItem('userEmail', userData.email);
    sessionStorage.setItem('userName', fullName);
    sessionStorage.setItem('userRole', userData.role);
    sessionStorage.setItem('userId', userData.id);
    sessionStorage.setItem('authUserId', authData.user.id);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('loginTime', new Date().toISOString());
    sessionStorage.setItem('supabaseToken', authData.session.access_token);

    // Only set business info if user has an account (not super_admin)
    if (userData.account_id && userData.role !== 'super_admin') {
      // Get account details separately
      const { data: accountData } = await supabase
        .from('accounts')
        .select('id, business_name, tax_rate, subscription_tier')
        .eq('id', userData.account_id)
        .single();

      if (accountData) {
        sessionStorage.setItem('businessId', accountData.id);
        sessionStorage.setItem('businessName', accountData.business_name);
      }
    } else if (userData.role === 'super_admin') {
      // Super admin doesn't have a specific business
      sessionStorage.setItem('businessId', 'all');
      sessionStorage.setItem('businessName', 'System Administrator');
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

async function logoutUser() {
  await supabase.auth.signOut();
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// =============================================
// Data Fetching Functions
// =============================================

async function fetchOrders() {
  const userRole = sessionStorage.getItem('userRole');
  const userId = sessionStorage.getItem('userId');
  const businessId = sessionStorage.getItem('businessId');

  let query = supabase
    .from('repair_orders')
    .select(`
      *,
      contact:contacts!repair_orders_contact_id_fkey(
        first_name,
        last_name,
        phone,
        email
      ),
      vehicle:vehicles!repair_orders_vehicle_id_fkey(
        year,
        make,
        model,
        registration_number,
        vin
      ),
      assigned_user:users!repair_orders_assigned_to_fkey(
        first_name,
        last_name,
        role
      )
    `)
    .eq('account_id', businessId)
    .order('scheduled_date', { ascending: false });

  // Filter by technician if logged in as employee
  if (userRole === 'employee') {
    query = query.eq('assigned_to', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  // Format data for dashboard
  return data.map(order => ({
    id: order.id,
    order_number: order.order_number,
    customer: order.contact ? `${order.contact.first_name} ${order.contact.last_name}` : 'Unknown',
    phone: order.contact?.phone || '',
    vehicle: order.vehicle ? `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}` : 'Unknown',
    license_plate: order.vehicle?.registration_number || '',
    vin: order.vehicle?.vin || '',
    service: order.service_description,
    scheduled_date: order.scheduled_date,
    status: order.status,
    total_amount: parseFloat(order.total_amount) || 0,
    technician: order.assigned_user ? `${order.assigned_user.first_name} ${order.assigned_user.last_name}` : 'Unassigned',
    techId: order.assigned_to,
    estimated_hours: parseFloat(order.labor_hours) || 0,
    labor_total: parseFloat(order.labor_total) || 0,
    parts_total: parseFloat(order.parts_total) || 0,
    tax_total: parseFloat(order.tax_amount) || 0
  }));
}

async function fetchCustomers() {
  const businessId = sessionStorage.getItem('businessId');

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('account_id', businessId)
    .eq('type', 'customer')
    .order('last_name');

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data;
}

async function fetchVehicles(contactId = null) {
  const businessId = sessionStorage.getItem('businessId');

  let query = supabase
    .from('vehicles')
    .select('*, contact:contacts(first_name, last_name)')
    .eq('account_id', businessId);

  if (contactId) {
    query = query.eq('contact_id', contactId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }

  return data;
}

async function fetchTechnicians() {
  const businessId = sessionStorage.getItem('businessId');

  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, phone, role')
    .eq('account_id', businessId)
    .eq('role', 'employee')
    .is('deleted_at', null)
    .order('first_name');

  if (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }

  return data.map(tech => ({
    ...tech,
    full_name: `${tech.first_name} ${tech.last_name}`
  }));
}

async function createWorkOrder(orderData) {
  const businessId = sessionStorage.getItem('businessId');

  const { data, error } = await supabase
    .from('repair_orders')
    .insert([{
      account_id: businessId,
      order_number: orderData.order_number,
      contact_id: orderData.contact_id,
      vehicle_id: orderData.vehicle_id,
      assigned_to: orderData.assigned_to,
      status: orderData.status || 'scheduled',
      scheduled_date: orderData.scheduled_date,
      service_description: orderData.service_description,
      labor_total: orderData.labor_total,
      parts_total: orderData.parts_total,
      tax_amount: orderData.tax_amount,
      total_amount: orderData.total_amount,
      notes: orderData.notes
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating work order:', error);
    throw error;
  }

  return data;
}

async function updateWorkOrder(orderId, updates) {
  const { data, error } = await supabase
    .from('repair_orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating work order:', error);
    throw error;
  }

  return data;
}

// =============================================
// Utility Functions
// =============================================

function checkAuth() {
  const isAuth = sessionStorage.getItem('isAuthenticated');
  const token = sessionStorage.getItem('supabaseToken');
  
  if (!isAuth || !token) {
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

function getBusinessId() {
  return sessionStorage.getItem('businessId');
}

function getUserRole() {
  return sessionStorage.getItem('userRole');
}

function getUserId() {
  return sessionStorage.getItem('userId');
}

// =============================================
// Export for use in other files
// =============================================
window.ServiceLogicDB = {
  supabase,
  loginUser,
  logoutUser,
  fetchOrders,
  fetchCustomers,
  fetchVehicles,
  fetchTechnicians,
  createWorkOrder,
  updateWorkOrder,
  checkAuth,
  getBusinessId,
  getUserRole,
  getUserId
};
