import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// IMPORTAÇÃO DO ARQUIVO EXTERNO DE IMAGENS
// Ajuste o caminho se você salvou em uma pasta diferente.
import FLAGS from '../utils/imagemPaises'; 

const DEFAULT_FLAG = require('../assets/unicopa.png');

function TimeCard({ siglaTime, reverso = false }) {
  // Converte a sigla recebida para maiúsculo e remove espaços
  // para garantir a correspondência correta com o objeto FLAGS.
  const codigoTime = siglaTime ? siglaTime.toUpperCase().trim() : '';
  const imagemLocal = FLAGS[codigoTime];

  return (
    <View style={[styles.container, reverso && styles.containerReverso]}>
      <View style={styles.bandeiraContainer}>
        <Image 
          source={imagemLocal || DEFAULT_FLAG} 
          style={styles.bandeiraImg} 
          resizeMode="cover"
        />
      </View>

      <Text style={[styles.sigla, reverso ? styles.siglaReversa : styles.siglaNormal]}>
        {codigoTime}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  containerReverso: {
    flexDirection: 'row-reverse',
  },
  bandeiraContainer: {
    width: 34,
    height: 34,
    borderRadius: 17, 
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconePlaceholder: {
    fontSize: 14,
  },
  bandeiraImg: {
    width: '100%',
    height: '100%',
  },
  sigla: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  siglaNormal: {
    textAlign: 'left',
  },
  siglaReversa: {
    textAlign: 'right',
  }
});

export default React.memo(TimeCard);