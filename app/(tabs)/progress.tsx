import { StyleSheet, Text, View, useColorScheme } from 'react-native';

const COLORS = {
  primaryBlue: '#1A3F7A',
  lightBackground: '#FFFFFF',
  darkBackground: '#121212',
  lightText: '#333333',
  darkText: '#E0E0E0',
} as const;

export default function ProgressScreen(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
      >
        Progress
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
      >
        학습 진행
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 28,
    fontFamily: 'NotoSansKR-Regular',
  },
});
