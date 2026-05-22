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

async function getCurrentUserId() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user?.id;
  } catch {
    return null;
  }
}

async function supabaseSync() {
  if (!supabaseClient) return;

  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const [{ data: clientes }, { data: sessoes }] = await Promise.all([
      supabaseClient.from('clientes').select('*').eq('user_id', userId),
      supabaseClient.from('sessoes').select('*').eq('user_id', userId)
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
      const { records, changed } = mergeRecords(AppStorage.sessoes, sessoes);
      if (changed) {
        AppStorage.sessoes = records;
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
  const localIds = localRecords.map(r => r.id);
  const userId = await getCurrentUserId();

  const { data: existing } = await supabaseClient.from(table).select('id');
  if (existing) {
    const idsToDelete = existing
      .filter(r => !localIds.includes(r.id))
      .map(r => r.id);
    if (idsToDelete.length > 0) {
      const { error } = await supabaseClient.from(table).delete().in('id', idsToDelete);
      if (error) throw error;
    }
  }

  if (localRecords.length > 0) {
    const registros = localRecords.map(r => ({
      ...r,
      user_id: userId,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabaseClient.from(table).upsert(registros, {
      onConflict: 'id',
      ignoreDuplicates: false
    });
    if (error) throw error;
  }
}

async function supabaseSalvar() {
  if (!supabaseClient) return;

  try {
    await Promise.all([
      syncTableSupabase('clientes', AppStorage.clientes),
      syncTableSupabase('sessoes', AppStorage.sessoes)
    ]);
  } catch (e) {
    console.warn('[Supabase] Erro ao salvar dados:', e.message);
  }
}
