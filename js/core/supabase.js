const supabaseClient = (() => {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.warn('[Supabase] URL ou anonKey não configurados. Usando apenas localStorage.');
    return null;
  }
  try {
    return supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (e) {
    console.warn('[Supabase] Erro ao criar cliente:', e.message);
    return null;
  }
})();

// Mapeamento de colunas lowercase do PostgreSQL → camelCase usado no JS
const CASE_MAP = {
  clienteid: 'clienteId',
  nomecliente: 'nomeCliente',
  pacoteid: 'pacoteId',
  totalsessoes: 'totalSessoes',
  sessoesrealizadas: 'sessoesRealizadas',
  datacadastro: 'dataCadastro',
  observacaocancelamento: 'observacaoCancelamento',
  datacancelamento: 'dataCancelamento',
};

function fixKeys(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[CASE_MAP[k] || k] = v;
  }
  return out;
}

function mergeRecords(localRecords, remoteRecords) {
  const remoteMap = new Map(remoteRecords.map(r => [r.id, r]));
  const merged = [];
  let changed = false;

  for (const local of localRecords) {
    const remote = remoteMap.get(local.id);
    if (remote) {
      const localT = new Date(local.updated_at || 0).getTime();
      const remoteT = new Date(remote.updated_at || 0).getTime();
      if (remoteT > localT) {
        merged.push(remote);
        changed = true;
      } else {
        merged.push(local);
      }
      remoteMap.delete(local.id);
    } else {
      merged.push(local);
    }
  }

  for (const remote of remoteMap.values()) {
    merged.push(remote);
    changed = true;
  }

  return { records: merged, changed };
}

async function supabaseSync() {
  if (!supabaseClient) return;
  if (!AppStorage.currentUserId) return;

  try {
    const [{ data: clientes }, { data: sessoes }, { data: pagamentos }] = await Promise.all([
      supabaseClient.from('clientes').select('*').eq('user_id', AppStorage.currentUserId),
      supabaseClient.from('sessoes').select('*').eq('user_id', AppStorage.currentUserId),
      supabaseClient.from('pagamentos').select('*').eq('user_id', AppStorage.currentUserId)
    ]);

    let precisaRenderizar = false;

    if (clientes) {
      const { records, changed } = mergeRecords(AppStorage.clientes, clientes);
      if (changed) {
        AppStorage.clientes = records;
        precisaRenderizar = true;
      }
    }

    if (sessoes) {
      const { records, changed } = mergeRecords(AppStorage.sessoes, sessoes.map(fixKeys));
      if (changed) {
        AppStorage.sessoes = records;
        precisaRenderizar = true;
      }
    }

    if (pagamentos) {
      const { records, changed } = mergeRecords(AppStorage.pagamentos, pagamentos.map(fixKeys));
      if (changed) {
        AppStorage.pagamentos = records;
        precisaRenderizar = true;
      }
    }

    if (!precisaRenderizar) return;

    AppStorage.salvarDadosLocal();
    supabaseSalvar();

    if (typeof renderizarClientes === 'function') renderizarClientes();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof atualizarSessoesHoje === 'function') atualizarSessoesHoje();
    if (typeof renderCalendario === 'function') renderCalendario();
    if (typeof renderHistorico === 'function') renderHistorico();
  } catch (e) {
    console.warn('[Supabase] Erro ao sincronizar dados:', e.message);
  }
}

async function syncTableSupabase(table, localRecords) {
  const userId = AppStorage.currentUserId;
  if (!userId) return;

  const meusRegistros = localRecords.filter(r => !r.user_id || r.user_id === userId).map(r => ({
    ...r,
    user_id: userId
  }));
  const localIds = meusRegistros.map(r => r.id);

  const { data: existing } = await supabaseClient.from(table).select('id').eq('user_id', userId);
  if (existing) {
    const idsToDelete = existing
      .filter(r => !localIds.includes(r.id))
      .map(r => r.id);
    if (idsToDelete.length > 0) {
      const { error } = await supabaseClient.from(table).delete().in('id', idsToDelete);
      if (error) throw error;
    }
  }

  if (meusRegistros.length === 0) return;

  const registros = meusRegistros.map(r => ({
    ...r,
    updated_at: new Date().toISOString()
  }));

  // Normaliza chaves para lowercase (PostgreSQL não-quotado é case-folded)
  const todasChaves = [...new Set(registros.flatMap(r => Object.keys(r)))];
  const normalizados = registros.map(r => {
    const obj = {};
    for (const chave of todasChaves) {
      obj[chave.toLowerCase()] = r[chave] !== undefined ? r[chave] : null;
    }
    return obj;
  });

  const { error } = await supabaseClient.from(table).upsert(normalizados, {
    onConflict: 'id',
    ignoreDuplicates: false
  });

  if (error) {
    console.error('[Supabase] Erro no upsert:', error.message, error.details, error.hint, error.code);
    throw error;
  }
}

async function supabaseSalvar() {
  if (!supabaseClient) return;

  const results = await Promise.allSettled([
    syncTableSupabase('clientes', AppStorage.clientes),
    syncTableSupabase('sessoes', AppStorage.sessoes),
    syncTableSupabase('pagamentos', AppStorage.pagamentos)
  ]);

  for (const r of results) {
    if (r.status === 'rejected') {
      console.warn('[Supabase] Erro ao salvar:', r.reason?.message, r.reason?.details, r.reason?.hint);
    }
  }
}