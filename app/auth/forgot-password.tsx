import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { resetPassword } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('E-posta Gerekli', 'Lütfen e-posta adresinizi girin.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        setEmailSent(true);
        Alert.alert(
          'E-posta Gönderildi! 📧', 
          `Şifre sıfırlama bağlantısı ${email} adresine gönderildi.\n\n• E-posta kutunuzu kontrol edin\n• Spam klasörünü de kontrol edin\n• Bağlantı 1 saat geçerlidir`,
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert('Hata', 'Şifre sıfırlama işlemi başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setEmailSent(false);
    await handleSendResetEmail();
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Ionicons name="key" size={60} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            {emailSent 
              ? 'E-posta gönderildi! Kutunuzu kontrol edin.' 
              : 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.'
            }
          </Text>
        </View>

        {!emailSent ? (
          /* E-posta Giriş Formu */
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta Adresi</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendResetEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>Sıfırlama Bağlantısı Gönder</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* E-posta Gönderildi Durumu */
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success || '#4CAF50'} />
            </View>
            
            <Text style={styles.successTitle}>E-posta Gönderildi!</Text>
            <Text style={styles.successMessage}>
              <Text style={styles.emailText}>{email}</Text> adresine şifre sıfırlama bağlantısı gönderildi.
            </Text>
            
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Sonraki Adımlar:</Text>
              <View style={styles.instructionItem}>
                <Ionicons name="mail-open" size={16} color={colors.primary} />
                <Text style={styles.instructionText}>E-posta kutunuzu kontrol edin</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="warning" size={16} color={colors.warning || '#FF9800'} />
                <Text style={styles.instructionText}>Spam klasörünü de kontrol edin</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={styles.instructionText}>Bağlantı 1 saat geçerlidir</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendEmail}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
              <Text style={styles.resendButtonText}>Tekrar Gönder</Text>
            </TouchableOpacity>
          </View>
        )}

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
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: 0,
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 40,
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
      paddingHorizontal: 20,
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
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    sendButtonDisabled: {
      opacity: 0.7,
    },
    sendButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    successContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    successIcon: {
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 30,
    },
    emailText: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    instructionsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      width: '100%',
      marginBottom: 20,
    },
    instructionsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    instructionText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      height: 50,
      backgroundColor: colors.surface,
      gap: 8,
    },
    resendButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
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