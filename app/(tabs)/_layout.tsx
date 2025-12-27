import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="egzersiz"
        options={{
          title: 'Egzersiz',
          tabBarIcon: ({ color }) => <Ionicons name="barbell-outline" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="beslenme"
        options={{
          title: 'Beslenme',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="rutin"
        options={{
          title: 'Rutin',
          tabBarIcon: ({ color }) => <Ionicons name="checkmark-circle-outline" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={28} color={color} />, 
        }}
      />
    </Tabs>
  );
}
