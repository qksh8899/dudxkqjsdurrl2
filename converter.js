// 두벌식 자판 기준 영타 → 한글 변환기
const KEY_MAP = {
  q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
  a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
  z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',
  // Shift (쌍자음 / ㅒ ㅖ)
  Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ',
};

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const VOWEL_COMBO = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
};
const JONG_COMBO = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ',
};
const JONG_SPLIT = Object.fromEntries(Object.entries(JONG_COMBO).map(([k, v]) => [v, [k[0], k[1]]]));
const VOWEL_SPLIT = Object.fromEntries(Object.entries(VOWEL_COMBO).map(([k, v]) => [v, [k[0], k[1]]]));

const isVowel = (j) => JUNG.includes(j);

function toJamo(ch) {
  if (KEY_MAP[ch]) return KEY_MAP[ch];
  // Shift가 의미 없는 대문자(A, S, K...)는 실제 키보드처럼 소문자와 동일하게 처리
  const lower = ch.toLowerCase();
  if (ch !== lower && KEY_MAP[lower]) return KEY_MAP[lower];
  return null;
}

function engToKor(input) {
  let out = '';
  let cho = '', jung = '', jong = '';

  const flush = () => {
    if (cho && jung) {
      const code = 0xAC00 + (CHO.indexOf(cho) * 21 + JUNG.indexOf(jung)) * 28 + JONG.indexOf(jong);
      out += String.fromCharCode(code);
    } else {
      out += cho + jung + jong;
    }
    cho = jung = jong = '';
  };

  for (const ch of input) {
    const j = toJamo(ch);
    if (!j) { flush(); out += ch; continue; }

    if (!isVowel(j)) {
      // ── 자음 ──
      if (jong) {
        const combo = JONG_COMBO[jong + j];
        if (combo) jong = combo;
        else { flush(); cho = j; }
      } else if (jung) {
        if (cho && JONG.includes(j)) jong = j;      // ㄸ ㅃ ㅉ는 받침 불가
        else { flush(); cho = j; }
      } else if (cho) {
        flush(); cho = j;
      } else {
        cho = j;
      }
    } else {
      // ── 모음 ──
      if (jong) {
        // 받침이 다음 글자 초성으로 넘어감 (예: 각+ㅏ → 가가)
        let moved;
        if (JONG_SPLIT[jong]) { const [a, b] = JONG_SPLIT[jong]; jong = a; moved = b; }
        else { moved = jong; jong = ''; }
        flush();
        cho = moved; jung = j;
      } else if (jung) {
        const combo = VOWEL_COMBO[jung + j];
        if (combo) jung = combo;
        else { flush(); jung = j; }
      } else {
        jung = j;
      }
    }
  }
  flush();
  return out;
}

// ── 역변환: 한글 → 영타 ──
const REVERSE = Object.fromEntries(Object.entries(KEY_MAP).map(([k, v]) => [v, k]));
const jamoToKeys = (j) => {
  if (!j) return '';
  if (REVERSE[j]) return REVERSE[j];
  const parts = JONG_SPLIT[j] || VOWEL_SPLIT[j];
  return parts ? parts.map((p) => REVERSE[p]).join('') : j;
};

function korToEng(input) {
  let out = '';
  for (const ch of input) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const idx = code - 0xAC00;
      out += jamoToKeys(CHO[Math.floor(idx / 588)])
           + jamoToKeys(JUNG[Math.floor((idx % 588) / 28)])
           + jamoToKeys(JONG[idx % 28]);
    } else {
      out += jamoToKeys(ch);
    }
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { engToKor, korToEng };
