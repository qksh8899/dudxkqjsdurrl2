const { engToKor, korToEng } = require('./converter');
const cases = [
  ['dkssudgktpdy', '안녕하세요'],
  ['Rkcl', '까치'],
  ['Tkfkd', '싸랑'],
  ['Qhdqhd', '뽕봉'],
  ['dlfrdj', '읽어'],
  ['rhkswjd', '관정'],
  ['dnjsgo', '원해'],
  ['dmlwk', '의자'],
  ['Ekfrl', '딸기'],
  ['tkfkdgo!', '사랑해!'],
  ['rkqt', '값'],
  ['rkqtdl', '값이'],
  ['ㅇ', 'ㅇ'],
  ['rrr', 'ㄱㄱㄱ'],
  ['zzz ㅋㅋ', 'ㅋㅋㅋ ㅋㅋ'],
  ['DKSSUD', '안녕'],
  ['gksrmf 123', '한글 123'],
];
let fail = 0;
for (const [i, exp] of cases) {
  const got = engToKor(i);
  const ok = got === exp;
  if (!ok) fail++;
  console.log(ok ? 'OK  ' : 'FAIL', i, '->', got, ok ? '' : `(expected ${exp})`);
}
console.log('reverse:', korToEng('안녕하세요 까치 값'));
console.log(fail ? `${fail} failed` : 'all passed');
