<script type="module">
  import { supabase } from './supabase-config.js';

  const tableBody = document.getElementById('workorders-body');
  const table = document.getElementById('workorders-table');
  const status = document.getElementById('status');

  async function fetchWorkOrders() {
    try {
      const { data, error } = await supabase
        .from('workorder')
        .select(`
          id,
          description,
          status,
          created_at,
          customer:customers(name),
          assigned_user:users(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        status.textContent = 'No work orders found.';
        return;
      }

      tableBody.innerHTML = data.map(wo => `
        <tr>
          <td>${wo.id}</td>
          <td>${wo.description}</td>
          <td>${wo.status}</td>
          <td>${new Date(wo.created_at).toLocaleString()}</td>
          <td>${wo.customer?.name || 'N/A'}</td>
          <td>${wo.assigned_user?.email || 'N/A'}</td>
        </tr>
      `).join('');

      status.style.display = 'none';
      table.style.display = 'table';
    } catch (err) {
      console.error(err);
      status.textContent = 'Error loading work orders.';
      status.classList.add('error');
    }
  }

  fetchWorkOrders();
</script>
