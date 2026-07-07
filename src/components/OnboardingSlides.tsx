import { useCallback, useRef, useState } from 'react';
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
const HERO_GLYPH_SIZE = 150;
const TITLE_SIZE = 23;
const TITLE_MARGIN_TOP = 44;
const SUBTITLE_SIZE = 15;
const SKIP_TEXT_SIZE = 14;
const CTA_HEIGHT = 56;
const CTA_RADIUS = 16;
const CTA_KOREAN_SIZE = 16;
const CTA_ENGLISH_SIZE = 14;
const CTA_ENGLISH_OPACITY = 0.65;
const DOT_SIZE = 7;
const DOT_ACTIVE_WIDTH = 22;
const DOT_RADIUS = 4;
const DOT_SPACING = 7;
const LAST_SLIDE_INDEX = 2;

// --- Slide content ---

interface SlideContent {
  readonly key: string;
  readonly glyph: string;
  readonly isGlyphAccent: boolean;
  readonly title: string;
  readonly subtitle: string;
}

const SLIDES: readonly SlideContent[] = [
  {
    key: 'learn',
    glyph: '가',
    isGlyphAccent: false,
    title: '24개의 글자, 하나씩',
    subtitle: 'Read Hangul — one letter at a time.',
  },
  {
    key: 'build',
    glyph: '한',
    isGlyphAccent: true,
    title: '자모를 모아 한 글자로',
    subtitle: 'Combine 자모 into living syllables.',
  },
  {
    key: 'quiz',
    glyph: '참',
    isGlyphAccent: false,
    title: '퀴즈로 확실하게',
    subtitle: 'Lock it in with quick quizzes.',
  },
];

// --- Sub-components ---

interface SlideProps {
  readonly slide: SlideContent;
  readonly width: number;
  readonly isDark: boolean;
}

function Slide({ slide, width, isDark }: SlideProps): React.JSX.Element {
  const textColor = isDark ? COLORS.darkText : COLORS.lightText;
  const accentColor = isDark ? COLORS.darkTeal : COLORS.teal;
  const glyphColor = slide.isGlyphAccent ? accentColor : textColor;

  return (
    <View style={[styles.slide, { width }]}>
      <Text
        style={[styles.heroGlyph, { color: glyphColor }]}
        accessibilityRole="image"
        accessibilityLabel={`Illustration glyph: ${slide.glyph}`}
      >
        {slide.glyph}
      </Text>
      <Text style={[styles.slideTitle, { color: textColor }]}>{slide.title}</Text>
      <Text
        style={[
          styles.slideSubtitle,
          { color: isDark ? COLORS.darkMutedText : COLORS.mutedText },
        ]}
      >
        {slide.subtitle}
      </Text>
    </View>
  );
}

interface PageDotsProps {
  readonly count: number;
  readonly currentIndex: number;
  readonly isDark: boolean;
}

function PageDots({ count, currentIndex, isDark }: PageDotsProps): React.JSX.Element {
  const activeColor = isDark ? COLORS.darkBlue : COLORS.primaryBlue;
  const inactiveColor = isDark ? COLORS.darkBorder : COLORS.borderStrong;

  return (
    <View
      style={styles.dotsRow}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Slide ${currentIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === currentIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : null,
              { backgroundColor: isActive ? activeColor : inactiveColor },
            ]}
          />
        );
      })}
    </View>
  );
}

interface BottomButtonProps {
  readonly isLastSlide: boolean;
  readonly isDark: boolean;
  readonly onNext: () => void;
  readonly onStart: () => void;
}

function BottomButton({ isLastSlide, isDark, onNext, onStart }: BottomButtonProps): React.JSX.Element {
  const backgroundColor = isDark ? COLORS.darkBlue : COLORS.primaryBlue;
  const textColor = isDark ? COLORS.darkBackground : COLORS.lightBackground;

  if (isLastSlide) {
    return (
      <Pressable
        testID="onboarding-start-button"
        onPress={onStart}
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor, opacity: pressed ? 0.8 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Get started"
      >
        <Text style={[styles.ctaKorean, { color: textColor }]}>시작하기</Text>
        <Text style={[styles.ctaEnglish, { color: textColor }]}> Get started</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      testID="onboarding-next-button"
      onPress={onNext}
      style={({ pressed }) => [
        styles.ctaButton,
        { backgroundColor, opacity: pressed ? 0.8 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Next slide"
    >
      <Text style={[styles.ctaKorean, { color: textColor }]}>다음</Text>
    </Pressable>
  );
}

// --- Main component ---

export function OnboardingSlides(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const scrollRef = useRef<ScrollView>(null);
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

  const handleNext = useCallback((): void => {
    const nextIndex = Math.min(currentIndex + 1, LAST_SLIDE_INDEX);
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setCurrentIndex(nextIndex);
  }, [currentIndex, width]);

  const isLastSlide = currentIndex === LAST_SLIDE_INDEX;
  const isSkipVisible = !isLastSlide;

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
          <Text
            style={[
              styles.skipText,
              { color: isDark ? COLORS.darkMutedText : COLORS.mutedText },
            ]}
          >
            건너뛰기
          </Text>
        </Pressable>
      ) : null}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        testID="onboarding-scroll"
      >
        {SLIDES.map((slide) => (
          <Slide key={slide.key} slide={slide} width={width} isDark={isDark} />
        ))}
      </ScrollView>
      <PageDots count={SLIDES.length} currentIndex={currentIndex} isDark={isDark} />
      <BottomButton
        isLastSlide={isLastSlide}
        isDark={isDark}
        onNext={handleNext}
        onStart={completeOnboarding}
      />
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
    fontWeight: '600',
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
    fontWeight: '500',
    lineHeight: HERO_GLYPH_SIZE + 40,
  },
  slideTitle: {
    fontSize: TITLE_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '900',
    lineHeight: TITLE_SIZE + 10,
    marginTop: TITLE_MARGIN_TOP,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: SUBTITLE_SIZE,
    lineHeight: SUBTITLE_SIZE + 8,
    marginTop: 10,
    textAlign: 'center',
  },
  ctaButton: {
    height: CTA_HEIGHT,
    borderRadius: CTA_RADIUS,
    marginHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaKorean: {
    fontSize: CTA_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
  },
  ctaEnglish: {
    fontSize: CTA_ENGLISH_SIZE,
    opacity: CTA_ENGLISH_OPACITY,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: DOT_SPACING,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_RADIUS,
  },
  dotActive: {
    width: DOT_ACTIVE_WIDTH,
  },
});
