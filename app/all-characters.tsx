import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { COLORS } from '../src/theme/colors';
import { type Jamo, ALL_JAMO, CONSONANTS, VOWELS } from '../src/data/jamo';
import { useProgressStore } from '../src/store/progress.store';
import {
  getLessonForChar,
  getUnlockedChars,
} from '../src/utils/lessonProgress';
import { CharCard } from '../src/components/CharCard';
import { FilterTabs, type JamoFilter } from '../src/components/FilterTabs';
import { JamoDetailPanel } from '../src/components/JamoDetailPanel';

const GRID_COLUMNS = 4;
const GRID_GAP = 9;
const SCREEN_PADDING = 20;
const COUNT_TEXT_SIZE = 12;

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

export default function AllCharactersScreen(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const getProgress = useProgressStore((s) => s.getProgress);
  const progress = useProgressStore((s) => s.progress);

  const [filter, setFilter] = useState<JamoFilter>('all');
  const [selectedJamo, setSelectedJamo] = useState<Jamo | null>(null);

  const filteredJamo = useMemo(() => getFilteredJamo(filter), [filter]);
  const unlockedChars = useMemo(() => getUnlockedChars(progress), [progress]);

  // Fixed cell width so incomplete last rows (e.g. 10 vowels) don't stretch.
  const cellWidth =
    (windowWidth - 2 * SCREEN_PADDING - (GRID_COLUMNS - 1) * GRID_GAP) /
    GRID_COLUMNS;

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
      <View style={{ width: cellWidth }}>
        <CharCard
          jamo={item}
          hasProgress={getProgress(item.char) !== undefined}
          onPress={handleCardPress}
          isLocked={!unlockedChars.has(item.char)}
        />
      </View>
    ),
    [cellWidth, getProgress, handleCardPress, unlockedChars],
  );

  const keyExtractor = useCallback((item: Jamo) => item.char, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground },
      ]}
    >
      <Stack.Screen options={{ title: '전체 글자' }} />

      <FilterTabs activeFilter={filter} onFilterChange={setFilter} />

      <Text
        style={[
          styles.countLine,
          { color: isDark ? COLORS.darkMutedText : COLORS.mutedText },
        ]}
        accessibilityLabel={`${unlockedChars.size} of ${ALL_JAMO.length} characters unlocked`}
      >
        {`${unlockedChars.size} / ${ALL_JAMO.length}`}
      </Text>

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
  countLine: {
    fontSize: COUNT_TEXT_SIZE,
    fontWeight: '700',
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 6,
  },
  grid: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 24,
    gap: GRID_GAP,
  },
  gridRow: {
    gap: GRID_GAP,
  },
});
