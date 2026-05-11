import { StyleSheet, Text, View, Image } from "react-native";
import { ImagemPaises } from "../assets/data/ImagemPaises"; // Certifique-se que o nome do export está correto

export default function GameCard({ game }) {
  return (
    <View style={game.sigla_casa === "BRA" || game.sigla_fora === "BRA" ? styles.jogoBR : styles.jogo}>
      <View style={styles.linhaPrincipal}>
        
        {/* Time Casa */}
        <View style={styles.time}>
          <Image 
            style={styles.bandeira} 
            source={ImagemPaises[game.sigla_casa] || require("../assets/unicopa.png")} 
          />
          <Text style={styles.sigla}>{game.sigla_casa}</Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        {/* Time Fora */}
        <View style={styles.time}>
          <Text style={styles.sigla}>{game.sigla_fora}</Text>
          <Image 
            style={styles.bandeira} 
            source={ImagemPaises[game.sigla_fora] || require("../assets/unicopa.png")} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d3d",
    paddingBottom: 15,
    paddingTop: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  jogoBrasil: {
    backgroundColor: "rgba(242, 204, 47, 0.05)", 
    borderColor: "#f2cc2f", 
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  grupo: {
    color: "#8fa3b8",
    fontSize: 12,
    marginBottom: 10,
  },
  linhaPrincipal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  horario: {
    alignItems: "center",
  },
  hora: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  local: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subTitulo: {
    color: "#8fa3b8",
    fontSize: 12,
  },
});