import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// 1. Agrupa o array de jogos pela data
// Formata data ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS) para formato brasileiro DD/MM
export const formatDateBR = (isoDate) => {
  if (!isoDate) return '';
  try {
    // Extrai apenas a parte YYYY-MM-DD caso venha com horário
    const datePart = isoDate.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length < 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}/${month}`;
  } catch (e) {
    return isoDate;
  }
};

// 1. Agrupa o array de jogos pela data
export const agruparPorData = (jogos) => {
  const grupos = jogos.reduce((gruposAcc, jogo) => {
    const data = formatDateBR(jogo.data_brasilia || jogo.data);
    if (!gruposAcc[data]) {
      gruposAcc[data] = [];
    }
    gruposAcc[data].push(jogo);
    return gruposAcc;
  }, {});

  // Ordena os jogos em cada grupo por hora_brasilia antes de retornar
  return ordenarJogosPorHora(grupos);
};

// Ordena os jogos de cada grupo por hora_brasilia (crescente)
export const ordenarJogosPorHora = (grupos) => {
  Object.keys(grupos).forEach((k) => {
    grupos[k].sort((a, b) => {
      const ha = (a.hora_brasilia || '').slice(0,5);
      const hb = (b.hora_brasilia || '').slice(0,5);
      return ha.localeCompare(hb);
    });
  });
  return grupos;
};

// 2. Busca jogos na tabela do Supabase
export const buscarJogosDoBanco = async () => {
  try {
    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      // Ordena por data (YYYY-MM-DD) e hora_brasilia para garantir ordem cronológica
      .order('data_brasilia', { ascending: true })
      .order('hora_brasilia', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return [];
  }
};

// 3. Importa o JSON base para o Supabase (Uso do admin)
export const importarJogosParaBanco = async (jogosJson) => {
  try {
    // Usa upsert com onConflict em 'id' para evitar duplicidade
    const { error } = await supabase.from('jogos').upsert(jogosJson, { onConflict: 'id' });
    if (error) return { sucesso: false, mensagem: error.message };
    return { sucesso: true, mensagem: "Jogos importados/upsert com sucesso!" };
  } catch (e) {
    return { sucesso: false, mensagem: "Erro de conexão." };
  }
};

// 4. Salvar palpites na tabela 'palpites'
export const salvarPalpitesNoBanco = async (listaPalpites) => {
  try {
    // IMPORTANTE: A tabela palpites precisa ter as colunas certas e,
    // se for atualizar, defina a chave primária (ex: id_usuario + id_jogo).
    // Usa upsert com onConflict para evitar duplicidade por usuário+jogo
    const { data, error } = await supabase.from('palpites').upsert(listaPalpites, { onConflict: 'id_usuario,id_jogo' }).select();
    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true, data };
  } catch (e) {
    return { sucesso: false, erro: "Erro de conexão." };
  }
};

// 5. Buscar palpites de um usuário específico
export const buscarPalpitesDoUsuario = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('palpites')
      .select('*')
      .eq('id_usuario', userId);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar palpites:", error);
    return [];
  }
};

// 6. Lógica de Favoritos local (AsyncStorage para não depender de login)
export const buscarFavoritosDoBanco = async () => {
  // Mantém compatibilidade: sem userId usa AsyncStorage, com userId usa Supabase
  try {
    const favs = await AsyncStorage.getItem('@unicopa_favoritos');
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    return [];
  }
};

// Busca favoritos, suportando fetch do Supabase quando userId fornecido
export const buscarFavoritosDoBancoPorUsuario = async (userId) => {
  if (!userId) return buscarFavoritosDoBanco();
  try {
    const { data, error } = await supabase
      .from('favoritos')
      .select('id_jogo')
      .eq('id_usuario', userId);
    if (error) throw error;
    const ids = (data || []).map(r => r.id_jogo);
    // atualiza cache local
    await AsyncStorage.setItem('@unicopa_favoritos', JSON.stringify(ids));
    return ids;
  } catch (e) {
    console.error('Erro ao buscar favoritos do Supabase:', e.message || e);
    return buscarFavoritosDoBanco();
  }
};

// Toggle favorito com sincronização opcional ao Supabase (se userId fornecido)
export const toggleFavoritoNoBanco = async (jogoId, jaEFavorito, userId = null) => {
  try {
    // Atualiza cache local primeiro
    let favs = await buscarFavoritosDoBanco();
    if (jaEFavorito) favs = favs.filter(id => id !== jogoId);
    else favs.push(jogoId);
    await AsyncStorage.setItem('@unicopa_favoritos', JSON.stringify(favs));

    if (!userId) return { sucesso: true };

    // Sincroniza com Supabase
    if (jaEFavorito) {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .match({ id_usuario: userId, id_jogo: jogoId });
      if (error) return { sucesso: false, mensagem: error.message };
      return { sucesso: true };
    } else {
      // Checa existência e insere se não existir
      const { data: existente, error: selErr } = await supabase
        .from('favoritos')
        .select('*')
        .eq('id_usuario', userId)
        .eq('id_jogo', jogoId)
        .limit(1);
      if (selErr) return { sucesso: false, mensagem: selErr.message };
      if (existente && existente.length > 0) return { sucesso: true };

      const { error: insErr } = await supabase.from('favoritos').insert([{ id_usuario: userId, id_jogo: jogoId }]);
      if (insErr) return { sucesso: false, mensagem: insErr.message };
      return { sucesso: true };
    }
  } catch (e) {
    console.error('Erro ao toggle favorito:', e.message || e);
    return { sucesso: false, mensagem: 'Erro inesperado' };
  }
};

// 7. Trava o palpite se o jogo já iniciou (Comparação de Data/Hora)
export const jogoJaComeçou = (dataStr, horaStr) => {
  if (!dataStr || !horaStr) return false;
  try {
    const [dia, mes, ano] = dataStr.split('/');
    const [hora, minuto] = horaStr.split(':');
    
    const dataDoJogo = new Date(ano, mes - 1, dia, hora, minuto);
    const agora = new Date();
    
    return agora >= dataDoJogo;
  } catch (e) {
    return false;
  }
};