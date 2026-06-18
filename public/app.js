const state = {
  sort: 'createdAt',
  dir: 'desc',
  page: 1,
  perPage: 10,
  filter: '',
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return res.json();
}

async function loadStats() {
  const { stats } = await fetchJSON('/api/stats');
  const grid = document.getElementById('stat-grid');
  grid.innerHTML = stats.map((s) => {
    const positive = s.invert ? s.delta < 0 : s.delta > 0;
    const arrow = (s.invert ? s.delta < 0 : s.delta > 0) ? '▲' : '▼';
    const cls = positive ? 'pos' : 'neg';
    return `
      <div class="stat-card">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-delta ${cls}">${arrow} ${Math.abs(s.delta)}%</div>
      </div>`;
  }).join('');
}

let chart = null;
async function loadChart() {
  const { series } = await fetchJSON('/api/activity');
  const labels = series.map((p) => p.date.slice(5));
  const revenue = series.map((p) => p.revenue);
  const signups = series.map((p) => p.signups);
  const ctx = document.getElementById('chart');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenue,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y',
        },
        {
          label: 'Signups',
          data: signups,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a91a3' } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#8a91a3' } },
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a91a3' } },
      },
    },
  });
}

async function loadUsers() {
  const params = new URLSearchParams({
    page: state.page,
    perPage: state.perPage,
    sort: state.sort,
    dir: state.dir,
  });
  const { rows, total, page, perPage } = await fetchJSON(`/api/users?${params}`);
  const body = document.getElementById('users-body');
  const filtered = state.filter
    ? rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(state.filter.toLowerCase()))
      )
    : rows;
  body.innerHTML = filtered.map((r) => `
    <tr>
      <td>${escape(r.name)}</td>
      <td class="muted">${escape(r.email)}</td>
      <td><span class="pill">${escape(r.plan)}</span></td>
      <td><span class="status status-${r.status}">${escape(r.status)}</span></td>
      <td>$${r.mrr}</td>
      <td class="muted">${new Date(r.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');

  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(total / perPage);
  const buttons = [];
  for (let i = 1; i <= totalPages; i++) {
    buttons.push(`<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`);
  }
  pagination.innerHTML = buttons.join('');
  pagination.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page, 10);
      loadUsers();
    });
  });

  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.onclick = () => {
      const key = th.dataset.sort;
      if (state.sort === key) {
        state.dir = state.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort = key;
        state.dir = 'asc';
      }
      state.page = 1;
      loadUsers();
    };
  });
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

document.getElementById('user-search').addEventListener('input', (e) => {
  state.filter = e.target.value;
  loadUsers();
});

const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebar-backdrop');
if (hamburger && sidebar) {
  const setOpen = (open) => {
    sidebar.classList.toggle('open', open);
    if (backdrop) {
      backdrop.classList.toggle('show', open);
      backdrop.hidden = !open;
    }
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  hamburger.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
  if (backdrop) backdrop.addEventListener('click', () => setOpen(false));
  sidebar.querySelectorAll('.nav-item').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) setOpen(false);
  });
}

loadStats();
loadChart();
loadUsers();
