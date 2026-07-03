import { type ColorValue, StyleSheet, Text, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';

const COLORS = {
  activeTab: '#1A3F7A',
  inactiveTab: '#999999',
  lightBackground: '#FFFFFF',
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
} as const;

interface TabIconProps {
  readonly label: string;
  readonly color: ColorValue;
}

function TabIcon({ label, color }: TabIconProps): React.JSX.Element {
  return <Text style={[styles.tabIcon, { color }]}>{label}</Text>;
}

export default function TabLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.activeTab,
        tabBarInactiveTintColor: COLORS.inactiveTab,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightBackground,
          borderTopColor: isDark ? '#333333' : '#E0E0E0',
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 6,
          paddingBottom: 6,
          height: 72,
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSansKR-Regular',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <TabIcon label="ㄱ" color={color} />,
        }}
      />
      <Tabs.Screen
        name="build"
        options={{
          title: 'Build',
          tabBarIcon: ({ color }) => <TabIcon label="한" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color }) => <TabIcon label="?" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon label="○" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: 30,
    textAlign: 'center',
  },
});
