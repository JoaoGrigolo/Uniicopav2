import { 
  StyleSheet, 
  Text, 
  Image, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  FlatList 
} from "react-native";
import { useState, useEffect } from "react";
import copaData from "./app/assets/data/copaData.json";
import DiaCard from "./app/components/DiaCard";
import TimeCard from "./app/components/TimeCard"; 
import LoginScreen from "./app/components/LoginScreen";
import RegisterScreen from "./app/components/RegisterScreen";
import PalpitesScreen from "./app/components/PalpitesScreen";
import MeusPalpitesScreen from "./app/components/MeusPalpitesScreen";
import { 
  agruparPorData, 
  buscarJogosDoBanco, 
  buscarFavoritosDoBanco, 
  buscarFavoritosDoBancoPorUsuario,
  toggleFavoritoNoBanco, 
  buscarPalpitesDoUsuario, 
  salvarPalpitesNoBanco, 
  jogoJaComeçou,
  importarJogosParaBanco
} from "./app/utils/funcoes";
import { supabase } from "./app/utils/supabase";

const GRUPOS = ['Todos', 'Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H'];

export default function App() {
  // ==========================================
  // ESTADOS DO APLICATIVO
  // ==========================================
  const [telaAtual, setTelaAtual] = useState('calendario'); 
  const [usuarioLogado, setUsuarioLogado] = useState(null); 
  const [jogos, setJogos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('Todos');
  const [carregando, setCarregando] = useState(true);
  
  // Estados de Formulário
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [nomeInput, setNomeInput] = useState('');
  const [confirmarSenhaInput, setConfirmarSenhaInput] = useState('');
  
  // Estados de Palpites
  const [palpitesEmEdicao, setPalpitesEmEdicao] = useState({}); 
  const [emRevisao, setEmRevisao] = useState(false);

  // ==========================================
  // EFEITOS E CARREGAMENTO
  // ==========================================
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    setCarregando(true);
    try {
      const j = await buscarJogosDoBanco();
      const f = await buscarFavoritosDoBanco();
      setJogos(j);
      setFavoritos(f);
    } catch (e) {
      console.error("Erro ao carregar dados iniciais:", e);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // FUNÇÕES DE AUTENTICAÇÃO E USUÁRIO
  // ==========================================
  const handleLogin = async () => {
    if (!emailInput || !senhaInput) {
      Alert.alert("Aviso", "Preencha todos os campos.");
      return;
    }
    
    setCarregando(true);
    try {
      const emailFormatado = emailInput.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', emailFormatado)
        .limit(1);

      setCarregando(false);

      if (error || !data || data.length === 0 || data[0].senha !== senhaInput) {
        Alert.alert("Erro", "E-mail ou senha incorretos.");
        return;
      }

      const usuario = data[0];
      setUsuarioLogado(usuario);
      // Carrega favoritos do Supabase para o usuário
      const favsUsuario = await buscarFavoritosDoBancoPorUsuario(usuario.id);
      setFavoritos(favsUsuario);
      
      // Carrega palpites anteriores do usuário
      const palpitesSalvos = await buscarPalpitesDoUsuario(usuario.id);
      const mapa = {};
      palpitesSalvos.forEach(p => {
        mapa[p.id_jogo] = { casa: String(p.placar_time_casa), fora: String(p.placar_time_fora) };
      });
      setPalpitesEmEdicao(mapa);
      setTelaAtual('calendario');

    } catch (e) {
      setCarregando(false);
      Alert.alert("Erro", "Falha inesperada ao realizar login.");
    }
  };

  const handleCadastro = async () => {
    if (!emailInput || !senhaInput || !confirmarSenhaInput) {
      Alert.alert("Aviso", "Preencha todos os campos.");
      return;
    }
    if (senhaInput !== confirmarSenhaInput) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    
    setCarregando(true);
    try {
      const emailFormatado = emailInput.toLowerCase().trim();
      const { error } = await supabase
        .from('usuarios')
        .insert([{ nome: nomeInput.trim(), email: emailFormatado, senha: senhaInput }]);
        
      setCarregando(false);
      
      if (error) {
        Alert.alert("Erro", "E-mail já cadastrado ou erro no servidor.");
      } else { 
        Alert.alert("Sucesso", "Conta criada! Faça o login."); 
        setTelaAtual('login'); 
      }
    } catch (e) { 
      setCarregando(false); 
      Alert.alert("Erro", "Erro ao conectar.");
    }
  };

  // ==========================================
  // FUNÇÕES DE DADOS E PALPITES
  // ==========================================
  const handleToggleFavorito = async (jogoId) => {
    const jaEFavorito = favoritos.includes(jogoId);
    setFavoritos(jaEFavorito ? favoritos.filter(id => id !== jogoId) : [...favoritos, jogoId]);
    await toggleFavoritoNoBanco(jogoId, jaEFavorito, usuarioLogado ? usuarioLogado.id : null);
  };

  const handleImportacaoJson = async () => {
    const r = await importarJogosParaBanco(copaData.jogos);
    Alert.alert(r.sucesso ? "Sucesso" : "Aviso", r.mensagem);
    carregarDadosIniciais();
  };

  const handleConfirmarPalpites = async () => {
    if (!usuarioLogado) return;
    setCarregando(true);
    
    const listaParaEnviar = Object.keys(palpitesEmEdicao)
      .filter(jogoId => palpitesEmEdicao[jogoId].casa !== '' && palpitesEmEdicao[jogoId].fora !== '')
      .map(jogoId => ({
        id_usuario: usuarioLogado.id,
        id_jogo: Number(jogoId),
        placar_time_casa: Number(palpitesEmEdicao[jogoId].casa),
        placar_time_fora: Number(palpitesEmEdicao[jogoId].fora)
      }));
      
    if(listaParaEnviar.length === 0) {
      setCarregando(false);
      Alert.alert("Aviso", "Preencha pelo menos um palpite.");
      return;
    }

    // marca como confirmado e adiciona timestamp
    const now = new Date().toISOString();
    const listaParaEnviarConfirmados = listaParaEnviar.map(p => ({ ...p, confirmado: true, data_envio: now }));

    const r = await salvarPalpitesNoBanco(listaParaEnviarConfirmados);
    setCarregando(false);
    setEmRevisao(false);
    
    if (r.sucesso) {
      // opcional: atualizar mapa local com confirmações
      const novoMapa = { ...palpitesEmEdicao };
      listaParaEnviarConfirmados.forEach(p => {
        novoMapa[p.id_jogo] = { casa: String(p.placar_time_casa), fora: String(p.placar_time_fora), confirmado: true };
      });
      setPalpitesEmEdicao(novoMapa);
      setTelaAtual('meus_palpites');
      Alert.alert("Sucesso", "Palpites salvos com sucesso!");
    } else {
      Alert.alert("Erro", r.erro || "Não foi possível salvar os palpites.");
    }
  };

  // Processamento de Listas
  const jogosFiltrados = jogos.filter((jogo) => {
    if (grupoSelecionado === 'Todos') return true;
    const filtroLimpo = grupoSelecionado.toLowerCase().replace('grupo', '').trim();
    const grupoJogoLimpo = jogo.grupo ? jogo.grupo.toLowerCase().replace('grupo', '').trim() : '';
    return grupoJogoLimpo === filtroLimpo;
  });

  const jogosAgrupados = agruparPorData(jogosFiltrados);
  const jogosTratados = Object.keys(jogosAgrupados).map(data => ({ title: data, data: jogosAgrupados[data] }));

  // ==========================================
  // RENDERIZAÇÃO DA INTERFACE
  // ==========================================
  return (
    <View style={styles.containerPrincipal}>
      
      {/* CABEÇALHO */}
      <View style={styles.headerApp}>
        <Image 
          style={styles.logoApp} 
          source={require("./app/assets/unicopa.png")} 
          resizeMode="contain" 
        />
        <Text style={styles.tituloTela}>{telaAtual.replace('_', ' ')}</Text>
      </View>

      {/* MENU DE NAVEGAÇÃO (ABAS) */}
      <View style={styles.menuAbasContainer}>
        <TouchableOpacity style={[styles.abaBotao, telaAtual === 'calendario' && styles.abaAtiva]} onPress={() => setTelaAtual('calendario')}>
          <Text style={[styles.abaTexto, telaAtual === 'calendario' && styles.abaTextoAtivo]}>Jogos</Text>
        </TouchableOpacity>
        
        {usuarioLogado ? (
          <>
            <TouchableOpacity style={[styles.abaBotao, telaAtual === 'palpites' && styles.abaAtiva]} onPress={() => setTelaAtual('palpites')}>
              <Text style={[styles.abaTexto, telaAtual === 'palpites' && styles.abaTextoAtivo]}>Palpitar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.abaBotao, telaAtual === 'meus_palpites' && styles.abaAtiva]} onPress={() => setTelaAtual('meus_palpites')}>
              <Text style={[styles.abaTexto, telaAtual === 'meus_palpites' && styles.abaTextoAtivo]}>Meus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.abaBotao} onPress={() => { setUsuarioLogado(null); setTelaAtual('calendario'); }}>
              <Text style={[styles.abaTexto, { color: '#ef4444' }]}>Sair</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.abaBotao, telaAtual === 'login' && styles.abaAtiva]} onPress={() => setTelaAtual('login')}>
            <Text style={[styles.abaTexto, telaAtual === 'login' && styles.abaTextoAtivo]}>🔐 Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TELA: CALENDÁRIO DE JOGOS */}
      {telaAtual === 'calendario' && (
        <View style={styles.conteinerTela}>
          <View style={styles.filtrosContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
              {GRUPOS.map(g => (
                <TouchableOpacity key={g} style={[styles.filtroBotao, g === grupoSelecionado && styles.filtroBotaoAtivo]} onPress={() => setGrupoSelecionado(g)}>
                  <Text style={[styles.filtroTexto, g === grupoSelecionado && styles.filtroTextoAtivo]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TouchableOpacity style={styles.botaoInjetar} onPress={handleImportacaoJson}>
            <Text style={styles.textoBotaoInjetar}>☁ Injetar Dados Base</Text>
          </TouchableOpacity>
          
          {carregando ? <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 20 }} /> : (
            jogosTratados.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 16 }}>Nenhum jogo carregado</Text>
              </View>
            ) : (
              <FlatList 
                data={jogosTratados} 
                keyExtractor={item => item.title} 
                renderItem={({ item }) => <DiaCard data={item.title} jogos={item.data} favoritos={favoritos} onToggleFavorito={handleToggleFavorito} />} 
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                style={{ width: '100%' }}
              />
            )
          )}
        </View>
      )}

      {/* TELA: LOGIN */}
      {telaAtual === 'login' && (
        <LoginScreen onLoginSuccess={({ usuario, favoritos: favs }) => { setUsuarioLogado(usuario); setFavoritos(favs); setTelaAtual('calendario'); }} onSwitchToRegister={() => setTelaAtual('cadastro')} />
      )}

      {/* TELA: CADASTRO */}
      {telaAtual === 'cadastro' && (
        <RegisterScreen onRegisterSuccess={() => setTelaAtual('login')} onSwitchToLogin={() => setTelaAtual('login')} />
      )}

      {/* TELA: FAZER PALPITES */}
      {telaAtual === 'palpites' && (
        <PalpitesScreen
          jogos={jogos}
          emRevisao={emRevisao}
          setEmRevisao={setEmRevisao}
          palpitesEmEdicao={palpitesEmEdicao}
          setPalpitesEmEdicao={setPalpitesEmEdicao}
          handleConfirmarPalpites={handleConfirmarPalpites}
          jogoJaComeçou={jogoJaComeçou}
          carregando={carregando}
        />
      )}

      {/* TELA: MEUS PALPITES */}
      {telaAtual === 'meus_palpites' && (
        <MeusPalpitesScreen usuario={usuarioLogado} jogos={jogos} />
      )}

    </View>
  );
}

