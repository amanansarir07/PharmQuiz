const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

let shortened = 0;
let expanded = 0;
let expandedWrong = 0;

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;

  data.forEach(q => {
    let opts = q.options;
    let options = Array.isArray(opts) ? opts.map(o => typeof o === 'string' ? o : o.text || '') : Object.values(opts);
    if (options.length < 2) return;

    let ci = typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? {a:0,b:1,c:2,d:3}[q.correct_option] || 0 : 0);
    const lens = options.map(o => o.length);
    const correctLen = lens[ci];
    const maxWrong = Math.max(...lens.filter((_, i) => i !== ci));
    const avgWrong = lens.filter((_, i) => i !== ci).reduce((a, b) => a + b, 0) / (options.length - 1);

    // === PHASE 1: Shorten correct option if much longer than longest wrong ===
    if (correctLen > maxWrong * 1.35) {
      let newCorrect = options[ci];
      let extras = [];

      // Remove parenthetical content
      const brackets = [...newCorrect.matchAll(/\s*\(([^)]+)\)/g)];
      brackets.forEach(m => {
        extras.push(m[1]);
        newCorrect = newCorrect.replace(m[0], '').trim();
      });

      // Target length: just above longest wrong
      const target = Math.round(maxWrong * 1.1);

      // If still too long, drop trailing comma-separated segments
      if (newCorrect.length > target) {
        const parts = newCorrect.split(/,\s*/);
        if (parts.length > 2) {
          while (parts.length > 2 && parts.join(', ').length > target) {
            extras.push(parts.pop().trim());
          }
          newCorrect = parts.join(', ');
        }
      }

      // If still too long, drop "including/e.g./such as" tails
      if (newCorrect.length > target) {
        const listMatch = newCorrect.match(/,\s*(including|e\.g\.|such as|for example)\s+.+$/i);
        if (listMatch) {
          extras.push(listMatch[0].replace(/^,\s*/, ''));
          newCorrect = newCorrect.replace(/,\s*(including|e\.g\.|such as|for example)\s+.+$/i, '').trim();
        }
      }

      // If still too long, cut the last sentence fragment
      if (newCorrect.length > target * 1.4) {
        const parts = newCorrect.split(/(?<=[.;:])\s+/);
        if (parts.length > 1) {
          extras.push(parts.pop().trim());
          newCorrect = parts.join(' ').trim();
        }
      }

      if (newCorrect !== options[ci] && newCorrect.length >= 5) {
        if (Array.isArray(opts)) {
          if (typeof opts[ci] === 'string') opts[ci] = newCorrect;
          else opts[ci].text = newCorrect;
        } else {
          const keys = Object.keys(opts);
          opts[keys[ci]] = newCorrect;
        }
        if (extras.length > 0) {
          const note = extras.filter(Boolean).join('; ');
          if (q.explanation) {
            if (!q.explanation.includes(note.substring(0, 40))) {
              q.explanation = q.explanation.trim() + `\n\nNote: ${note}`;
            }
          } else {
            q.explanation = `Note: ${note}`;
          }
        }
        changed = true;
        shortened++;
      }
    }

    // === PHASE 2: Expand short wrong options so they look like real distractors ===
    // Re-read current state
    options = Array.isArray(opts) ? opts.map(o => typeof o === 'string' ? o : o.text || '') : Object.values(opts);
    ci = typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? {a:0,b:1,c:2,d:3}[q.correct_option] || 0 : 0);
    const lens2 = options.map(o => o.length);
    const maxLen = Math.max(...lens2);
    const minLen = Math.min(...lens2);

    // Only expand when there's a real gap AND the shortest is very short
    if (maxLen > 18 && minLen < maxLen * 0.45) {
      const shortThreshold = Math.max(8, Math.round(maxLen * 0.55));
      options.forEach((text, i) => {
        if (i === ci) return; // don't touch correct
        if (text.length >= shortThreshold) return;

        let expandedText = null;
        const t = text.trim();

        // Pattern 1: "Only X" -> "Considering only X ..."
        if (/^only\s+(.+)$/i.test(t)) {
          const x = t.replace(/^only\s+/i, '');
          expandedText = `Considering only ${x.toLowerCase()}`;
        }
        // Pattern 2: bare single concept -> add "in this context"
        else if (/^[a-z][a-z\s-]{1,25}$/i.test(t) && t.split(' ').length <= 3 && !/\d/.test(t)) {
          // Common pharma-y qualifiers that keep the option WRONG but plausible
          const qualifiers = [
            'in this context',
            'in clinical practice',
            'as the primary factor',
            'under standard conditions',
          ];
          expandedText = `${t} ${qualifiers[0]}`;
        }
        // Pattern 3: numbers/durations -> prefix "About"
        else if (/^(about\s+)?(\d+[-\s]?(months?|days?|weeks?|years?|hours?|mg|ml|%|mm|µg|g))$/i.test(t)) {
          expandedText = `About ${t.toLowerCase().replace(/^about\s+/i, '')}`;
        }

        if (expandedText && expandedText !== text) {
          if (Array.isArray(opts)) {
            if (typeof opts[i] === 'string') opts[i] = expandedText;
            else opts[i].text = expandedText;
          } else {
            const keys = Object.keys(opts);
            opts[keys[i]] = expandedText;
          }
          changed = true;
          expandedWrong++;
        }
      });
    }
  });

  if (changed) fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

console.log('Shortened correct options:', shortened);
console.log('Expanded wrong options:', expandedWrong);