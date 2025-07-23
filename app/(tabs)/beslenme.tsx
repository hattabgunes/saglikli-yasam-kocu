import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ogunler = [
  { isim: 'Kahvaltı', oneriler: 'Yulaf, yumurta, peynir, domates' },
  { isim: 'Öğle', oneriler: 'Izgara tavuk, bulgur pilavı, salata' },
  { isim: 'Akşam', oneriler: 'Balık, sebze yemeği, yoğurt' },
  { isim: 'Ara Öğün', oneriler: 'Meyve, ceviz, badem' },
];

export default function Beslenme() {
  const [tamamlanan, setTamamlanan] = useState([false, false, false, false]);

  const ogunTamamla = (idx: number) => {
    const yeni = [...tamamlanan];
    yeni[idx] = !yeni[idx];
    setTamamlanan(yeni);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günlük Beslenme Programı</Text>
      {ogunler.map((ogun, idx) => (
        <View key={ogun.isim} style={styles.ogunBox}>
          <Text style={styles.ogunTitle}>{ogun.isim}</Text>
          <Text style={styles.ogunOneri}>Öneriler: {ogun.oneriler}</Text>
          <TouchableOpacity
            style={[styles.button, tamamlanan[idx] && styles.buttonDone]}
            onPress={() => ogunTamamla(idx)}
          >
            <Text style={styles.buttonText}>
              {tamamlanan[idx] ? 'Tamamlandı ✅' : 'Tamamla'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  ogunBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    width: 300,
    alignItems: 'flex-start',
  },
  ogunTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ogunOneri: {
    fontSize: 15,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonDone: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 