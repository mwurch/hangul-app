import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingSlides } from '../src/components/OnboardingSlides';
import { useSettingsStore } from '../src/store/settings.store';
import { COLORS } from '../src/theme/colors';

/**
 * Tracks zustand persist rehydration for the settings store so the layout
 * can wait for the stored onboarding flag before choosing what to render.
 */
function useSettingsHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(
    useSettingsStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsubscribe = useSettingsStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    // Hydration may have finished between the initial read and subscribing.
    if (useSettingsStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return unsubscribe;
  }, []);

  return isHydrated;
}

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded, fontError] = useFonts({
    'NotoSansKR-Regular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
  });

  const isSettingsHydrated = useSettingsHydration();
  const hasCompletedOnboarding = useSettingsStore(
    (state) => state.hasCompletedOnboarding,
  );

  useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  if (!fontsLoaded || !isSettingsHydrated) {
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

  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OnboardingSlides />
      </SafeAreaProvider>
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
