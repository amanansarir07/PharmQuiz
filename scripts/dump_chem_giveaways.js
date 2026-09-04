const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/questions/pharmaceutical-chemistry-i.json', 'utf-8'));
const getOpts = q => Array.isArray(q.options) ? q.options : ['a', 'b', 'c', 'd'].map(k => q.options[k]);
const getCi = q => typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? { a: 0, b: 1, c: 2, d: 3 }[q.correct_option.toLowerCase()] : 0);

data.forEach((q, i) => {
  if (!q.unit_id) return;
  const o = getOpts(q);
  const ci = getCi(q);
  const c = String(o[ci]).length;
  const wm = Math.max(...o.map((x, j) => (j === ci ? 0 : String(x).length)));
  if (wm > 0 && c / wm >= 1.8) {
    console.log('\n### q' + i + ' [' + q.unit_id + '] ' + q.question_text);
    o.forEach((t, j) => console.log('   ' + (j === ci ? '>>' : '  ') + ' [' + 'abcd'[j] + '] ' + t + ' (' + String(t).length + ')'));
  }
});