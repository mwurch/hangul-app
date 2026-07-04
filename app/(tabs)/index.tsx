import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme/colors';
import { type Jamo, ALL_JAMO, CONSONANTS, VOWELS } from '../../src/data/jamo';
import { useProgressStore } from '../../src/store/progress.store';
import {
  getCurrentLesson,
  getLessonForChar,
  getUnlockedChars,
} from '../../src/utils/lessonProgress';
import { CharCard } from '../../src/components/CharCard';
import { FilterTabs, type JamoFilter } from '../../src/components/FilterTabs';
import { JamoDetailPanel } from '../../src/components/JamoDetailPanel';

const GRID_COLUMNS = 4;

function getFilteredJamo(filter: JamoFilter): readonly Jamo[] {
  switch (filter) {
    case 'consonant':
      return CONSONANTS;
    case 'vowel':
      return VOWELS;
    default:
      return ALL_JAMO;
  }
}

function getFilterLabel(filter: JamoFilter): string {
  switch (filter) {
    case 'consonant':
      return '14 Consonants';
    case 'vowel':
      return '10 Vowels';
    default:
      return '24 Characters';
  }
}

function showLockedAlert(char: string): void {
  const lesson = getLessonForChar(char);
  if (lesson === undefined) {
    return;
  }
  Alert.alert(
    '🔒 잠김',
    `Lesson ${lesson.id} (${lesson.koreanTitle})을 완료하면 열려요\nComplete Lesson ${lesson.id} to unlock`,
  );
}

export default function StudyScreen(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const getProgress = useProgressStore((s) => s.getProgress);
  const progress = useProgressStore((s) => s.progress);

  const [filter, setFilter] = useState<JamoFilter>('all');
  const [selectedJamo, setSelectedJamo] = useState<Jamo | null>(null);

  const filteredJamo = useMemo(() => getFilteredJamo(filter), [filter]);
  const unlockedChars = useMemo(() => getUnlockedChars(progress), [progress]);
  const currentLesson = useMemo(() => getCurrentLesson(progress), [progress]);

  const handleCardPress = useCallback(
    (jamo: Jamo) => {
      if (!unlockedChars.has(jamo.char)) {
        showLockedAlert(jamo.char);
        return;
      }
      setSelectedJamo(jamo);
    },
    [unlockedChars],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedJamo(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { readonly item: Jamo }) => (
      <CharCard
        jamo={item}
        hasProgress={getProgress(item.char) !== undefined}
        onPress={handleCardPress}
        isLocked={!unlockedChars.has(item.char)}
      />
    ),
    [getProgress, handleCardPress, unlockedChars],
  );

  const keyExtractor = useCallback((item: Jamo) => item.char, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
          ]}
          accessibilityRole="header"
        >
          자모 학습
        </Text>
        <Text style={[styles.subtitle, { color: COLORS.mutedText }]}>
          {`${getFilterLabel(filter)} · Lesson ${currentLesson.id} · ${unlockedChars.size}/${ALL_JAMO.length} unlocked`}
        </Text>
      </View>

      <FilterTabs activeFilter={filter} onFilterChange={setFilter} />

      <FlatList
        data={filteredJamo}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
      />

      <JamoDetailPanel jamo={selectedJamo} onClose={handleCloseDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'NotoSansKR-Regular',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'center',
  },
});
