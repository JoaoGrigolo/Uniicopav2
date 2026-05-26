import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TimeCard from './TimeCard';
import { formatDateBR } from '../utils/funcoes';

export default function DiaCard({ data, jogos, favoritos, onToggleFavorito }) {
  const hojeBR = formatDateBR(new Date().toISOString());
  const isHoje = data === hojeBR;

  return (
    <View style={styles.container}>
      <View style={[styles.headerData, isHoje && styles.headerDataHoje]}>
        <Text style={styles.textoData}>{data}</Text>
      </View>

      {jogos.map((jogo) => {
          const isFavorito = favoritos.includes(jogo.id);
          const isBrasil = (jogo.sigla_casa === 'BRA' || jogo.sigla_fora === 'BRA');

        return (
          <View key={jogo.id} style={[styles.cardJogo, isBrasil && styles.cardBrasil]}>
            <View style={styles.infoTopo}>
              <Text style={styles.textoGrupo}>{jogo.grupo} • {jogo.hora_brasilia.substring(0, 5)}</Text>
              <TouchableOpacity onPress={() => onToggleFavorito(jogo.id)}>
                <Text style={styles.iconeFavorito}>{isFavorito ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linhaConfronto}>
              <View style={styles.timeLado}>
                <TimeCard siglaTime={jogo.sigla_casa} reverso={true} />
              </View>

              <Text style={styles.textoVS}>X</Text>

              <View style={[styles.timeLado, { alignItems: 'flex-start' }]}>
                <TimeCard siglaTime={jogo.sigla_fora} reverso={false} />
              </View>
            </View>

            <Text style={styles.textoEstadio}>🏟️ {jogo.estadio}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerData: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  textoData: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  cardJogo: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  infoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  textoGrupo: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconeFavorito: {
    fontSize: 20,
  },
  linhaConfronto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLado: {
    flex: 1,
    alignItems: 'flex-end',
  },
  textoVS: {
    color: '#F59E0B',
    fontWeight: '900',
    fontSize: 18,
    marginHorizontal: 20,
  },
  textoEstadio: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  }
  ,
  cardBrasil: {
    borderColor: 'rgba(245, 158, 11, 1)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)'
  }
  ,
  headerDataHoje: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
  }
});