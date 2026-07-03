export interface Jamo {
  readonly char: string;
  readonly type: 'consonant' | 'vowel';
  readonly romanization: string;
  readonly koreanName: string;
  readonly audioFile: string;
  readonly exampleWord: {
    readonly korean: string;
    readonly english: string;
    readonly audioFile: string;
  };
  readonly mouthShape?: string;
}

export interface JamoProgress {
  readonly char: string;
  readonly seenCount: number;
  readonly correctCount: number;
  readonly lastSeen: number;
  readonly nextReview: number;
  readonly interval: number;
  readonly easeFactor: number;
}

export const DEFAULT_JAMO_PROGRESS: Readonly<Omit<JamoProgress, 'char'>> = {
  seenCount: 0,
  correctCount: 0,
  lastSeen: 0,
  nextReview: 0,
  interval: 0,
  easeFactor: 2.5,
} as const;

export const CONSONANTS: readonly Jamo[] = [
  {
    char: 'ㄱ',
    type: 'consonant',
    romanization: 'g/k',
    koreanName: '기역',
    audioFile: 'giyeok.mp3',
    exampleWord: {
      korean: '가방',
      english: 'bag',
      audioFile: 'gabang.mp3',
    },
  },
  {
    char: 'ㄴ',
    type: 'consonant',
    romanization: 'n',
    koreanName: '니은',
    audioFile: 'nieun.mp3',
    exampleWord: {
      korean: '나무',
      english: 'tree',
      audioFile: 'namu.mp3',
    },
  },
  {
    char: 'ㄷ',
    type: 'consonant',
    romanization: 'd/t',
    koreanName: '디귿',
    audioFile: 'digeut.mp3',
    exampleWord: {
      korean: '다리',
      english: 'bridge/leg',
      audioFile: 'dari.mp3',
    },
  },
  {
    char: 'ㄹ',
    type: 'consonant',
    romanization: 'r/l',
    koreanName: '리을',
    audioFile: 'rieul.mp3',
    exampleWord: {
      korean: '라면',
      english: 'ramen',
      audioFile: 'ramyeon.mp3',
    },
  },
  {
    char: 'ㅁ',
    type: 'consonant',
    romanization: 'm',
    koreanName: '미음',
    audioFile: 'mieum.mp3',
    exampleWord: {
      korean: '물',
      english: 'water',
      audioFile: 'mul.mp3',
    },
  },
  {
    char: 'ㅂ',
    type: 'consonant',
    romanization: 'b/p',
    koreanName: '비읍',
    audioFile: 'bieup.mp3',
    exampleWord: {
      korean: '바다',
      english: 'sea',
      audioFile: 'bada.mp3',
    },
  },
  {
    char: 'ㅅ',
    type: 'consonant',
    romanization: 's',
    koreanName: '시옷',
    audioFile: 'siot.mp3',
    exampleWord: {
      korean: '사과',
      english: 'apple',
      audioFile: 'sagwa.mp3',
    },
  },
  {
    char: 'ㅇ',
    type: 'consonant',
    romanization: 'ng/silent',
    koreanName: '이응',
    audioFile: 'ieung.mp3',
    exampleWord: {
      korean: '아이',
      english: 'child',
      audioFile: 'ai.mp3',
    },
  },
  {
    char: 'ㅈ',
    type: 'consonant',
    romanization: 'j',
    koreanName: '지읒',
    audioFile: 'jieut.mp3',
    exampleWord: {
      korean: '자동차',
      english: 'car',
      audioFile: 'jadongcha.mp3',
    },
  },
  {
    char: 'ㅊ',
    type: 'consonant',
    romanization: 'ch',
    koreanName: '치읓',
    audioFile: 'chieut.mp3',
    exampleWord: {
      korean: '친구',
      english: 'friend',
      audioFile: 'chingu.mp3',
    },
  },
  {
    char: 'ㅋ',
    type: 'consonant',
    romanization: 'k',
    koreanName: '키읔',
    audioFile: 'kieuk.mp3',
    exampleWord: {
      korean: '코',
      english: 'nose',
      audioFile: 'ko.mp3',
    },
  },
  {
    char: 'ㅌ',
    type: 'consonant',
    romanization: 't',
    koreanName: '티읕',
    audioFile: 'tieut.mp3',
    exampleWord: {
      korean: '토끼',
      english: 'rabbit',
      audioFile: 'tokki.mp3',
    },
  },
  {
    char: 'ㅍ',
    type: 'consonant',
    romanization: 'p',
    koreanName: '피읖',
    audioFile: 'pieup.mp3',
    exampleWord: {
      korean: '포도',
      english: 'grape',
      audioFile: 'podo.mp3',
    },
  },
  {
    char: 'ㅎ',
    type: 'consonant',
    romanization: 'h',
    koreanName: '히읗',
    audioFile: 'hieut.mp3',
    exampleWord: {
      korean: '하늘',
      english: 'sky',
      audioFile: 'haneul.mp3',
    },
  },
] as const;

