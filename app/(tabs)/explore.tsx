import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Platform, Keyboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const cities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
  'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat',
  'Zonguldak'
].sort((a, b) => a.localeCompare(b, 'tr'));

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadSelectedCity();
  }, []);

  const loadSelectedCity = async () => {
    try {
      const city = await AsyncStorage.getItem('selectedCity');
      if (city) {
        setSelectedCity(city);
      }
    } catch (error) {
      console.error('Error loading selected city:', error);
    }
  };

  const handleCitySelect = async (city: string) => {
    try {
      await AsyncStorage.setItem('selectedCity', city);
      setSelectedCity(city);
      router.push('/');
    } catch (error) {
      console.error('Error saving selected city:', error);
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/i̇/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const filteredCities = useMemo(() => {
    return cities.filter(city =>
      normalizeText(city).includes(normalizeText(searchQuery))
    );
  }, [searchQuery]);

  return (
    <LinearGradient
      colors={['#fafafa', '#f5f5f5']}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(250,250,250,0.95)']}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Ayarlar</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Şehir Seçimi</ThemedText>
            <View style={styles.searchContainer}>
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="#64748b" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Şehir ara..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#64748b"
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.citiesGrid}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityButton,
                    selectedCity === city && styles.selectedCityButton,
                  ]}
                  onPress={() => handleCitySelect(city)}
                >
                  <ThemedText 
                    style={[
                      styles.cityButtonText,
                      selectedCity === city && styles.selectedCityButtonText,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {city}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchIcon: {
    paddingLeft: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 16,
    color: '#0f172a',
    paddingVertical: 0,
  },
  clearButton: {
    paddingRight: 16,
    opacity: 0.8,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cityButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '31.3%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: '2%',
    marginBottom: 8,
  },
  selectedCityButton: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  cityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  selectedCityButtonText: {
    color: 'white',
  },
});
