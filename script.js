// script.js
// Fetch events.json and render a simple list of starred repositories.

const statusEl = document.getElementById('status');
const listEl = document.getElementById('starred-list');

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function renderEmpty() {
  statusEl.textContent = 'No starred repositories found.';
  listEl.innerHTML = '';
}

function renderList(items) {
  statusEl.textContent = '';
  listEl.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'repo';

    const nameLink = document.createElement('a');
    nameLink.className = 'name';
    nameLink.href = item.html_url || '#';
    nameLink.target = '_blank';
    nameLink.rel = 'noopener noreferrer';
    nameLink.textContent = `${item.owner ? item.owner + '/' : ''}${item.name}`;

    const desc = document.createElement('div');
    desc.className = 'description';
    desc.textContent = item.description || '';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const lang = document.createElement('span');
    lang.textContent = item.language || '—';
    const stars = document.createElement('span');
    stars.textContent = `★ ${item.stargazers_count ?? '0'}`;
    const starredAt = document.createElement('span');
    if (item.starred_at) starredAt.textContent = `Starred ${formatDate(item.starred_at)}`;

    meta.appendChild(lang);
    meta.appendChild(stars);
    if (item.starred_at) meta.appendChild(starredAt);

    li.appendChild(nameLink);
    if (item.description) li.appendChild(desc);
    li.appendChild(meta);

    listEl.appendChild(li);
  });
}

async function load() {
  try {
    const res = await fetch('events.json', {cache: "no-store"});
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      renderEmpty();
      return;
    }
    // Optionally sort newest first by starred_at if available
    data.sort((a,b) => {
      if (a.starred_at && b.starred_at) return new Date(b.starred_at) - new Date(a.starred_at);
      return 0;
    });
    renderList(data);
  } catch (err) {
    statusEl.textContent = 'Could not load starred repositories.';
    const errMsg = document.createElement('div');
    errMsg.className = 'muted';
    errMsg.textContent = `Error: ${err.message}`;
    // Clear previous children to avoid duplicates
    if (!statusEl.nextElementSibling || !statusEl.nextElementSibling.classList.contains('muted')) {
      statusEl.insertAdjacentElement('afterend', errMsg);
    }
    listEl.innerHTML = '';
    console.error('Failed to load events.json', err);
  }
}

document.addEventListener('DOMContentLoaded', load);