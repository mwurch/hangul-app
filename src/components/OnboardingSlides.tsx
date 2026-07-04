import { useCallback, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { useSettingsStore } from '../store/settings.store';

// --- Constants ---

const KOREAN_FONT = 'NotoSansKR-Regular';
const HERO_GLYPH_SIZE = 96;
const SLIDE_TITLE_SIZE = 28;
const BODY_KOREAN_SIZE = 17;
const BODY_ENGLISH_SIZE = 14;
const SKIP_TEXT_SIZE = 15;
const START_KOREAN_SIZE = 28;
const START_ENGLISH_SIZE = 13;
const DOT_SIZE = 8;
const DOT_SPACING = 5;
const INACTIVE_DOT_OPACITY = 0.25;
const LAST_SLIDE_INDEX = 2;

// --- Slide content ---

interface SlideContent {
  readonly key: string;
  readonly glyph: string;
  readonly titleKorean: string;
  readonly titleEnglish: string;
  readonly bodyKorean: string;
  readonly bodyEnglish: string;
}

const SLIDES: readonly SlideContent[] = [
  {
    key: 'learn',
    glyph: 'ㅎ',
    titleKorean: '배우기',
    titleEnglish: 'Learn',
    bodyKorean: '한글 자모 24자를 카드로 익혀요',
    bodyEnglish: 'Learn the 24 Hangul letters',
  },
  {
    key: 'build',
    glyph: '한',
    titleKorean: '조합',
    titleEnglish: 'Build',
    bodyKorean: '자모를 조합해 음절을 만들어요',
    bodyEnglish: 'Combine letters into syllables',
  },
  {
    key: 'quiz',
    glyph: '?',
    titleKorean: '퀴즈',
    titleEnglish: 'Quiz',
    bodyKorean: '퀴즈로 복습하고 실력을 확인해요',
    bodyEnglish: 'Review with quizzes',
  },
];

// --- Sub-components ---

interface SlideProps {
  readonly slide: SlideContent;
  readonly width: number;
  readonly isDark: boolean;
  readonly isLast: boolean;
  readonly onStart: () => void;
}

function Slide({ slide, width, isDark, isLast, onStart }: SlideProps): React.JSX.Element {
  const textColor = isDark ? COLORS.darkText : COLORS.lightText;
  return (
    <View style={[styles.slide, { width }]}>
      <Text
        style={[styles.heroGlyph, { color: isDark ? COLORS.darkText : COLORS.primaryBlue }]}
        accessibilityRole="image"
        accessibilityLabel={`${slide.titleEnglish} icon: ${slide.glyph}`}
      >
        {slide.glyph}
      </Text>
      <Text style={[styles.slideTitle, { color: textColor }]}>
        {`${slide.titleKorean} / ${slide.titleEnglish}`}
      </Text>
      <Text style={[styles.bodyKorean, { color: textColor }]}>{slide.bodyKorean}</Text>
      <Text style={[styles.bodyEnglish, { color: COLORS.mutedText }]}>{slide.bodyEnglish}</Text>
      {isLast ? (
        <Pressable
          testID="onboarding-start-button"
          onPress={onStart}
          style={({ pressed }) => [styles.startButton, { opacity: pressed ? 0.8 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Get started"
        >
          <Text style={styles.startKorean}>시작하기</Text>
          <Text style={styles.startEnglish}>Get started</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface PageDotsProps {
  readonly count: number;
  readonly currentIndex: number;
  readonly isDark: boolean;
}

function PageDots({ count, currentIndex, isDark }: PageDotsProps): React.JSX.Element {
  const activeColor = isDark ? COLORS.darkText : COLORS.primaryBlue;
  return (
    <View
      style={styles.dotsRow}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Slide ${currentIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: activeColor,
              opacity: index === currentIndex ? 1 : INACTIVE_DOT_OPACITY,
            },
          ]}
        />
      ))}
    </View>
  );
}

// --- Main component ---

export function OnboardingSlides(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const pageWidth = event.nativeEvent.layoutMeasurement.width;
      if (pageWidth <= 0) {
        return;
      }
      const pageIndex = Math.round(offsetX / pageWidth);
      setCurrentIndex(Math.min(Math.max(pageIndex, 0), SLIDES.length - 1));
    },
    [],
  );

  const isSkipVisible = currentIndex < LAST_SLIDE_INDEX;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {isSkipVisible ? (
        <Pressable
          testID="onboarding-skip-button"
          onPress={completeOnboarding}
          style={({ pressed }) => [styles.skipButton, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={[styles.skipText, { color: COLORS.mutedText }]}>건너뛰기 / Skip</Text>
        </Pressable>
      ) : null}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        testID="onboarding-scroll"
      >
        {SLIDES.map((slide, index) => (
          <Slide
            key={slide.key}
            slide={slide}
            width={width}
            isDark={isDark}
            isLast={index === LAST_SLIDE_INDEX}
            onStart={completeOnboarding}
          />
        ))}
      </ScrollView>
      <PageDots count={SLIDES.length} currentIndex={currentIndex} isDark={isDark} />
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: SKIP_TEXT_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: SKIP_TEXT_SIZE + 8,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  heroGlyph: {
    fontSize: HERO_GLYPH_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: HERO_GLYPH_SIZE + 32,
  },
  slideTitle: {
    fontSize: SLIDE_TITLE_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
    lineHeight: SLIDE_TITLE_SIZE + 12,
    marginTop: 16,
  },
  bodyKorean: {
    fontSize: BODY_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: BODY_KOREAN_SIZE + 10,
    marginTop: 12,
    textAlign: 'center',
  },
  bodyEnglish: {
    fontSize: BODY_ENGLISH_SIZE,
    marginTop: 4,
    textAlign: 'center',
  },
  startButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 40,
  },
  startKorean: {
    fontSize: START_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: START_KOREAN_SIZE + 10,
    color: COLORS.lightBackground,
  },
  startEnglish: {
    fontSize: START_ENGLISH_SIZE,
    color: COLORS.lightBackground,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: DOT_SPACING,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
