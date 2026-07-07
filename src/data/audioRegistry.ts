// Static audio asset registry — Metro bundler requires static require() calls.
// Each key matches the audioFile field in jamo.ts.

import type { AudioSource } from 'expo-audio';

export const AUDIO_REGISTRY: Readonly<Record<string, AudioSource>> = {
  // Consonant pronunciations
  'giyeok.mp3': require('../../assets/audio/giyeok.mp3'),
  'nieun.mp3': require('../../assets/audio/nieun.mp3'),
  'digeut.mp3': require('../../assets/audio/digeut.mp3'),
  'rieul.mp3': require('../../assets/audio/rieul.mp3'),
  'mieum.mp3': require('../../assets/audio/mieum.mp3'),
  'bieup.mp3': require('../../assets/audio/bieup.mp3'),
  'siot.mp3': require('../../assets/audio/siot.mp3'),
  'ieung.mp3': require('../../assets/audio/ieung.mp3'),
  'jieut.mp3': require('../../assets/audio/jieut.mp3'),
  'chieut.mp3': require('../../assets/audio/chieut.mp3'),
  'kieuk.mp3': require('../../assets/audio/kieuk.mp3'),
  'tieut.mp3': require('../../assets/audio/tieut.mp3'),
  'pieup.mp3': require('../../assets/audio/pieup.mp3'),
  'hieut.mp3': require('../../assets/audio/hieut.mp3'),

  // Consonant example words
  'gabang.mp3': require('../../assets/audio/gabang.mp3'),
  'namu.mp3': require('../../assets/audio/namu.mp3'),
  'dari.mp3': require('../../assets/audio/dari.mp3'),
  'ramyeon.mp3': require('../../assets/audio/ramyeon.mp3'),
  'mul.mp3': require('../../assets/audio/mul.mp3'),
  'bada.mp3': require('../../assets/audio/bada.mp3'),
  'sagwa.mp3': require('../../assets/audio/sagwa.mp3'),
  'ai.mp3': require('../../assets/audio/ai.mp3'),
  'jadongcha.mp3': require('../../assets/audio/jadongcha.mp3'),
  'chingu.mp3': require('../../assets/audio/chingu.mp3'),
  'ko.mp3': require('../../assets/audio/ko.mp3'),
  'tokki.mp3': require('../../assets/audio/tokki.mp3'),
  'podo.mp3': require('../../assets/audio/podo.mp3'),
  'haneul.mp3': require('../../assets/audio/haneul.mp3'),

  // Vowel pronunciations
  'a.mp3': require('../../assets/audio/a.mp3'),
  'ae.mp3': require('../../assets/audio/ae.mp3'),
  'ya.mp3': require('../../assets/audio/ya.mp3'),
  'eo.mp3': require('../../assets/audio/eo.mp3'),
  'e.mp3': require('../../assets/audio/e.mp3'),
  'yeo.mp3': require('../../assets/audio/yeo.mp3'),
  'o.mp3': require('../../assets/audio/o.mp3'),
  'wa.mp3': require('../../assets/audio/wa.mp3'),
  'yo.mp3': require('../../assets/audio/yo.mp3'),
  'u.mp3': require('../../assets/audio/u.mp3'),
  'wo.mp3': require('../../assets/audio/wo.mp3'),
  'wi.mp3': require('../../assets/audio/wi.mp3'),
  'yu.mp3': require('../../assets/audio/yu.mp3'),
  'eu.mp3': require('../../assets/audio/eu.mp3'),
  'ui.mp3': require('../../assets/audio/ui.mp3'),
  'i.mp3': require('../../assets/audio/i.mp3'),

  // Vowel example words
  'agi.mp3': require('../../assets/audio/agi.mp3'),
  'aegi.mp3': require('../../assets/audio/aegi.mp3'),
  'yagu.mp3': require('../../assets/audio/yagu.mp3'),
  'eomeoni.mp3': require('../../assets/audio/eomeoni.mp3'),
  'eeokon.mp3': require('../../assets/audio/eeokon.mp3'),
  'yeoja.mp3': require('../../assets/audio/yeoja.mp3'),
  'ori.mp3': require('../../assets/audio/ori.mp3'),
  'gwail.mp3': require('../../assets/audio/gwail.mp3'),
  'yori.mp3': require('../../assets/audio/yori.mp3'),
  'uyu.mp3': require('../../assets/audio/uyu.mp3'),
  'byeongwon.mp3': require('../../assets/audio/byeongwon.mp3'),
  'wiheom.mp3': require('../../assets/audio/wiheom.mp3'),
  'yuri.mp3': require('../../assets/audio/yuri.mp3'),
  'eureun.mp3': require('../../assets/audio/eureun.mp3'),
  'uisa.mp3': require('../../assets/audio/uisa.mp3'),
  'ireum.mp3': require('../../assets/audio/ireum.mp3'),
} as const;
