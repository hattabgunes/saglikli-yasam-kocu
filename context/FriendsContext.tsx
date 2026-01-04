import { useAuth } from '@/context/AuthContext';
import { Friend, friendsService } from '@/services/friendsService';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FriendsContextType {
  friends: Friend[];
  friendRequests: Friend[];
  isLoading: boolean;
  publicId: string;
  
  // Actions
  generatePublicId: () => Promise<string>;
  findUserByPublicId: (publicId: string) => Promise<Friend | null>;
  sendFriendRequest: (toUserId: string) => Promise<{ success: boolean; message: string }>;
  acceptFriendRequest: (friendId: string) => Promise<{ success: boolean; message: string }>;
  rejectFriendRequest: (friendId: string) => Promise<{ success: boolean; message: string }>;
  removeFriend: (friendId: string) => Promise<{ success: boolean; message: string }>;
  refreshFriends: () => Promise<void>;
  refreshFriendRequests: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { user, firebaseUser } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [publicId, setPublicId] = useState('');

  // Kullanıcı değiştiğinde arkadaş verilerini yükle
  useEffect(() => {
    if (user && firebaseUser) {
      loadFriendsData();
      loadPublicId();
    } else {
      // Kullanıcı çıkış yaptığında verileri temizle
      setFriends([]);
      setFriendRequests([]);
      setPublicId('');
    }
  }, [user, firebaseUser]);

  const loadPublicId = async () => {
    if (!firebaseUser) return;
    
    try {
      // Eğer kullanıcının public ID'si yoksa oluştur
      if (!user?.publicId) {
        const newPublicId = await friendsService.generatePublicId(firebaseUser.uid);
        setPublicId(newPublicId);
      } else {
        setPublicId(user.publicId);
      }
    } catch (error) {
      console.error('Public ID yükleme hatası:', error);
    }
  };

  const loadFriendsData = async () => {
    if (!firebaseUser) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        refreshFriends(),
        refreshFriendRequests()
      ]);
    } catch (error) {
      console.error('Arkadaş verileri yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePublicId = async (): Promise<string> => {
    if (!firebaseUser) throw new Error('Kullanıcı oturumu bulunamadı');
    
    try {
      const newPublicId = await friendsService.generatePublicId(firebaseUser.uid);
      setPublicId(newPublicId);
      return newPublicId;
    } catch (error) {
      console.error('Public ID oluşturma hatası:', error);
      throw error;
    }
  };

  const findUserByPublicId = async (searchPublicId: string): Promise<Friend | null> => {
    try {
      return await friendsService.findUserByPublicId(searchPublicId);
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      throw error;
    }
  };

  const sendFriendRequest = async (toUserId: string): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) return { success: false, message: 'Kullanıcı oturumu bulunamadı' };
    
    try {
      const result = await friendsService.sendFriendRequest(firebaseUser.uid, toUserId);
      if (result.success) {
        // Başarılı olursa verileri yenile
        await refreshFriendRequests();
      }
      return result;
    } catch (error) {
      console.error('Arkadaşlık isteği gönderme hatası:', error);
      return { success: false, message: 'Arkadaşlık isteği gönderilemedi' };
    }
  };

  const acceptFriendRequest = async (friendId: string): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) return { success: false, message: 'Kullanıcı oturumu bulunamadı' };
    
    try {
      const result = await friendsService.acceptFriendRequest(firebaseUser.uid, friendId);
      if (result.success) {
        // Başarılı olursa verileri yenile
        await Promise.all([
          refreshFriends(),
          refreshFriendRequests()
        ]);
      }
      return result;
    } catch (error) {
      console.error('Arkadaşlık isteği kabul etme hatası:', error);
      return { success: false, message: 'Arkadaşlık isteği kabul edilemedi' };
    }
  };

  const rejectFriendRequest = async (friendId: string): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) return { success: false, message: 'Kullanıcı oturumu bulunamadı' };
    
    try {
      const result = await friendsService.rejectFriendRequest(firebaseUser.uid, friendId);
      if (result.success) {
        // Başarılı olursa istekleri yenile
        await refreshFriendRequests();
      }
      return result;
    } catch (error) {
      console.error('Arkadaşlık isteği reddetme hatası:', error);
      return { success: false, message: 'Arkadaşlık isteği reddedilemedi' };
    }
  };

  const removeFriend = async (friendId: string): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) return { success: false, message: 'Kullanıcı oturumu bulunamadı' };
    
    try {
      const result = await friendsService.removeFriend(firebaseUser.uid, friendId);
      if (result.success) {
        // Başarılı olursa arkadaş listesini yenile
        await refreshFriends();
      }
      return result;
    } catch (error) {
      console.error('Arkadaş silme hatası:', error);
      return { success: false, message: 'Arkadaş silinemedi' };
    }
  };

  const refreshFriends = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    try {
      const friendsList = await friendsService.getFriends(firebaseUser.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error('Arkadaş listesi yenileme hatası:', error);
    }
  };

  const refreshFriendRequests = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    try {
      const requestsList = await friendsService.getFriendRequests(firebaseUser.uid);
      setFriendRequests(requestsList);
    } catch (error) {
      console.error('Arkadaşlık istekleri yenileme hatası:', error);
    }
  };

  const value: FriendsContextType = {
    friends,
    friendRequests,
    isLoading,
    publicId,
    generatePublicId,
    findUserByPublicId,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends,
    refreshFriendRequests
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}