import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const rutinler = [
  { isim: '2 Litre Su İç', aciklama: 'Gün boyunca en az 2 litre su iç.' },
  { isim: '7 Saat Uyku', aciklama: 'Gece en az 7 saat uyumaya çalış.' },
  { isim: '10.000 Adım', aciklama: 'Günlük 10.000 adım hedefini tamamla.' },
];

export default function Rutin() {
  const [checked, setChecked] = useState([false, false, false]);

  const toggleCheck = (idx: number) => {
    const yeni = [...checked];
    yeni[idx] = !yeni[idx];
    setChecked(yeni);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günlük Rutin Takibi</Text>
      {rutinler.map((rutin, idx) => (
        <TouchableOpacity
          key={rutin.isim}
          style={styles.rutinBox}
          onPress={() => toggleCheck(idx)}
        >
          <View style={styles.checkbox}>
            {checked[idx] && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View>
            <Text style={styles.rutinTitle}>{rutin.isim}</Text>
            <Text style={styles.rutinAciklama}>{rutin.aciklama}</Text>
          </View>
        </TouchableOpacity>
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
  rutinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    width: 320,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  checkmark: {
    fontSize: 20,
    color: 'green',
    fontWeight: 'bold',
  },
  rutinTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  rutinAciklama: {
    fontSize: 14,
    color: '#333',
  },
}); 