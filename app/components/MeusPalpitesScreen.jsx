import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { buscarPalpitesDoUsuario, jogoJaComeçou } from '../utils/funcoes';

export default function MeusPalpitesScreen({ usuario, jogos }) {
  const [palpites, setPalpites] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('Todos'); // Todos | Pendentes | Confirmados

  useEffect(() => {
    carregarPalpites();
  }, [usuario]);

  const carregarPalpites = async () => {
    if (!usuario) {
      setPalpites([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const dados = await buscarPalpitesDoUsuario(usuario.id);
      setPalpites(dados || []);
    } catch (e) {
      console.error('Erro ao carregar palpites do usuário:', e);
      setPalpites([]);
    } finally {
      setCarregando(false);
    }
  };

  const palpitesFiltrados = palpites.filter(p => {
    if (filtro === 'Todos') return true;
    if (filtro === 'Pendentes') return !p.confirmado;
    if (filtro === 'Confirmados') return !!p.confirmado;
    return true;
  });

  if (carregando) return <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 20 }} />;

  if (!usuario) return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: '#94A3B8' }}>Faça login para ver seus palpites.</Text>
    </View>
  );

  if (!palpites || palpites.length === 0) return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Text style={{ color: '#94A3B8', fontSize: 16 }}>Você ainda não cadastrou palpites</Text>
    </View>
  );

  return (
    <View style={{ width: '100%', paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
        {['Todos','Pendentes','Confirmados'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFiltro(f)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: filtro === f ? '#F59E0B' : 'transparent' }}>
            <Text style={{ color: filtro === f ? '#0F172A' : '#94A3B8', fontWeight: '700' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {palpitesFiltrados.map(p => {
          const jogo = jogos.find(j => Number(j.id) === Number(p.id_jogo));
          const travado = jogo ? jogoJaComeçou(jogo.data_brasilia, jogo.hora_brasilia) : false;
          return (
            <View key={`${p.id_usuario}-${p.id_jogo}`} style={{ backgroundColor: 'rgba(15,23,42,0.7)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>{jogo ? `${jogo.data_brasilia} - ${jogo.hora_brasilia?.substring(0,5)}` : ''}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <View>
                  <Text style={{ color: '#FFF', fontWeight: '900' }}>{jogo ? `${jogo.sigla_casa} x ${jogo.sigla_fora}` : `Jogo #${p.id_jogo}`}</Text>
                  <Text style={{ color: '#94A3B8' }}>{jogo ? jogo.estadio : ''}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#F59E0B', fontWeight: '900' }}>{p.placar_time_casa} x {p.placar_time_fora}</Text>
                  <Text style={{ color: p.confirmado ? '#10B981' : '#F59E0B', fontWeight: '700', marginTop: 6 }}>{p.confirmado ? 'Confirmado' : 'Pendente'}</Text>
                  {travado && <Text style={{ color: '#F87171', marginTop: 6 }}>Jogo iniciado</Text>}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
