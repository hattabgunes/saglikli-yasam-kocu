import { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function Spor() {
  const [done, setDone] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günlük Spor Programı</Text>
      <Text style={styles.subtitle}>Bugün 1 saat 30 dakika spor yapmalısın!</Text>
      <View style={styles.programBox}>
        <Text style={styles.sectionTitle}>Spor Türleri:</Text>
        <Text>• Kardiyo (30 dk)</Text>
        <Text>• Kuvvet Antrenmanı (40 dk)</Text>
        <Text>• Esneme (20 dk)</Text>
      </View>
      <Button
        title={done ? 'Tamamlandı ✅' : 'Sporu Tamamla'}
        onPress={() => setDone(true)}
        color={done ? 'green' : '#007AFF'}
        disabled={done}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  programBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
}); 