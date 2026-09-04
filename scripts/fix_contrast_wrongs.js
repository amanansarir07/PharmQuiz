const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const curated = {
  "What is the antidote for warfarin toxicity?": {
    "Vitamin K only": "Vitamin K tablets only, at any dose",
    "Protamine sulfate": "Protamine sulfate for reversal",
    "N-acetylcysteine": "N-acetylcysteine given intravenously"
  },
  "What is the difference between endotoxins and exotoxins?": {
    "No difference": "No difference between the two toxins",
    "Exotoxins are more common": "Exotoxins are more common in practice",
    "Endotoxins are proteins": "Endotoxins are secreted proteins"
  },
  "What is the difference between selective and differential media?": {
    "No difference": "No difference between the two media types",
    "Selective media are liquid": "Selective media are always liquid",
    "Differential media kill bacteria": "Differential media kill all bacteria"
  },
  "What is the difference between Km and Vmax?": {
    "No difference": "No difference between the two values",
    "Km measures velocity": "Km measures the reaction velocity",
    "Vmax measures affinity": "Vmax measures enzyme-substrate affinity"
  },
  "What is the difference between epidemic and endemic?": {
    "No difference": "No difference between the two patterns",
    "Endemic is worse than epidemic": "Endemic is always worse than epidemic",
    "Epidemic is always deadly": "Epidemic is always a deadly disease"
  },
  "What is the difference between primary and secondary immune response?": {
    "No difference": "No difference between the two responses",
    "Primary is always stronger": "Primary response is always stronger",
    "Secondary produces IgM": "Secondary response produces only IgM"
  },
  "What is the difference between DVT and PE treatment?": {
    "Same treatment": "Exactly the same treatment for both",
    "DVT needs surgery, PE doesn't": "DVT needs surgery while PE does not",
    "PE doesn't need anticoagulation": "PE does not need any anticoagulation"
  },
  "What is the difference between sterilization and disinfection?": {
    "Same thing": "Both terms mean the same thing",
    "Disinfection is more complete": "Disinfection is more complete than sterilization",
    "Sterilization is only for surfaces": "Sterilization applies only to surfaces"
  },
  "What is the difference between a drug and a medicine?": {
    "No difference": "No difference between the two terms",
    "Medicine is always natural": "Medicine is always a natural product",
    "Drugs are always synthetic": "Drugs are always synthetic chemicals"
  },
  "What is the difference between Gram-positive and Gram-negative bacteria?": {
    "No difference": "No difference between the two groups",
    "Gram-positive are larger": "Gram-positive bacteria are always larger",
    "Gram-negative have no cell wall": "Gram-negative bacteria lack any cell wall"
  },
  "What is the difference between a drug's intrinsic activity and efficacy?": {
    "Same thing": "Both terms mean exactly the same thing",
    "Efficacy is always higher": "Efficacy is always the higher value",
    "Intrinsic activity measures potency": "Intrinsic activity is a measure of potency"
  },
  "What is the difference between affinity and potency?": {
    "Same thing": "Both terms mean exactly the same thing",
    "Potency measures binding": "Potency measures receptor binding strength",
    "Affinity measures clinical effect": "Affinity measures the clinical effect produced"
  },
  "What is the difference between ACE inhibitors and ARBs?": {
    "No difference": "No difference in their mechanisms",
    "ARBs are always better": "ARBs are always better clinically",
    "ACE inhibitors don't lower BP": "ACE inhibitors do not lower blood pressure"
  },
};

let fixed = 0;
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;
  data.forEach(q => {
    const qt = (q.question_text || '').trim();
    const fix = curated[qt];
    if (!fix) return;
    const opts = q.options;
    const entries = Array.isArray(opts) ? opts.map((o, i) => [i, o]) : Object.entries(opts);
    const ci = typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? { a: 0, b: 1, c: 2, d: 3 }[q.correct_option] || 0 : 0);
    entries.forEach(([key, o]) => {
      const text = typeof o === 'string' ? o : o.text;
      if (typeof text !== 'string') return;
      const idx = typeof key === 'number' ? key : { a: 0, b: 1, c: 2, d: 3 }[key];
      if (idx === ci) return;
      const replacement = fix[text.trim()];
      if (!replacement) return;
      if (Array.isArray(opts)) {
        if (typeof opts[idx] === 'string') opts[idx] = replacement;
        else opts[idx].text = replacement;
      } else {
        const keys = Object.keys(opts);
        opts[keys[idx]] = replacement;
      }
      changed = true;
      fixed++;
    });
  });
  if (changed) fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}
console.log('Fixed:', fixed);