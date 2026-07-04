import { useCallback, useState } from 'react';
import {
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { COLORS } from '../theme/colors';

interface JamoKeyboardProps {
  readonly characters: readonly string[];
  readonly onSelect: (char: string) => void;
  readonly activeSlotLabel: string;
}

/** Fallback before the first layout pass; also the largest a key may grow. */
const MAX_KEY_SIZE = 44;
const KEY_GAP = 8;
const NUM_COLUMNS = 7;
const GLYPH_SIZE = 24;

/** Key size that fits NUM_COLUMNS keys plus gaps into the measured width. */
function calculateKeySize(availableWidth: number): number {
  if (availableWidth <= 0) {
    return MAX_KEY_SIZE;
  }
  const gapsTotal = KEY_GAP * (NUM_COLUMNS - 1);
  const fitted = Math.floor((availableWidth - gapsTotal) / NUM_COLUMNS);
  return Math.min(MAX_KEY_SIZE, fitted);
}

function JamoKey({
  char,
  onPress,
  isDark,
  size,
}: {
  readonly char: string;
  readonly onPress: (char: string) => void;
  readonly isDark: boolean;
  readonly size: number;
}): React.JSX.Element {
  const handlePress = useCallback(() => {
    onPress(char);
  }, [char, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.key,
        {
          width: size,
          height: size,
          backgroundColor: isDark ? COLORS.darkSurface : '#F0F0F0',
          opacity: pressed ? 0.6 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={char}
    >
      <Text
        style={[
          styles.keyText,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
      >
        {char}
      </Text>
    </Pressable>
  );
}

export function JamoKeyboard({
  characters,
  onSelect,
  activeSlotLabel,
}: JamoKeyboardProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const [gridWidth, setGridWidth] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  }, []);

  const keySize = calculateKeySize(gridWidth);

  const keyExtractor = useCallback((item: string) => item, []);

  const renderItem = useCallback(
    ({ item }: { readonly item: string }) => (
      <JamoKey char={item} onPress={onSelect} isDark={isDark} size={keySize} />
    ),
    [onSelect, isDark, keySize],
  );

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.header,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
      >
        {activeSlotLabel} 선택
      </Text>
      <FlatList
        onLayout={handleLayout}
        data={characters}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
    marginBottom: 12,
  },
  grid: {
    gap: KEY_GAP,
  },
  row: {
    gap: KEY_GAP,
  },
  key: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: GLYPH_SIZE + 6,
  },
});
