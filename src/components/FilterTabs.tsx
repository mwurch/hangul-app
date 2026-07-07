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

const SEGMENT_HEIGHT = 38;
const SEGMENT_RADIUS = 12;
const SEGMENT_GAP = 8;
const LABEL_SIZE = 13;

/** Rendered segment height is 38pt; extend the touch target to >= 44pt. */
const TAB_HIT_SLOP = { top: 3, bottom: 3 } as const;

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  const activeSegmentColor = isDark ? COLORS.darkBlue : COLORS.primaryBlue;
  const activeLabelColor = isDark ? COLORS.darkBackground : COLORS.lightBackground;
  const inactiveSegmentColor = isDark ? COLORS.darkSurface : COLORS.lightSurface;
  const inactiveLabelColor = isDark ? COLORS.darkMutedText : COLORS.mutedText;

  return (
    <View style={styles.container}>
      {TABS.map(({ key, label }) => {
        const isActive = activeFilter === key;
        return (
          <Pressable
            key={key}
            onPress={() => onFilterChange(key)}
            hitSlop={TAB_HIT_SLOP}
            style={[
              styles.segment,
              {
                backgroundColor: isActive ? activeSegmentColor : inactiveSegmentColor,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text
              style={[
                styles.label,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                { color: isActive ? activeLabelColor : inactiveLabelColor },
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
    gap: SEGMENT_GAP,
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: LABEL_SIZE,
    fontFamily: 'NotoSansKR-Regular',
  },
  activeLabel: {
    fontWeight: '700',
  },
  inactiveLabel: {
    fontWeight: '600',
  },
});
