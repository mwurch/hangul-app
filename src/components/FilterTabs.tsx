import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';

export type JamoFilter = 'all' | 'consonant' | 'vowel';

interface FilterTabsProps {
  readonly activeFilter: JamoFilter;
  readonly onFilterChange: (filter: JamoFilter) => void;
}

const TABS: readonly { readonly key: JamoFilter; readonly label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'consonant', label: '자음' },
  { key: 'vowel', label: '모음' },
] as const;

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {TABS.map(({ key, label }) => {
        const isActive = activeFilter === key;
        return (
          <Pressable
            key={key}
            onPress={() => onFilterChange(key)}
            style={[
              styles.tab,
              isActive
                ? styles.activeTab
                : {
                    backgroundColor: isDark ? COLORS.darkSurface : '#F5F5F5',
                  },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text
              style={[
                styles.tabText,
                isActive
                  ? styles.activeTabText
                  : { color: isDark ? COLORS.darkText : COLORS.lightText },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primaryBlue,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
