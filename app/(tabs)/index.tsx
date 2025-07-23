import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş geldiniz! 👋</Text>
      <Text style={styles.subtitle}>Bugün sağlıklı yaşam için neler yapabilirsin?</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Günün Özeti</Text>
        <Text>• Spor: Yapılmadı</Text>
        <Text>• Beslenme: Eksik</Text>
        <Text>• Rutin: 1/3 tamamlandı</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