export const VOWELS: readonly Jamo[] = [
  {
    char: 'ㅏ',
    type: 'vowel',
    romanization: 'a',
    koreanName: '아',
    audioFile: 'a.mp3',
    exampleWord: {
      korean: '아기',
      english: 'baby',
      audioFile: 'agi.mp3',
    },
  },
  {
    char: 'ㅐ',
    type: 'vowel',
    romanization: 'ae',
    koreanName: '애',
    audioFile: 'ae.mp3',
    exampleWord: {
      korean: '애기',
      english: 'baby (colloquial)',
      audioFile: 'aegi.mp3',
    },
  },
  {
    char: 'ㅔ',
    type: 'vowel',
    romanization: 'e',
    koreanName: '에',
    audioFile: 'e.mp3',
    exampleWord: {
      korean: '에어컨',
      english: 'air conditioner',
      audioFile: 'eeokon.mp3',
    },
  },
  {
    char: 'ㅕ',
    type: 'vowel',
    romanization: 'yeo',
    koreanName: '여',
    audioFile: 'yeo.mp3',
    exampleWord: {
      korean: '여자',
      english: 'woman',
      audioFile: 'yeoja.mp3',
    },
  },
  {
    char: 'ㅗ',
    type: 'vowel',
    romanization: 'o',
    koreanName: '오',
    audioFile: 'o.mp3',
    exampleWord: {
      korean: '오리',
      english: 'duck',
      audioFile: 'ori.mp3',
    },
  },
  {
    char: 'ㅛ',
    type: 'vowel',
    romanization: 'yo',
    koreanName: '요',
    audioFile: 'yo.mp3',
    exampleWord: {
      korean: '요리',
      english: 'cooking',
      audioFile: 'yori.mp3',
    },
  },
  {
    char: 'ㅜ',
    type: 'vowel',
    romanization: 'u',
    koreanName: '우',
    audioFile: 'u.mp3',
    exampleWord: {
      korean: '우유',
      english: 'milk',
      audioFile: 'uyu.mp3',
    },
  },
  {
    char: 'ㅟ',
    type: 'vowel',
    romanization: 'wi',
    koreanName: '위',
    audioFile: 'wi.mp3',
    exampleWord: {
      korean: '위험',
      english: 'danger',
      audioFile: 'wiheom.mp3',
    },
  },
  {
    char: 'ㅡ',
    type: 'vowel',
    romanization: 'eu',
    koreanName: '으',
    audioFile: 'eu.mp3',
    exampleWord: {
      korean: '으른',
      english: 'adult (colloquial)',
      audioFile: 'eureun.mp3',
    },
  },
  {
    char: 'ㅣ',
    type: 'vowel',
    romanization: 'i',
    koreanName: '이',
    audioFile: 'i.mp3',
    exampleWord: {
      korean: '이름',
      english: 'name',
      audioFile: 'ireum.mp3',
    },
  },
] as const;

export const ALL_JAMO: readonly Jamo[] = [...CONSONANTS, ...VOWELS] as const;
