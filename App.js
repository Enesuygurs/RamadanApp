import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ImageBackground, StatusBar, ActivityIndicator } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const cities = [
  'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Diyarbakir'
];

function App() {
  const [selectedCity, setSelectedCity] = useState('Istanbul');

  return (
    <NavigationContainer>
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTopWidth: 0,
            elevation: 0,
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            borderRadius: 15,
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        >
          {props => <HomeScreen {...props} setSelectedCity={setSelectedCity} />}
        </Tabs.Screen>
        <Tabs.Screen
          name="PrayerTimes"
          options={{
            title: 'Namaz Vakitleri',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        >
          {props => <PrayerTimesScreen {...props} selectedCity={selectedCity} />}
        </Tabs.Screen>
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation, setSelectedCity }) {
  return (
    <ImageBackground
      source={require('./assets/mosque-bg.jpg')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <Text style={styles.title}>Şehir Seçiniz</Text>
          <FlatList
            data={cities}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => {
                  setSelectedCity(item);
                  navigation.navigate('PrayerTimes');
                }}
              >
                <BlurView intensity={80} tint="light" style={styles.cityItemBlur}>
                  <Text style={styles.cityText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </BlurView>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
            contentContainerStyle={styles.cityList}
          />
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

function PrayerTimesScreen({ route, selectedCity }) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = moment().format('DD-MM-YYYY');
        const response = await axios.get(
          `http://api.aladhan.com/v1/timingsByCity/${today}?city=${selectedCity}&country=Turkey&method=13`
        );
        setPrayerTimes(response.data.data.timings);
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Namaz vakitleri yükleniyor...</Text>
      </View>
    );
  }

  const getPrayerStatus = (times) => {
    const current = currentTime.format('HH:mm');
    const timeOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextPrayer = null;
    
    for (let i = 0; i < timeOrder.length; i++) {
      if (current < times[timeOrder[i]]) {
        nextPrayer = timeOrder[i];
        break;
      }
    }
    
    return nextPrayer || 'Fajr';
  };

  const nextPrayer = getPrayerStatus(prayerTimes);

  return (
    <ImageBackground
      source={require('./assets/prayer-bg.jpg')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <Text style={styles.cityTitle}>{selectedCity}</Text>
          <Text style={styles.currentTime}>{currentTime.format('HH:mm:ss')}</Text>
          <View style={styles.timesContainer}>
            {Object.entries({
              'İmsak (Sahur)': prayerTimes?.Fajr,
              'Güneş': prayerTimes?.Sunrise,
              'Öğle': prayerTimes?.Dhuhr,
              'İkindi': prayerTimes?.Asr,
              'İftar (Akşam)': prayerTimes?.Maghrib,
              'Yatsı': prayerTimes?.Isha
            }).map(([label, time], index) => (
              <BlurView
                key={label}
                intensity={80}
                tint="dark"
                style={[
                  styles.timeItem,
                  (label.includes(nextPrayer) || 
                   (nextPrayer === 'Fajr' && label.includes('İmsak')) ||
                   (nextPrayer === 'Maghrib' && label.includes('İftar'))) && 
                  styles.nextPrayerTime
                ]}
              >
                <Text style={styles.timeLabel}>{label}</Text>
                <Text style={styles.timeValue}>{time}</Text>
              </BlurView>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cityTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'center',
    color: '#fff',
    marginTop: 10,
    marginBottom: 30,
    fontVariant: ['tabular-nums'],
  },
  cityList: {
    padding: 20,
  },
  cityItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cityItemBlur: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  timesContainer: {
    padding: 20,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  nextPrayerTime: {
    borderWidth: 2,
    borderColor: '#f97316',
  },
  timeLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});
