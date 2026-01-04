import { db } from '@/config/firebase';
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface Friend {
  uid: string;
  ad: string;
  soyad: string;
  email: string;
  photoURL?: string;
  publicId: string;
  addedAt: any;
}

class FriendsService {
  
  // Kullanıcının public ID'sini oluştur/güncelle
  async generatePublicId(userId: string): Promise<string> {
    try {
      // Kullanıcı bilgilerini al
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      const userData = userDoc.data();
      
      // Eğer zaten public ID varsa onu döndür
      if (userData.publicId) {
        return userData.publicId;
      }
      
      // Yeni public ID oluştur (ad + soyad + random sayı)
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const publicId = `${userData.ad}${userData.soyad}${randomNum}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Public ID'nin benzersiz olduğunu kontrol et
      const existingUser = await this.findUserByPublicId(publicId);
      if (existingUser) {
        // Eğer aynı ID varsa, farklı bir sayı ile tekrar dene
        const newRandomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        const newPublicId = `${userData.ad}${userData.soyad}${newRandomNum}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Kullanıcıyı güncelle
        await updateDoc(doc(db, 'users', userId), {
          publicId: newPublicId,
          updatedAt: serverTimestamp()
        });
        
        return newPublicId;
      }
      
      // Kullanıcıyı güncelle
      await updateDoc(doc(db, 'users', userId), {
        publicId: publicId,
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        updatedAt: serverTimestamp()
      });
      
      return publicId;
    } catch (error) {
      console.error('Public ID oluşturma hatası:', error);
      throw error;
    }
  }
  
  // Public ID ile kullanıcı ara
  async findUserByPublicId(publicId: string): Promise<Friend | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('publicId', '==', publicId.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        uid: userDoc.id,
        ad: userData.ad,
        soyad: userData.soyad,
        email: userData.email,
        photoURL: userData.photoURL,
        publicId: userData.publicId,
        addedAt: null
      };
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      throw error;
    }
  }
  
  // Arkadaşlık isteği gönder
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Kendi kendine istek göndermeyi engelle
      if (fromUserId === toUserId) {
        return { success: false, message: 'Kendinize arkadaşlık isteği gönderemezsiniz.' };
      }
      
      // Zaten arkadaş mı kontrol et
      const fromUserDoc = await getDoc(doc(db, 'users', fromUserId));
      const fromUserData = fromUserDoc.data();
      
      if (fromUserData?.friends?.includes(toUserId)) {
        return { success: false, message: 'Bu kullanıcı zaten arkadaşınız.' };
      }
      
      // Zaten istek gönderilmiş mi kontrol et
      if (fromUserData?.sentFriendRequests?.includes(toUserId)) {
        return { success: false, message: 'Bu kullanıcıya zaten arkadaşlık isteği gönderilmiş.' };
      }
      
      // Karşı taraftan istek gelmiş mi kontrol et
      if (fromUserData?.friendRequests?.includes(toUserId)) {
        return { success: false, message: 'Bu kullanıcıdan size zaten arkadaşlık isteği gelmiş. İstekleri kontrol edin.' };
      }
      
      // İsteği gönder
      await updateDoc(doc(db, 'users', fromUserId), {
        sentFriendRequests: arrayUnion(toUserId)
      });
      
      await updateDoc(doc(db, 'users', toUserId), {
        friendRequests: arrayUnion(fromUserId)
      });
      
      return { success: true, message: 'Arkadaşlık isteği gönderildi!' };
    } catch (error) {
      console.error('Arkadaşlık isteği gönderme hatası:', error);
      return { success: false, message: 'Arkadaşlık isteği gönderilemedi.' };
    }
  }
  
  // Arkadaşlık isteğini kabul et
  async acceptFriendRequest(userId: string, friendId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Her iki kullanıcının arkadaş listesine ekle
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(friendId),
        friendRequests: arrayRemove(friendId)
      });
      
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayUnion(userId),
        sentFriendRequests: arrayRemove(userId)
      });
      
      return { success: true, message: 'Arkadaşlık isteği kabul edildi!' };
    } catch (error) {
      console.error('Arkadaşlık isteği kabul etme hatası:', error);
      return { success: false, message: 'Arkadaşlık isteği kabul edilemedi.' };
    }
  }
  
  // Arkadaşlık isteğini reddet
  async rejectFriendRequest(userId: string, friendId: string): Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        friendRequests: arrayRemove(friendId)
      });
      
      await updateDoc(doc(db, 'users', friendId), {
        sentFriendRequests: arrayRemove(userId)
      });
      
      return { success: true, message: 'Arkadaşlık isteği reddedildi.' };
    } catch (error) {
      console.error('Arkadaşlık isteği reddetme hatası:', error);
      return { success: false, message: 'Arkadaşlık isteği reddedilemedi.' };
    }
  }
  
  // Arkadaş listesini getir
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData?.friends || userData.friends.length === 0) {
        return [];
      }
      
      const friends: Friend[] = [];
      
      for (const friendId of userData.friends) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          friends.push({
            uid: friendId,
            ad: friendData.ad,
            soyad: friendData.soyad,
            email: friendData.email,
            photoURL: friendData.photoURL,
            publicId: friendData.publicId,
            addedAt: friendData.addedAt || serverTimestamp()
          });
        }
      }
      
      return friends;
    } catch (error) {
      console.error('Arkadaş listesi getirme hatası:', error);
      return [];
    }
  }
  
  // Gelen arkadaşlık isteklerini getir
  async getFriendRequests(userId: string): Promise<Friend[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData?.friendRequests || userData.friendRequests.length === 0) {
        return [];
      }
      
      const requests: Friend[] = [];
      
      for (const requesterId of userData.friendRequests) {
        const requesterDoc = await getDoc(doc(db, 'users', requesterId));
        if (requesterDoc.exists()) {
          const requesterData = requesterDoc.data();
          requests.push({
            uid: requesterId,
            ad: requesterData.ad,
            soyad: requesterData.soyad,
            email: requesterData.email,
            photoURL: requesterData.photoURL,
            publicId: requesterData.publicId,
            addedAt: null
          });
        }
      }
      
      return requests;
    } catch (error) {
      console.error('Arkadaşlık istekleri getirme hatası:', error);
      return [];
    }
  }
  
  // Arkadaşı sil
  async removeFriend(userId: string, friendId: string): Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(friendId)
      });
      
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(userId)
      });
      
      return { success: true, message: 'Arkadaş silindi.' };
    } catch (error) {
      console.error('Arkadaş silme hatası:', error);
      return { success: false, message: 'Arkadaş silinemedi.' };
    }
  }
}

export const friendsService = new FriendsService();