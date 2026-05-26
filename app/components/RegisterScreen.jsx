import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase';

export default function RegisterScreen({ onRegisterSuccess, onSwitchToLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  const validarEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleRegister = async () => {
    if (!email || !senha || !confirmar) {
      Alert.alert('Aviso', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Erro', 'E-mail inválido.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'Senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Erro', 'Senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // Criar conta pelo Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email: email.toLowerCase().trim(), password: senha });
      if (error) {
        Alert.alert('Erro', error.message || 'Falha ao criar conta');
        setLoading(false);
        return;
      }

      // Inserir/atualizar perfil na tabela `usuarios` (sem senha)
      try {
        await supabase.from('usuarios').upsert([{ nome: nome.trim(), email: email.toLowerCase().trim() }], { onConflict: 'email' });
      } catch (e) {
        console.error('Erro ao gravar perfil usuarios:', e);
      }

      setLoading(false);
      Alert.alert('Sucesso', 'Conta criada — verifique seu e-mail se necessário.');
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (e) {
      setLoading(false);
      Alert.alert('Erro', 'Erro inesperado ao criar conta.');
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.inputPadrao} placeholder="Nome (Opcional)" placeholderTextColor="#64748B" value={nome} onChangeText={setNome} />
      <TextInput style={styles.inputPadrao} placeholder="E-mail" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.inputPadrao} placeholder="Senha" placeholderTextColor="#64748B" secureTextEntry value={senha} onChangeText={setSenha} />
      <TextInput style={styles.inputPadrao} placeholder="Confirmar Senha" placeholderTextColor="#64748B" secureTextEntry value={confirmar} onChangeText={setConfirmar} />

      <TouchableOpacity style={styles.botaoAcaoPrincipal} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.textoBotaoAcao}>Registrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin}>
        <Text style={styles.linkTextoSecundario}>Já possui conta? Fazer Login</Text>
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
