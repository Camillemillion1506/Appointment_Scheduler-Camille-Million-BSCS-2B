// app.js - frontend interactions for clients, services, appointments
const api = {
  clients: 'get_clients.php',
  addClient: 'add_client.php',
  updateClient: 'update_client.php',
  deleteClient: 'delete_client.php',

  services: 'get_services.php',
  addService: 'add_service.php',
  updateService: 'update_service.php',
  deleteService: 'delete_service.php',

  appointments: 'get_appointments.php',
  addAppt: 'add_appointment.php',
  updateAppt: 'update_appointment.php',
  deleteAppt: 'delete_appointment.php'
};

document.addEventListener('DOMContentLoaded', () => {
  // load initial data
  loadClients();
  loadServices();
  loadAppointments();

  // clients
  document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const first = document.getElementById('clientFirst').value.trim();
    const last = document.getElementById('clientLast').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    if (!first || !last) { alert('Please enter client first and last name'); return; }
    const res = await postJSON(api.addClient, { first_name: first, last_name: last, email, phone });
    if (res && res.success) {
      document.getElementById('clientForm').reset();
      loadClients();
    } else {
      alert(res && res.error ? res.error : 'Unable to add client');
    }
  });

  // services
  document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('serviceName').value.trim();
    const duration = parseInt(document.getElementById('serviceDuration').value, 10);
    const price = parseFloat(document.getElementById('servicePrice').value || 0);
    if (!name) { alert('Service name required'); return; }
    const res = await postJSON(api.addService, { name, duration_minutes: duration, price });
    if (res && res.success) {
      document.getElementById('serviceForm').reset();
      loadServices();
    } else {
      alert(res && res.error ? res.error : 'Unable to add service');
    }
  });

  // appointments
  document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const client_id = +document.getElementById('clientSelect').value;
    const service_id = +document.getElementById('serviceSelect').value;
    const appointment_date = document.getElementById('datetime').value;
    const notes = document.getElementById('notes').value.trim();
    if (!client_id || !service_id || !appointment_date) { alert('Please complete required fields.'); return; }
    const res = await postJSON(api.addAppt, { client_id, service_id, appointment_date, notes });
    if (res && res.success) {
      document.getElementById('appointmentForm').reset();
      loadAppointments();
    } else {
      alert(res && res.error ? res.error : 'Unable to add appointment');
    }
  });

  document.getElementById('refreshBtn').addEventListener('click', loadAppointments);

  // edit modal
  document.getElementById('cancelEdit').addEventListener('click', closeModal);
  document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = +document.getElementById('editId').value;
    const appointment_date = document.getElementById('editDatetime').value;
    const status = document.getElementById('editStatus').value;
    const notes = document.getElementById('editNotes').value.trim();
    const client_id = +document.getElementById('editClient').value;
    const service_id = +document.getElementById('editService').value;
    const payload = { id, appointment_date, status, notes, client_id, service_id };
    const res = await postJSON(api.updateAppt, payload);
    if (res && res.success) {
      closeModal();
      loadAppointments();
    } else {
      alert(res && res.error ? res.error : 'Update failed');
    }
  });
});

// ---- Loaders and renderers ----
async function loadClients(){
  const data = await fetchJSON(api.clients);
  // populate select elements
  const clientSelect = document.getElementById('clientSelect');
  const editClient = document.getElementById('editClient');
  clientSelect.innerHTML = '<option value="">Select client</option>';
  editClient.innerHTML = '';
  // table
  const tbody = document.querySelector('#clientsTable tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  if (!data) { tbody.innerHTML = '<tr><td colspan="4">Error loading clients</td></tr>'; return; }
  tbody.innerHTML = '';
  data.forEach(c => {
    const name = escapeHtml(c.first_name + ' ' + c.last_name);
    clientSelect.appendChild(option(c.id, name));
    editClient.appendChild(option(c.id, name));

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${name}</td>
                    <td>${escapeHtml(c.email || '')}</td>
                    <td>${escapeHtml(c.phone || '')}</td>
                    <td>
                      <button class="edit-client" data-id="${c.id}">Edit</button>
                      <button class="del-client" data-id="${c.id}">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });

  // attach events for client edit/delete
  document.querySelectorAll('.del-client').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this client and their appointments?')) return;
    const res = await postJSON(api.deleteClient, { id: +btn.dataset.id });
    if (res && res.success) loadClients(), loadAppointments();
    else alert(res && res.error ? res.error : 'Delete failed');
  }));

  document.querySelectorAll('.edit-client').forEach(btn => btn.addEventListener('click', async () => {
    const id = +btn.dataset.id;
    const c = data.find(x => +x.id === id);
    if (!c) return alert('Client not found');
    const first = prompt('First name', c.first_name);
    if (first === null) return;
    const last = prompt('Last name', c.last_name);
    if (last === null) return;
    const email = prompt('Email', c.email || '');
    if (email === null) return;
    const phone = prompt('Phone', c.phone || '');
    if (phone === null) return;
    const res = await postJSON(api.updateClient, { id, first_name: first.trim(), last_name: last.trim(), email: email.trim(), phone: phone.trim() });
    if (res && res.success) { loadClients(); loadAppointments(); } else alert(res && res.error ? res.error : 'Update failed');
  }));
}

