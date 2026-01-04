import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // URL'den oobCode (reset code) al
  const resetCode = params.oobCode as string;

  useEffect(() => {
    if (!resetCode) {
      Alert.alert(
        'Geçersiz Bağlantı',
        'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.',
        [{ text: 'Tamam', onPress: () => router.replace('/auth/login') }]
      );
    }
  }, [resetCode]);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor. Lütfen kontrol edin.');
      return;
    }

    setIsLoading(true);
    try {
      // Firebase'de şifre sıfırlama işlemi
      const { confirmPasswordReset } = await import('firebase/auth');
      const { auth } = await import('@/config/firebase');
      
      await confirmPasswordReset(auth, resetCode, newPassword);
      
      Alert.alert(
        'Şifre Güncellendi! ✅',
        'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
        [{ 
          text: 'Giriş Yap', 
          onPress: () => router.replace('/auth/login')
        }]
      );
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      
      let errorMessage = 'Şifre sıfırlama işlemi başarısız.';
      
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Şifre sıfırlama bağlantısının süresi dolmuş. Yeni bir bağlantı talep edin.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Geçersiz şifre sıfırlama bağlantısı.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: colors.textSecondary };
    if (password.length < 6) return { strength: 1, text: 'Çok Zayıf', color: '#F44336' };
    if (password.length < 8) return { strength: 2, text: 'Zayıf', color: '#FF9800' };
    if (password.length < 12) return { strength: 3, text: 'Orta', color: '#FFC107' };
    return { strength: 4, text: 'Güçlü', color: '#4CAF50' };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>Yeni Şifre Belirle</Text>
          <Text style={styles.subtitle}>
            Hesabınız için güvenli bir şifre oluşturun
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni şifrenizi girin"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Şifre Gücü Göstergesi */}
            {newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${(passwordStrength.strength / 4) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Şifre Eşleşme Kontrolü */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <Ionicons 
                  name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={newPassword === confirmPassword ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[
                  styles.matchText, 
                  { color: newPassword === confirmPassword ? '#4CAF50' : '#F44336' }
                ]}>
                  {newPassword === confirmPassword ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor'}
                </Text>
              </View>
            )}
          </View>

          {/* Şifre Gereksinimleri */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Şifre Gereksinimleri:</Text>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={newPassword.length >= 6 ? '#4CAF50' : colors.textSecondary} 
              />
              <Text style={[
                styles.requirementText,
                { color: newPassword.length >= 6 ? '#4CAF50' : colors.textSecondary }
              ]}>
                En az 6 karakter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[A-Z]/.test(newPassword) ? '#4CAF50' : colors.textSecondary} 
              />
              <Text style={[
                styles.requirementText,
                { color: /[A-Z]/.test(newPassword) ? '#4CAF50' : colors.textSecondary }
              ]}>
                Büyük harf (önerilen)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[0-9]/.test(newPassword) ? '#4CAF50' : colors.textSecondary} 
              />
              <Text style={[
                styles.requirementText,
                { color: /[0-9]/.test(newPassword) ? '#4CAF50' : colors.textSecondary }
              ]}>
                Rakam (önerilen)
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.resetButton, 
              (isLoading || newPassword !== confirmPassword || newPassword.length < 6) && styles.resetButtonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.resetButtonText}>Şifreyi Güncelle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Giriş Sayfasına Dön */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Şifrenizi hatırladınız mı? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      marginBottom: 30,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      height: 50,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    eyeIcon: {
      padding: 4,
    },
    passwordStrengthContainer: {
      marginTop: 8,
    },
    strengthBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: 4,
    },
    strengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    strengthText: {
      fontSize: 12,
      fontWeight: '500',
    },
    matchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 6,
    },
    matchText: {
      fontSize: 14,
      fontWeight: '500',
    },
    requirementsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    requirementsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 8,
    },
    requirementText: {
      fontSize: 14,
    },
    resetButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    resetButtonDisabled: {
      opacity: 0.5,
    },
    resetButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    loginLink: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: 'bold',
    },
  });
}