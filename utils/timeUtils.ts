import moment from 'moment';
import 'moment/locale/tr';

moment.locale('tr');

export const calculateTimeRemaining = (targetTime: moment.Moment): string => {
  const now = moment();
  const duration = moment.duration(targetTime.diff(now));
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.asMinutes() % 60);

  if (hours < 0 || minutes < 0) return '';

  if (hours === 0) {
    return `${minutes} dakika`;
  }
  return `${hours} saat ${minutes} dakika`;
};

export const getNextPrayer = (prayerTimes: any) => {
  if (!prayerTimes) return null;

  const now = moment();
  const prayers = [
    { type: 'sahur', name: 'İmsak', time: prayerTimes.Fajr },
    { type: 'prayer', name: 'Güneş', time: prayerTimes.Sunrise },
    { type: 'prayer', name: 'Öğle', time: prayerTimes.Dhuhr },
    { type: 'prayer', name: 'İkindi', time: prayerTimes.Asr },
    { type: 'iftar', name: 'Akşam', time: prayerTimes.Maghrib },
    { type: 'prayer', name: 'Yatsı', time: prayerTimes.Isha }
  ];

  // First check today's prayers
  const nextPrayer = prayers.find(prayer => {
    const prayerTime = moment(prayer.time, 'HH:mm');
    return now.isBefore(prayerTime);
  });

  if (!nextPrayer) {
    // If no next prayer today, get first prayer of next day (İmsak)
    const nextDayImsak = moment(prayers[0].time, 'HH:mm').add(1, 'day');
    return {
      ...prayers[0],
      time: prayers[0].time,
      remaining: calculateTimeRemaining(nextDayImsak)
    };
  }

  const prayerTime = moment(nextPrayer.time, 'HH:mm');
  return {
    ...nextPrayer,
    remaining: calculateTimeRemaining(prayerTime)
  };
};

export const formatTimeForDisplay = (time: string): string => {
  return moment(time, 'HH:mm').format('HH:mm');
};
