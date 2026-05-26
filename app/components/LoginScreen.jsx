import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase';
import { buscarFavoritosDoBancoPorUsuario } from '../utils/funcoes';

export default function LoginScreen({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const validarEmail = (e) => {
    return /\S+@\S+\.\S+/.test(e);
  };

  const handleSubmit = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Erro', 'E-mail inválido.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password: senha });
      if (error) {
        Alert.alert('Erro', error.message || 'Falha ao autenticar');
        setLoading(false);
        return;
      }

      const user = data.user;
      // Busca registro na tabela 'usuarios' pelo e-mail; se não existir, cria
      const { data: perfil, error: perfilErr } = await supabase.from('usuarios').select('*').eq('email', user.email).limit(1);
      if (perfilErr) {
        console.error('Erro ao buscar perfil:', perfilErr);
      }

      let usuarioApp = (perfil && perfil.length > 0) ? perfil[0] : null;
      if (!usuarioApp) {
        const nome = user.user_metadata?.full_name || '';
        const { data: ins, error: insErr } = await supabase.from('usuarios').insert([{ nome, email: user.email }]).select().single();
        if (insErr) console.error('Erro criando usuario app:', insErr);
        usuarioApp = ins || { nome, email: user.email, id: null };
      }

      // Carrega favoritos do Supabase para preencher cache/local no app
      const favs = await buscarFavoritosDoBancoPorUsuario(usuarioApp.id);

      setLoading(false);
      onLoginSuccess({ usuario: usuarioApp, favoritos: favs });
    } catch (e) {
      setLoading(false);
      Alert.alert('Erro', 'Erro inesperado ao efetuar login.');
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.inputPadrao} placeholder="E-mail" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.inputPadrao} placeholder="Senha" placeholderTextColor="#64748B" secureTextEntry value={senha} onChangeText={setSenha} />

      <TouchableOpacity style={styles.botaoAcaoPrincipal} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.textoBotaoAcao}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToRegister}>
        <Text style={styles.linkTextoSecundario}>Não possui conta? Criar Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, alignItems: 'center' },
  inputPadrao: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.8)',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    color: '#FFF'
  },
  botaoAcaoPrincipal: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%'
  },
  textoBotaoAcao: { color: '#0F172A', fontWeight: '900' },
  linkTextoSecundario: { color: '#94A3B8', marginTop: 12 }
});
