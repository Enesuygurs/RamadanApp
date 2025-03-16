import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="[city]"
        options={{
          title: 'Namaz Vakitleri',
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#2c3e50',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
