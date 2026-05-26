import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import TimeCard from "./TimeCard";

export default function GameCard({ game, ehFavorito, onToggleFavorito }) {
  const eDoBrasil = game.sigla_casa === "BRA" || game.sigla_fora === "BRA";

  return (
    <View style={[styles.jogo, eDoBrasil ? styles.jogoBR : styles.jogoNormal]}>
      
      <View style={styles.topoCard}>
        <Text style={styles.grupo}>{game.grupo ? game.grupo.toUpperCase() : ""}</Text>
        <TouchableOpacity onPress={() => onToggleFavorito && onToggleFavorito(game.id)}>
          <Text style={[styles.estrela, ehFavorito && styles.estrelaAtiva]}>
            {ehFavorito ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linhaPrincipal}>
        <View style={styles.timeWrapper}>
          <TimeCard siglaTime={game.sigla_casa} reverso={false} />
        </View>

        <View style={styles.horario}>
          <Text style={styles.hora}>{game.hora_brasilia ? game.hora_brasilia.substring(0, 5) : "00:00"}</Text>
          <Text style={styles.vs}>VS</Text>
        </View>

        <View style={[styles.timeWrapper, { alignItems: 'flex-end' }]}>
          <TimeCard siglaTime={game.sigla_fora} reverso={true} />
        </View>
      </View>

      <View style={styles.local}>
        <Text style={styles.subTitulo} numberOfLines={1}>{game.estadio || "Estádio"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jogo: { marginBottom: 16, paddingBottom: 16 },
  jogoNormal: { borderBottomWidth: 1, borderBottomColor: "rgba(51, 65, 85, 0.5)" },
  jogoBR: { backgroundColor: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.5)", borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  topoCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  grupo: { color: "#94A3B8", fontSize: 12, fontWeight: "800", letterSpacing: 0.8 },
  estrela: { fontSize: 22, color: "#475569" },
  estrelaAtiva: { color: "#F59E0B", textShadowColor: 'rgba(245, 158, 11, 0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  linhaPrincipal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  timeWrapper: { flex: 1 },
  horario: { width: 70, alignItems: "center", justifyContent: "center" },
  hora: { color: "#F8FAFC", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  vs: { color: "#94A3B8", fontSize: 10, fontWeight: "900", marginTop: 4, backgroundColor: "rgba(15, 23, 42, 0.9)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  local: { marginTop: 12 },
  subTitulo: { color: "#64748B", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 }
});