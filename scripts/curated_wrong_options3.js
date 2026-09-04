const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

// Map: question_text -> { oldText: newText } for WRONG options only
const curated = {
  "What is β-lactamase?": {
    "An antibiotic": "An antibiotic from the penicillin class",
    "A type of bacteria": "A type of bacteria in the gut",
    "A type of virus": "A type of virus causing respiratory infections"
  },
  "Calcium carbonate is an:": {
    "Antiemetic": "Antiemetic for nausea",
    "Diuretic": "Diuretic for edema",
    "Laxative": "Laxative for constipation"
  },
  "Talc is used in pharmacy as:": {
    "Antiseptic": "Antiseptic for skin wounds",
    "Laxative": "Laxative for constipation",
    "Analgesic": "Analgesic for mild pain"
  },
  "What is a pharmacophore?": {
    "A drug overdose": "A drug overdose in the body",
    "A type of receptor": "A type of receptor on the cell",
    "A drug metabolite": "A drug metabolite in the liver"
  },
  "What is the primary treatment for cholera?": {
    "Antibiotics first": "Antibiotics given as first-line treatment",
    "Surgery": "Surgery to remove infected tissue",
    "Vaccination": "Vaccination before exposure"
  },
  "What is the Curtius rearrangement?": {
    "A rearrangement of alkenes": "A rearrangement of alkenes to cyclopropanes",
    "A condensation reaction": "A condensation reaction of two aldehydes",
    "A reduction reaction": "A reduction reaction of a nitro group"
  },
  "What is the therapeutic use of theophylline?": {
    "Treating hypertension": "Treating hypertension in adults",
    "Treating diabetes": "Treating diabetes mellitus",
    "Treating infections": "Treating bacterial infections"
  },
  "What is bioisosterism?": {
    "Same biology": "Same biology in different species",
    "Same biochemistry": "Same biochemistry of reactions",
    "Same organism": "Same organism in all studies"
  },
  "Resins are defined as:": {
    "Volatile oils": "Volatile oils from plants",
    "Fixed oils": "Fixed oils from seeds",
    "Glycosides": "Glycosides from barks"
  },
  "What is the major side effect of metformin?": {
    "Hypoglycemia": "Hypoglycemia after each dose",
    "Weight gain": "Weight gain on long-term use",
    "Hyperkalemia": "Hyperkalemia in kidney disease"
  },
  "What is podophyllotoxin used for?": {
    "Oral laxative": "Oral laxative for constipation",
    "Antimalarial": "Antimalarial for fever",
    "Antihypertensive": "Antihypertensive for blood pressure"
  },
  "Membrane filtration is used for:": {
    "Milling": "Milling of coarse powders",
    "Distillation": "Distillation of volatile liquids",
    "Crystallization": "Crystallization of saturated solutions"
  },
  "What are pili (fimbriae) on bacteria?": {
    "Flagella for movement": "Flagella used for bacterial movement",
    "Cell wall structures": "Cell wall structures for protection",
    "Internal organelles": "Internal organelles for energy production"
  },
  "What is a pharmaceutical patent?": {
    "A license to sell drugs": "A license to sell drugs in a country",
    "A prescription for drugs": "A prescription for drugs from a doctor",
    "A drug formulation method": "A drug formulation method used in production"
  },
  "What is a medication error?": {
    "A drug with side effects": "A drug with expected side effects",
    "A manufacturing defect": "A manufacturing defect in a batch",
    "A natural drug reaction": "A natural drug reaction in the body"
  },
  "What is a standard operating procedure (SOP)?": {
    "A casual guideline": "A casual guideline for staff",
    "A drug name": "A drug name in the formulary",
    "A type of prescription": "A type of prescription for controlled drugs"
  },
  "Identification test for iron involves:": {
    "Adding NaOH": "Adding NaOH to the solution",
    "Adding HCl": "Adding HCl to the solution",
    "Adding Na2CO3": "Adding Na2CO3 to the solution"
  },
  "Tray dryer is used for:": {
    "Filtration": "Filtration of suspensions",
    "Distillation": "Distillation of mixtures",
    "Milling": "Milling of granules"
  },
  "Carbamazepine is used for:": {
    "Depression": "Depression in adults",
    "Hypertension": "Hypertension in elderly",
    "Asthma": "Asthma in children"
  },
  "What is the Knoevenagel condensation?": {
    "A condensation of two acids": "A condensation of two carboxylic acids",
    "An oxidation reaction": "An oxidation reaction of an alcohol",
    "A hydrolysis reaction": "A hydrolysis reaction of an ester"
  },
  "What is Directly Observed Treatment Short-course (DOTS) for tuberculosis?": {
    "Self-medication at home": "Self-medication at home without supervision",
    "Treating TB with surgery": "Treating TB with surgical resection",
    "Using only herbal medicine": "Using only herbal medicine for TB"
  },
  "What is the clinical significance of metformin's effect on weight?": {
    "It causes weight gain": "It causes significant weight gain",
    "It has no effect on weight": "It has no effect on body weight",
    "It causes significant weight loss": "It causes significant weight loss in all patients"
  },
  "GERD (Gastroesophageal Reflux Disease) is primarily treated with:": {
    "Antibiotics": "Antibiotics for infection",
    "Analgesics": "Analgesics for pain",
    "Antihistamines": "Antihistamines for allergy"
  },
  "What is the Clark's occupancy theory?": {
    "How drugs occupy space": "How drugs occupy space in the body",
    "How cells occupy tissues": "How cells occupy tissues in organs",
    "A theory about drug storage": "A theory about drug storage conditions"
  },
  "Caffeine is a xanthine alkaloid obtained from:": {
    "Cinchona": "Cinchona bark extract",
    "Rauwolfia": "Rauwolfia serpentina roots",
    "Belladonna": "Belladonna leaves and roots"
  },
  "Haloperidol is primarily used for:": {
    "Depression": "Depression in adults",
    "Anxiety": "Anxiety in young adults",
    "Insomnia": "Insomnia in the elderly"
  },
  "Myrrh is a resin used as:": {
    "Laxative only": "Laxative for constipation only",
    "Analgesic": "Analgesic for mild pain",
    "Antimalarial": "Antimalarial for fever"
  },
  "What is the Integrated Management of Neonatal and Childhood Illness (IMNCI)?": {
    "A surgical program": "A surgical program for children",
    "A vaccination-only program": "A vaccination-only program for infants",
    "A nutrition program only": "A nutrition program only for mothers"
  },
  "What is the reorder level in inventory management?": {
    "Maximum stock level": "Maximum stock level allowed",
    "Minimum stock level": "Minimum stock level allowed",
    "Average stock level": "Average stock level over time"
  },
  "Food poisoning is caused by:": {
    "Eating too much": "Eating too much at one time",
    "Eating quickly": "Eating quickly without chewing",
    "Spicy food": "Spicy food on an empty stomach"
  },
};

let fixed = 0;
let mismatches = 0;

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;

  data.forEach(q => {
    const qt = (q.question_text || '').trim();
    const fix = curated[qt];
    if (!fix) return;

    const opts = q.options;
    const entries = Array.isArray(opts) ? opts.map((o, i) => [i, typeof o === 'string' ? o : o.text]) : Object.entries(opts);

    entries.forEach(([key, text]) => {
      if (typeof text !== 'string') return;
      const trimmed = text.trim();
      const replacement = fix[trimmed];
      if (replacement === undefined) return;
      const idx = typeof key === 'number' ? key : { a: 0, b: 1, c: 2, d: 3 }[key];
      const ci = typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? { a: 0, b: 1, c: 2, d: 3 }[q.correct_option] || 0 : 0);
      if (idx === ci) {
        console.log(`WARN: trying to edit CORRECT option [${qt}] ${trimmed}`);
        mismatches++;
        return;
      }
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

console.log('Fixed wrong options:', fixed);
console.log('Warnings:', mismatches);