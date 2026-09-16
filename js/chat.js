const WALL_KEY = 'kapoeInkedWallNotes';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(WALL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(notes.slice(0, 50)));
  } catch (e) { /* storage unavailable, ignore */ }
}

function renderWall() {
  const list = document.getElementById('wallList');
  if (!list) return;
  const notes = loadNotes();
  if (!notes.length) {
    list.innerHTML = '<p class="wall-empty">No notes yet — be the first to say hello.</p>';
    return;
  }
  list.innerHTML = notes.map((n) => `
    <div class="wall-entry">
      <div class="wall-entry-head">
        <span class="wall-entry-name">${escapeHtml(n.name)}</span>
        <span class="wall-entry-time">${formatTime(n.ts)}</span>
      </div>
      <p class="wall-entry-msg">${escapeHtml(n.message)}</p>
    </div>
  `).join('');
}

function initWall() {
  const form = document.getElementById('wallForm');
  if (!form) return;
  renderWall();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim().slice(0, 40);
    const message = form.message.value.trim().slice(0, 280);
    if (!name || !message) return;
    const notes = loadNotes();
    notes.unshift({ name, message, ts: Date.now() });
    saveNotes(notes);
    form.reset();
    renderWall();
  });
}

// ---------- Booking / idea forms ----------
async function submitInquiry(type, data, statusEl, form) {
  statusEl.textContent = 'Sending…';
  statusEl.className = 'form-status';
  try {
    const res = await fetch('/api/send-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || 'Something went wrong.');
    statusEl.textContent = 'Sent! Kapoe will follow up soon.';
    statusEl.className = 'form-status is-ok';
    form.reset();
  } catch (err) {
    statusEl.innerHTML = (err.message || 'Could not send that.') +
      ' Try Instagram <a href="https://www.instagram.com/kapoe.inked" target="_blank" rel="noopener">@kapoe.inked</a> instead.';
    statusEl.className = 'form-status is-error';
  }
}

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const status = document.getElementById('bookingStatus');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitInquiry('booking', {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      size: form.size.value,
      placement: form.placement.value.trim(),
      date: form.date.value,
      idea: form.idea.value.trim(),
    }, status, form);
  });
}

function initIdeaForm() {
  const form = document.getElementById('ideaForm');
  const status = document.getElementById('ideaStatus');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitInquiry('idea', {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      style: form.style.value,
      idea: form.idea.value.trim(),
      reference: form.reference.value.trim(),
    }, status, form);
  });
}

function boot() {
  initWall();
  initBookingForm();
  initIdeaForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
