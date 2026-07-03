import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const COLORS = {
  primaryBlue: '#1A3F7A',
  teal: '#0F6E56',
  lightBackground: '#FFFFFF',
  darkBackground: '#121212',
} as const;

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded, fontError] = useFonts({
    'NotoSansKR-Regular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  if (!fontsLoaded) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
          },
          headerTintColor: isDark ? COLORS.lightBackground : COLORS.primaryBlue,
          headerTitleStyle: {
            fontFamily: 'NotoSansKR-Regular',
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