async function loadServices(){
  const data = await fetchJSON(api.services);
  const serviceSelect = document.getElementById('serviceSelect');
  const editService = document.getElementById('editService');
  serviceSelect.innerHTML = '<option value="">Select service</option>';
  editService.innerHTML = '';
  const tbody = document.querySelector('#servicesTable tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  if (!data) { tbody.innerHTML = '<tr><td colspan="4">Error loading services</td></tr>'; return; }
  tbody.innerHTML = '';
  data.forEach(s => {
    serviceSelect.appendChild(option(s.id, `${escapeHtml(s.name)} (${s.duration_minutes}m)`));
    editService.appendChild(option(s.id, `${escapeHtml(s.name)} (${s.duration_minutes}m)`));
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(s.name)}</td>
                    <td>${escapeHtml(String(s.duration_minutes))} min</td>
                    <td>${escapeHtml(String(s.price))}</td>
                    <td>
                      <button class="edit-service" data-id="${s.id}">Edit</button>
                      <button class="del-service" data-id="${s.id}">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.del-service').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this service? If it is used by appointments delete will fail.')) return;
    const res = await postJSON(api.deleteService, { id: +btn.dataset.id });
    if (res && res.success) loadServices(), loadAppointments();
    else alert(res && res.error ? res.error : 'Delete failed');
  }));

  document.querySelectorAll('.edit-service').forEach(btn => btn.addEventListener('click', async () => {
    const id = +btn.dataset.id;
    const s = data.find(x => +x.id === id);
    if (!s) return alert('Service not found');
    const name = prompt('Service name', s.name);
    if (name === null) return;
    const duration = prompt('Duration (minutes)', s.duration_minutes);
    if (duration === null) return;
    const price = prompt('Price', s.price);
    if (price === null) return;
    const res = await postJSON(api.updateService, { id, name: name.trim(), duration_minutes: parseInt(duration,10), price: parseFloat(price) });
    if (res && res.success) loadServices(); else alert(res && res.error ? res.error : 'Update failed');
  }));
}

async function loadAppointments(){
  const tbody = document.querySelector('#appointmentsTable tbody');
  tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  const data = await fetchJSON(api.appointments);
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No appointments found</td></tr>';
    return;
  }
  tbody.innerHTML = '';
  data.forEach((a, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}</td>
      <td>${escapeHtml(a.service_name)}</td>
      <td>${formatDateTime(a.appointment_date)}</td>
      <td>${escapeHtml(a.status)}</td>
      <td>${escapeHtml(a.notes || '')}</td>
      <td>
        <button data-id="${a.id}" class="editBtn">Edit</button>
        <button data-id="${a.id}" class="delBtn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // attach event listeners
  document.querySelectorAll('.delBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this appointment?')) return;
      const id = +btn.dataset.id;
      const res = await postJSON(api.deleteAppt, { id });
      if (res && res.success) loadAppointments();
      else alert(res && res.error ? res.error : 'Delete failed');
    });
  });

  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = +btn.dataset.id;
      const rows = await fetchJSON(api.appointments);
      const appt = rows.find(r => +r.id === id);
      if (!appt) { alert('Appointment not found'); return; }
      openModal(appt);
    });
  });
}

// ---- Modal helpers ----
function openModal(appt){
  document.getElementById('editId').value = appt.id;
  document.getElementById('editDatetime').value = toInputDateTime(appt.appointment_date);
  document.getElementById('editStatus').value = appt.status;
  document.getElementById('editNotes').value = appt.notes || '';
  // ensure clients/services selects are populated
  document.getElementById('editClient').value = appt.client_id;
  document.getElementById('editService').value = appt.service_id;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal(){ document.getElementById('modal').classList.add('hidden'); }

// ---- Utility helpers ----
function option(value, text){ const o = document.createElement('option'); o.value = value; o.textContent = text; return o; }
async function fetchJSON(url){
  try {
    const res = await fetch(url);
    if (!res.ok) { console.error('HTTP', res.status); return null; }
    return await res.json();
  } catch (e) { console.error(e); return null; }
}
async function postJSON(url, payload){
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) { console.error(e); return null; }
}
function formatDateTime(dt){ 
  const d = new Date(dt);
  return isNaN(d) ? dt : d.toLocaleString();
}
function toInputDateTime(dt){
  const d = new Date(dt);
  if (isNaN(d)) return '';
  const pad = n => n.toString().padStart(2,'0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth()+1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }