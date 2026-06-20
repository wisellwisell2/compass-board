const BOARD_KEY = 'compass-board:main';

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

function getKv(env) {
  return env && env.COMPASS_BOARD_KV;
}

function validBoard(board) {
  return board && typeof board === 'object' && Array.isArray(board.phases) && Array.isArray(board.cards);
}

async function readStoredBoard(kv) {
  const stored = await kv.get(BOARD_KEY, { type: 'json' });
  if (!stored || typeof stored !== 'object') return null;
  return stored;
}

export async function onRequestGet({ env }) {
  const kv = getKv(env);
  if (!kv) return json({ ok: false, error: 'KV_BINDING_MISSING' }, { status: 500 });

  const stored = await readStoredBoard(kv);
  if (!stored) return json({ ok: false, error: 'BOARD_NOT_FOUND' }, { status: 404 });

  return json({
    ok: true,
    revision: Number.isInteger(stored.revision) ? stored.revision : 0,
    updatedAt: stored.updatedAt || null,
    updatedBy: stored.updatedBy || null,
    board: stored.board
  });
}

export async function onRequestPost({ request, env }) {
  const kv = getKv(env);
  if (!kv) return json({ ok: false, error: 'KV_BINDING_MISSING' }, { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  if (!validBoard(body.board)) {
    return json({ ok: false, error: 'INVALID_BOARD' }, { status: 400 });
  }

  const clientBaseRevision = Number.isInteger(body.baseRevision) ? body.baseRevision : 0;
  const current = await readStoredBoard(kv);
  const serverRevision = current && Number.isInteger(current.revision) ? current.revision : 0;

  if (clientBaseRevision !== serverRevision) {
    return json({
      ok: false,
      error: 'REVISION_CONFLICT',
      serverRevision,
      clientBaseRevision
    }, { status: 409 });
  }

  const nextRevision = serverRevision + 1;
  const updatedAt = new Date().toISOString();
  const updatedBy = typeof body.deviceId === 'string' && body.deviceId.trim()
    ? body.deviceId.trim().slice(0, 120)
    : 'unknown';

  await kv.put(BOARD_KEY, JSON.stringify({
    revision: nextRevision,
    updatedAt,
    updatedBy,
    board: body.board
  }));

  return json({
    ok: true,
    revision: nextRevision,
    updatedAt
  });
}
