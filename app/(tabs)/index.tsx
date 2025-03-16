import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, ScrollView, Dimensions, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import moment from 'moment';
import 'moment/locale/tr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

moment.locale('tr');

interface PrayerTime {
  name: string;
  time: string;
  type?: 'sahur' | 'iftar';
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  isNextDay?: boolean;
}

const cities = [
  'Istanbul',
  'Ankara',
  'Izmir',
  'Bursa',
  'Antalya',
];

type WeatherIcon = 'sunny' | 'partly-sunny' | 'rainy' | 'thunderstorm' | 'snow' | 'cloudy';

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(moment());
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [lastUpdateDate, setLastUpdateDate] = useState(moment().format('DD-MM-YYYY'));
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([
    { name: 'İmsak', time: '05:30', icon: 'moon', color: '#8b5cf6', type: 'sahur' },
    { name: 'Güneş', time: '06:57', icon: 'sunny', color: '#f59e0b' },
    { name: 'Öğle', time: '13:08', icon: 'sunny-outline', color: '#f97316' },
    { name: 'İkindi', time: '16:33', icon: 'partly-sunny', color: '#10b981' },
    { name: 'Akşam', time: '19:19', icon: 'cloudy-night', color: '#6366f1', type: 'iftar' },
    { name: 'Yatsı', time: '20:41', icon: 'moon-outline', color: '#4f46e5' },
  ]);

  const [fadeAnim] = useState(new Animated.Value(1));
  const [iconScale] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = moment();
      setCurrentTime(now);
      
      // Check if we need to update prayer times for the new day
      const today = now.format('DD-MM-YYYY');
      if (today !== lastUpdateDate) {
        setLastUpdateDate(today);
        loadPrayerTimes(today);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdateDate]);

  useEffect(() => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    const scaleAnimation = Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 1.15,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulseAnimation).start();
    Animated.loop(scaleAnimation).start();

    return () => {
      fadeAnim.stopAnimation();
      iconScale.stopAnimation();
    };
  }, []);

  const loadPrayerTimes = async (date: string) => {
    try {
      const times = await AsyncStorage.getItem(`prayerTimes_${selectedCity}_${date}`);
      
      if (times) {
        const parsedTimes = JSON.parse(times);
        setPrayerTimes([
          { name: 'İmsak', time: parsedTimes.imsak, icon: 'moon', color: '#8b5cf6', type: 'sahur' },
          { name: 'Güneş', time: parsedTimes.gunes, icon: 'sunny', color: '#f59e0b' },
          { name: 'Öğle', time: parsedTimes.ogle, icon: 'sunny-outline', color: '#f97316' },
          { name: 'İkindi', time: parsedTimes.ikindi, icon: 'partly-sunny', color: '#10b981' },
          { name: 'Akşam', time: parsedTimes.aksam, icon: 'cloudy-night', color: '#6366f1', type: 'iftar' },
          { name: 'Yatsı', time: parsedTimes.yatsi, icon: 'moon-outline', color: '#4f46e5' },
        ]);
      } else {
        // If no stored times, fetch them
        const response = await fetch(
          `http://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(selectedCity)}&country=Turkey&method=13`
        );
        const data = await response.json();
        
        const newTimes = {
          imsak: data.data.timings.Fajr,
          gunes: data.data.timings.Sunrise,
          ogle: data.data.timings.Dhuhr,
          ikindi: data.data.timings.Asr,
          aksam: data.data.timings.Maghrib,
          yatsi: data.data.timings.Isha
        };
        
        await AsyncStorage.setItem(`prayerTimes_${selectedCity}_${date}`, JSON.stringify(newTimes));
        setPrayerTimes([
          { name: 'İmsak', time: newTimes.imsak, icon: 'moon', color: '#8b5cf6', type: 'sahur' },
          { name: 'Güneş', time: newTimes.gunes, icon: 'sunny', color: '#f59e0b' },
          { name: 'Öğle', time: newTimes.ogle, icon: 'sunny-outline', color: '#f97316' },
          { name: 'İkindi', time: newTimes.ikindi, icon: 'partly-sunny', color: '#10b981' },
          { name: 'Akşam', time: newTimes.aksam, icon: 'cloudy-night', color: '#6366f1', type: 'iftar' },
          { name: 'Yatsı', time: newTimes.yatsi, icon: 'moon-outline', color: '#4f46e5' },
        ]);
      }
    } catch (error) {
      console.error('Error loading prayer times:', error);
    }
  };

  useEffect(() => {
    const getWeatherIcon = (condition: string): WeatherIcon => {
      const conditions: Record<string, WeatherIcon> = {
        'Clear': 'sunny',
        'Clouds': 'partly-sunny',
        'Rain': 'rainy',
        'Drizzle': 'rainy',
        'Thunderstorm': 'thunderstorm',
        'Snow': 'snow',
        'Mist': 'cloudy',
        'Fog': 'cloudy'
      };
      return conditions[condition] || 'partly-sunny';
    };

    const fetchWeather = async () => {
      // Removed weather fetching logic
    };

    if (selectedCity) {
      // Removed weather fetching call
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity) {
      loadPrayerTimes(moment().format('DD-MM-YYYY'));
    }
  }, [selectedCity]);

  useFocusEffect(
    React.useCallback(() => {
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

      loadSelectedCity();
    }, [])
  );

  const calculateNextPrayerTime = () => {
    if (prayerTimes.length === 0) return null;

    const now = moment();
    const iftar = prayerTimes.find(prayer => prayer.type === 'iftar');
    const sahur = prayerTimes.find(prayer => prayer.type === 'sahur');

    if (!iftar || !sahur) return null;

    // Convert prayer times to moment objects for today
    const todayIftarTime = moment(iftar.time, 'HH:mm');
    const todaySahurTime = moment(sahur.time, 'HH:mm');
    
    // Convert prayer times to moment objects for tomorrow
    const tomorrowSahurTime = moment(sahur.time, 'HH:mm').add(1, 'day');
    const tomorrowIftarTime = moment(iftar.time, 'HH:mm').add(1, 'day');

    let targetTime;
    let isIftar = false;

    if (now.isBefore(todaySahurTime)) {
      // Before today's sahur - target is today's sahur
      targetTime = todaySahurTime;
      isIftar = false;
    } else if (now.isBefore(todayIftarTime)) {
      // Between sahur and iftar - target is today's iftar
      targetTime = todayIftarTime;
      isIftar = true;
    } else {
      // After today's iftar - target is tomorrow's sahur
      targetTime = tomorrowSahurTime;
      isIftar = false;
    }

    const duration = moment.duration(targetTime.diff(now));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    // Ensure we don't show negative values
    if (hours < 0 || minutes < 0) {
      return {
        type: isIftar ? 'iftar' : 'sahur',
        remaining: '0 saat 0 dakika',
      };
    }

    return {
      type: isIftar ? 'iftar' : 'sahur',
      hours,
      minutes,
      seconds,
    };
  };

  const renderCountdown = () => {
    const nextPrayerTime = calculateNextPrayerTime();
    if (!nextPrayerTime) return null;

    const isIftar = nextPrayerTime.type === 'iftar';
    const isSahur = nextPrayerTime.type === 'sahur';
    const gradientColors = isIftar 
      ? ['#818cf8', '#6366f1'] as const
      : isSahur 
        ? ['#a78bfa', '#8b5cf6'] as const
        : ['#94a3b8', '#64748b'] as const;

    return (
      <View style={styles.countdownContainer}>
        <LinearGradient
          colors={gradientColors}
          style={styles.countdownContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.countdownHeader}>
            <View style={styles.countdownIconContainer}>
              <Ionicons 
                name={isIftar ? 'moon' : isSahur ? 'sunny' : 'time'} 
                size={24} 
                color="white" 
              />
            </View>
            <ThemedText style={styles.countdownTitle}>
              {isIftar ? 'İftara' : isSahur ? 'İmsak\'a' : 'Sonraki Namaza'} Kalan Süre
            </ThemedText>
          </View>

          <View style={styles.timeContainer}>
            <Animated.View style={[styles.timeBlock, { opacity: fadeAnim }]}>
              <ThemedText style={styles.timeValue}>{String(nextPrayerTime.hours).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Saat</ThemedText>
            </Animated.View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <Animated.View style={[styles.timeBlock, { opacity: fadeAnim }]}>
              <ThemedText style={styles.timeValue}>{String(nextPrayerTime.minutes).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Dakika</ThemedText>
            </Animated.View>
            <ThemedText style={styles.timeSeparator}>:</ThemedText>
            <Animated.View style={[styles.timeBlock, { opacity: fadeAnim }]}>
              <ThemedText style={styles.timeValue}>{String(nextPrayerTime.seconds).padStart(2, '0')}</ThemedText>
              <ThemedText style={styles.timeLabel}>Saniye</ThemedText>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderPrayerTimes = () => {
    if (prayerTimes.length === 0) return null;

    const nextPrayer = prayerTimes.find(prayer => {
      const prayerTime = moment(prayer.time, 'HH:mm');
      return currentTime.isBefore(prayerTime);
    });

    return prayerTimes.map((prayer, index) => {
      const isNext = prayer === nextPrayer;
      const isPassed = moment(prayer.time, 'HH:mm').isBefore(currentTime);

      return (
        <Animated.View
          key={prayer.name}
          style={[
            styles.prayerTimeItem,
            isNext && { backgroundColor: `${prayer.color}20` }
          ]}
        >
          <View style={[styles.prayerTimeIcon, { backgroundColor: `${prayer.color}10` }]}>
            <LinearGradient
              colors={[`${prayer.color}20`, `${prayer.color}30`]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={[
                styles.iconContainer,
                isNext && { transform: [{ scale: iconScale }] }
              ]}>
                <Ionicons 
                  name={prayer.icon} 
                  size={24} 
                  color={prayer.color} 
                  style={styles.prayerIcon} 
                />
              </Animated.View>
            </LinearGradient>
          </View>
          <View style={styles.prayerTimeContent}>
            <View>
              <ThemedText style={[
                styles.prayerTimeName,
                isPassed && styles.passedTimeText,
                isNext && { color: prayer.color }
              ]}>
                {prayer.name}
              </ThemedText>
              {isNext && (
                <ThemedText style={styles.nextPrayerLabel}>Sonraki Vakit</ThemedText>
              )}
            </View>
            <ThemedText style={[
              styles.prayerTimeValue,
              isPassed && styles.passedTimeText,
              isNext && { color: prayer.color }
            ]}>
              {prayer.time}
            </ThemedText>
          </View>
        </Animated.View>
      );
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.content}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Ana Sayfa</ThemedText>
          <ThemedText style={styles.headerDate}>{currentTime.format('DD MMMM YYYY, dddd')}</ThemedText>
        </View>

        <View style={styles.cityNameContainer}>
          <View style={styles.cityNameContent}>
            <View style={styles.cityNameIcon}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={18} color="#f97316" />
              </View>
              <ThemedText style={styles.cityName}>{selectedCity}</ThemedText>
            </View>
          </View>
        </View>

        {renderCountdown()}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
              </View>
              <ThemedText style={styles.cardTitleText}>Namaz Vakitleri</ThemedText>
            </View>
            <View style={styles.cardDateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" style={styles.cardDateIcon} />
              <ThemedText style={styles.cardDate}>{moment().format('DD MMMM')}</ThemedText>
            </View>
          </View>
          <View style={styles.cardContent}>
            {renderPrayerTimes()}
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    minHeight: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  cityNameContainer: {
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff7ed',
  },
  cityNameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cityNameIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
  },
  weatherContainer: {
    display: 'none',
  },
  card: {
    margin: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cardDateIcon: {
    marginRight: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#64748b',
  },
  cardContent: {
    padding: 8,
    paddingBottom: 16,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  prayerTimeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerIcon: {
    opacity: 0.9,
  },
  prayerTimeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerTimeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  nextPrayerLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  prayerTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  passedTimeText: {
    opacity: 0.5,
  },
  activePrayerTime: {
    color: 'currentColor',
  },
  countdownContainer: {
    margin: 16,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  countdownContent: {
    padding: 20,
    paddingVertical: 24,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  countdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 72,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
    paddingTop: 8,

  },
  timeLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginHorizontal: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    opacity: 0.7,
  },
});
