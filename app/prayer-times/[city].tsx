import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import moment from 'moment';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../../components/ThemedText';

interface PrayerTime {
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const cities = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Şanlıurfa',
  'Kayseri',
];

export default function CityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCitySelect = async (city: string) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('selectedCity', city);
      
      // Save mock prayer times for the selected city
      const mockPrayerTimes = {
        imsak: '05:30',
        gunes: '06:57',
        ogle: '13:08',
        ikindi: '16:33',
        aksam: '19:19',
        yatsi: '20:41'
      };
      await AsyncStorage.setItem(`prayerTimes_${city}`, JSON.stringify(mockPrayerTimes));
      
      router.back();
    } catch (error) {
      console.error('Error saving city:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#fafafa', '#f5f5f5']}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(250,250,250,0.95)']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Şehir Seçin</ThemedText>
          </View>

          <BlurView intensity={60} tint="light" style={styles.card}>
            {loading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
            ) : (
              <View style={styles.citiesList}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.cityItem}
                    onPress={() => handleCitySelect(city)}
                  >
                    <View style={styles.cityItemContent}>
                      <Ionicons name="location-outline" size={24} color="#3b82f6" />
                      <ThemedText style={styles.cityName}>{city}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  card: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loader: {
    padding: 40,
  },
  citiesList: {
    padding: 8,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
});
