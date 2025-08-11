/*
  Prompt API Service Worker
  Exposes read-only endpoints for the latest generated prompts without a backend:
    - /api/prompts/latest.json
    - /api/prompts/latest.txt
    - /api/prompts/:id.json
    - /api/prompts/:id.txt

  The app should postMessage({ type: 'PROMPTS_SAVE', id, prompts }) to store a batch.
*/

self.addEventListener('install', (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients as soon as possible
  event.waitUntil(self.clients.claim());
});

// In-memory store (resets when SW restarts)
const store = {
  latestId: null,
  items: /** @type {Record<string, { id: string; createdAt: number; prompts: Array<{ title: string; prompt: string }> }>} */ ({})
};

/**
 * Build plain text representation of prompts
 */
function toText(batch) {
  if (!batch) return '';
  const lines = batch.prompts.map((p, i) => `# ${p.title}\n${p.prompt}`);
  return lines.join("\n\n");
}

/**
 * Basic JSON response wrapper with CORS
 */
function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
    ...init,
  });
}

/**
 * Basic text response wrapper with CORS
 */
function text(s, init = {}) {
  return new Response(s, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
    ...init,
  });
}

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg && msg.type === 'PROMPTS_SAVE' && Array.isArray(msg.prompts)) {
    const id = String(msg.id || Date.now());
    const createdAt = Date.now();
    const prompts = msg.prompts.map((p) => ({ title: String(p.title || ''), prompt: String(p.prompt || '') }));
    store.items[id] = { id, createdAt, prompts };
    store.latestId = id;

    // Optionally confirm receipt
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({ type: 'PROMPTS_SAVED', id, count: prompts.length });
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const { pathname } = url;

  // Only handle our API routes
  if (!pathname.startsWith('/api/prompts/')) return;

  event.respondWith((async () => {
    // Patterns:
    // /api/prompts/latest.json | latest.txt
    // /api/prompts/:id.json | :id.txt
    let targetId = null;
    let format = 'json';

    const latestMatch = pathname.match(/^\/api\/prompts\/latest\.(json|txt)$/);
    if (latestMatch) {
      format = latestMatch[1];
      targetId = store.latestId;
    } else {
      const idMatch = pathname.match(/^\/api\/prompts\/([^\/]+)\.(json|txt)$/);
      if (idMatch) {
        targetId = idMatch[1];
        format = idMatch[2];
      }
    }

    if (!targetId || !store.items[targetId]) {
      return json({ error: 'No prompts available' }, { status: 404 });
    }

    const batch = store.items[targetId];

    if (format === 'txt') {
      return text(toText(batch));
    }

    return json({
      id: batch.id,
      createdAt: batch.createdAt,
      count: batch.prompts.length,
      prompts: batch.prompts,
    });
  })());
});
