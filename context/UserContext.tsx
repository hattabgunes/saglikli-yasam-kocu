import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/services/authService';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserContextType {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const defaultUserProfile: UserProfile = {
  uid: '',
  email: '',
  ad: '',
  soyad: '',
  kayitTarihi: null,
  emailVerified: false,
  hedefAdim: '10000',
  hedefSu: '2000',
  hedefSpor: '90',
  hedefKalori: '2000',
  beslenmeHedefi: 'koru',
  aktiviteSeviyesi: 'orta',
  haftalikHedefKilo: '0.5',
  notifikasyon: true,
  darkMode: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(true);
  const { user, updateUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      setProfile(user);
      setIsLoading(false);
    } else {
      setProfile(defaultUserProfile);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      await updateUser(newProfile);
      setProfile(prev => ({ ...prev, ...newProfile }));
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}




