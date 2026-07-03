import { useCallback } from 'react';
import {
  FlatList,
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

const KEY_SIZE = 44;
const KEY_GAP = 8;
const NUM_COLUMNS = 7;
const GLYPH_SIZE = 24;

function JamoKey({
  char,
  onPress,
  isDark,
}: {
  readonly char: string;
  readonly onPress: (char: string) => void;
  readonly isDark: boolean;
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

  const keyExtractor = useCallback((item: string) => item, []);

  const renderItem = useCallback(
    ({ item }: { readonly item: string }) => (
      <JamoKey char={item} onPress={onSelect} isDark={isDark} />
    ),
    [onSelect, isDark],
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
    width: KEY_SIZE,
    height: KEY_SIZE,
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