// ==========================================
// ESTILOS ORGANIZADOS (CSS)
// ==========================================
const styles = StyleSheet.create({
  
  // --- ESTRUTURA GLOBAL ---
  containerPrincipal: { 
    flex: 1, 
    backgroundColor: "#02060D", 
    alignItems: "center" 
  },
  conteinerTela: { 
    flex: 1, 
    width: '100%', 
    alignItems: 'center' 
  },

  // --- CABEÇALHO ---
  headerApp: { 
    alignItems: 'center', 
    marginTop: 50, 
    marginBottom: 16 
  },
  logoApp: { 
    width: 180, 
    height: 45 
  },
  tituloTela: { 
    marginTop: 8, 
    fontSize: 18, 
    fontWeight: "900", 
    color: "#FFFFFF", 
    letterSpacing: 3, 
    textTransform: "uppercase" 
  },
  
  // --- MENU DE NAVEGAÇÃO (ABAS) ---
  menuAbasContainer: { 
    flexDirection: 'row', 
    width: '92%', 
    maxWidth: 400,
    marginVertical: 10, 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    borderRadius: 20, 
    padding: 5, 
    borderWidth: 1, 
    borderColor: 'rgba(51, 65, 85, 0.5)' 
  },
  abaBotao: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    borderRadius: 15 
  },
  abaAtiva: { 
    backgroundColor: '#1E293B',
    elevation: 3
  },
  abaTexto: { 
    color: '#94A3B8', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  abaTextoAtivo: { 
    color: '#FFFFFF' 
  },

  // --- FILTROS HORIZONTAIS ---
  filtrosContainer: { 
    height: 50, 
    marginVertical: 10 
  },
  filtroBotao: { 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    backgroundColor: "rgba(15, 23, 42, 0.7)", 
    marginRight: 10, 
    justifyContent: 'center', 
    height: 35, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  filtroBotaoAtivo: { 
    backgroundColor: '#F59E0B', 
    borderColor: '#F59E0B' 
  },
  filtroTexto: { 
    color: '#CBD5E1', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  filtroTextoAtivo: { 
    color: '#0F172A',
    fontWeight: '900'
  },

  // --- FORMULÁRIOS E INPUTS (LOGIN/CADASTRO) ---
  formContainer: { 
    width: '90%', 
    maxWidth: 400,
    backgroundColor: 'rgba(15, 23, 42, 0.85)', 
    padding: 25, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: '#334155', 
    alignSelf: 'center',
    marginTop: 20
  },
  inputPadrao: { 
    backgroundColor: '#0B1120', 
    color: '#FFF', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  botaoAcaoPrincipal: { 
    backgroundColor: '#F59E0B', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginVertical: 5 
  },
  textoBotaoAcao: { 
    color: '#0F172A', 
    fontWeight: '900', 
    fontSize: 14 
  },
  linkTextoSecundario: { 
    color: '#94A3B8', 
    textAlign: 'center', 
    marginTop: 15,
    fontWeight: '600'
  },

  // --- CARDS DE PALPITES ---
  botaoSalvarFixo: { 
    width: '90%', 
    maxWidth: 500,
    backgroundColor: '#F59E0B', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15, 
    alignItems: 'center', 
    elevation: 5 
  },
  cardPalpite: { 
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)', 
    padding: 15, 
    borderRadius: 20, 
    marginVertical: 8, 
    borderWidth: 1, 
    borderColor: 'rgba(51, 65, 85, 0.4)' 
  },
  textoDataCard: { 
    color: '#64748B', 
    fontSize: 11, 
    textAlign: 'center', 
    marginBottom: 10, 
    fontWeight: '700' 
  },
  linhaPalpite: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  colunaTimeCasa: { flex: 1.2, alignItems: 'flex-end' },
  colunaTimeFora: { flex: 1.2, alignItems: 'flex-start' },
  colunaPlacar: { 
    flex: 2, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10 
  },
  inputPlacar: { 
    backgroundColor: '#0B1120', 
    color: '#F59E0B', 
    width: 45, 
    height: 45, 
    textAlign: 'center', 
    borderRadius: 10, 
    fontWeight: '900', 
    fontSize: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(245, 158, 11, 0.3)' 
  },
  textoVS: { color: '#F59E0B', fontWeight: '900' },
  avisoBloqueado: { 
    color: '#ef4444', 
    fontSize: 10, 
    textAlign: 'center', 
    marginTop: 10, 
    fontWeight: '800' 
  },
  textoPlacarSalvo: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: '900', 
    textAlign: 'center',
    letterSpacing: 2
  },

  // --- OUTROS ELEMENTOS ---
  botaoInjetar: { 
    backgroundColor: '#10B981', 
    padding: 10, 
    paddingHorizontal: 20,
    borderRadius: 12, 
    marginBottom: 10 
  },
  textoBotaoInjetar: { 
    color: 'white', 
    fontWeight: '800',
    fontSize: 12 
  },
  tituloRevisao: { 
    color: "#F59E0B", 
    fontSize: 18, 
    fontWeight: "800", 
    textAlign: 'center', 
    marginBottom: 15 
  },
  textoRevisaoItem: { 
    color: 'white', 
    textAlign: 'center', 
    marginVertical: 4,
    fontWeight: '600'
  }
});