import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';

export default function PalpitesScreen({ jogos, emRevisao, setEmRevisao, palpitesEmEdicao, setPalpitesEmEdicao, handleConfirmarPalpites, jogoJaComeçou, carregando }) {
  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      {!emRevisao && (
        <TouchableOpacity style={{ backgroundColor: '#F59E0B', padding: 12, borderRadius: 12, marginVertical: 10 }} onPress={() => setEmRevisao(true)}>
          <Text style={{ fontWeight: '900', color: '#0F172A' }}>💾 REVISAR E SALVAR PALPITES</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ width: '100%', paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {emRevisao ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#F59E0B', fontWeight: '900', fontSize: 18, marginBottom: 12 }}>Revisar Envio</Text>
            {jogos.map(j => {
              const p = palpitesEmEdicao[j.id];
              if (!p || p.casa === '' || p.fora === '') return null;
              return <Text key={j.id} style={{ color: '#94A3B8', marginBottom: 6 }}>{j.sigla_casa} {p.casa} x {p.fora} {j.sigla_fora}</Text>;
            })}
            <TouchableOpacity style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 20 }} onPress={handleConfirmarPalpites}>
              {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '900' }}>Confirmar Envio</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#475569', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 12 }} onPress={() => setEmRevisao(false)}>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>Voltar a Editar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jogos.map(j => {
            const travado = jogoJaComeçou(j.data_brasilia, j.hora_brasilia);
            return (
              <View key={j.id} style={{ backgroundColor: 'rgba(15,23,42,0.7)', borderRadius: 12, padding: 12, marginBottom: 12, width: '100%' }}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>{j.data_brasilia} - {j.hora_brasilia?.substring(0,5)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>{j.sigla_casa}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput style={{ width: 40, backgroundColor: '#0b1220', color: '#fff', textAlign: 'center', borderRadius: 6 }} keyboardType="numeric" maxLength={2} editable={!travado} value={palpitesEmEdicao[j.id]?.casa || ''} onChangeText={(v) => setPalpitesEmEdicao({ ...palpitesEmEdicao, [j.id]: { ...palpitesEmEdicao[j.id], casa: v } })} />
                    <Text style={{ color: '#F59E0B', fontWeight: '900', marginHorizontal: 8 }}>X</Text>
                    <TextInput style={{ width: 40, backgroundColor: '#0b1220', color: '#fff', textAlign: 'center', borderRadius: 6 }} keyboardType="numeric" maxLength={2} editable={!travado} value={palpitesEmEdicao[j.id]?.fora || ''} onChangeText={(v) => setPalpitesEmEdicao({ ...palpitesEmEdicao, [j.id]: { ...palpitesEmEdicao[j.id], fora: v } })} />
                  </View>

                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>{j.sigla_fora}</Text>
                  </View>
                </View>
                {travado && <Text style={{ color: '#F87171', marginTop: 8 }}>🔒 Jogo Iniciado</Text>}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
