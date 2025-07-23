import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Profil() {
  const [ad, setAd] = useState('');
  const [yas, setYas] = useState('');
  const [kilo, setKilo] = useState('');
  const [boy, setBoy] = useState('');
  const [hedefAdim, setHedefAdim] = useState('20000');
  const [hedefSu, setHedefSu] = useState('2000');
  const [hedefSpor, setHedefSpor] = useState('90');
  const [kaydedildi, setKaydedildi] = useState(false);

  const kaydet = () => {
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Profili</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Adınız:</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınız"
          value={ad}
          onChangeText={setAd}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Yaşınız:</Text>
        <TextInput
          style={styles.input}
          placeholder="Yaşınız"
          value={yas}
          onChangeText={setYas}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Kilonuz:</Text>
        <TextInput
          style={styles.input}
          placeholder="Kilonuz (kg)"
          value={kilo}
          onChangeText={setKilo}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Boyunuz:</Text>
        <TextInput
          style={styles.input}
          placeholder="Boyunuz (cm)"
          value={boy}
          onChangeText={setBoy}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.subtitle}>Günlük Hedefler</Text>
      <Text style={styles.desc}>Adım Hedefi: Gün içinde atmak istediğiniz toplam adım sayısı.</Text>
      <TextInput
        style={styles.input}
        placeholder="Adım Hedefi"
        value={hedefAdim}
        onChangeText={setHedefAdim}
        keyboardType="numeric"
      />
      <Text style={styles.desc}>Su (ml): Gün boyunca içmek istediğiniz toplam su miktarı (mililitre cinsinden).</Text>
      <TextInput
        style={styles.input}
        placeholder="Su (ml)"
        value={hedefSu}
        onChangeText={setHedefSu}
        keyboardType="numeric"
      />
      <Text style={styles.desc}>Spor (dk): Günlük spor yapmak istediğiniz toplam süre (dakika cinsinden).</Text>
      <TextInput
        style={styles.input}
        placeholder="Spor (dk)"
        value={hedefSpor}
        onChangeText={setHedefSpor}
        keyboardType="numeric"
      />
      <Button title="Kaydet" onPress={kaydet} />
      {kaydedildi && <Text style={styles.success}>Kaydedildi!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    minWidth: 60,
    maxWidth: 90,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  success: {
    color: 'green',
    marginTop: 10,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
    marginLeft: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 80,
    fontSize: 15,
    color: '#333',
    marginRight: 6,
  },
}); 