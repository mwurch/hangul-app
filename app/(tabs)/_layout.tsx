import { type ColorValue, StyleSheet, Text, useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/theme/colors';

interface TabIconProps {
  readonly label: string;
  readonly color: ColorValue;
}

function TabIcon({ label, color }: TabIconProps): React.JSX.Element {
  return (
    <Text
      style={[styles.tabIcon, { color }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {label}
    </Text>
  );
}

export default function TabLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? COLORS.darkText : COLORS.primaryBlue,
        tabBarInactiveTintColor: COLORS.mutedText,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightBackground,
          borderTopColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
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
