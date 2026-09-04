const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const curated = {
  "What is chromatography in pharmacognosy?": {
    "Color measurement": "A method of measuring the color intensity of a sample",
    "A type of distillation": "A type of distillation for separating volatile liquids",
    "A type of extraction": "A type of extraction using a suitable solvent system"
  },
  "Planetary ball mill works by:": {
    "Only rotation": "Rotation of the mill chamber only",
    "Vibration only": "Vibration of the grinding chamber only",
    "Impact only": "Impact of falling balls only"
  },
  "What is a bioisostere?": {
    "A biological organism": "A biological organism used in drug testing",
    "A toxic metabolite": "A toxic metabolite formed during drug metabolism",
    "A drug excipient": "A drug excipient added for tablet binding"
  },
  "Brownian motion in colloids refers to:": {
    "Color change": "A color change in the colloidal dispersion",
    "Settling of particles": "Settling of particles under gravity over time",
    "Evaporation of solvent": "Evaporation of the dispersion medium slowly"
  },
  "What is Triphala?": {
    "A single herb": "A single herb used for digestion",
    "A mineral drug": "A mineral drug like zinc oxide",
    "An animal product": "An animal product like musk or honey"
  },
  "What is transduction in bacteria?": {
    "Transformation": "Transformation by uptake of free DNA",
    "Conjugation": "Conjugation through a sex pilus",
    "Spontaneous mutation": "Spontaneous mutation in the bacterial genome"
  },
  "What is the stepwise approach to COPD management?": {
    "Only bronchodilators": "Using bronchodilators at every stage only",
    "Start with oral steroids": "Start treatment with oral corticosteroids",
    "Start with antibiotics": "Start treatment with broad-spectrum antibiotics"
  },
  "What is the Gram stain technique?": {
    "A method to count bacteria": "A method used to count the number of bacteria",
    "A method to grow bacteria": "A method used to grow bacteria on culture media",
    "A method to kill bacteria": "A method used to kill bacteria with heat"
  },
  "What is pharmacotherapy?": {
    "Drug research": "Drug research in laboratory settings",
    "Drug pricing": "Drug pricing and market analysis",
    "Drug formulation": "Drug formulation in manufacturing plants"
  },
  "What is dual antiplatelet therapy (DAPT)?": {
    "Two anticoagulants": "Two anticoagulants given together daily",
    "Two antihypertensives": "Two antihypertensives for blood pressure control",
    "Two statins": "Two statins for cholesterol lowering"
  },
  "Analytical epidemiology:": {
    "Only observes": "Only observes disease patterns passively",
    "Only collects samples": "Only collects blood and tissue samples",
    "Only interviews": "Only interviews patients about symptoms"
  },
  "What is nosocomial (hospital-acquired) infection?": {
    "Infection present at admission": "Infection already present when the patient is admitted",
    "Infection from community": "Infection acquired from the community before admission",
    "Infection before surgery": "Infection contracted before a planned surgery"
  },
  "What is the significance of macroscopic and microscopic evaluation in pharmacognosy?": {
    "Only for education": "Only for the education of pharmacy students",
    "Only for chemical analysis": "Only for chemical analysis of active constituents",
    "Only for determining potency": "Only for determining the potency of the drug"
  },
  "What is water-soluble ash?": {
    "Ash that dissolves in water": "Ash that completely dissolves in water",
    "Ash that absorbs water": "Ash that absorbs moisture from the air",
    "Ash from water plants": "Ash obtained from aquatic water plants"
  },
  "What is bacterial conjugation?": {
    "Fusion of two bacteria": "Fusion of two bacterial cells into one",
    "Bacterial spore formation": "Bacterial spore formation under harsh conditions",
    "Bacterial binary fission": "Bacterial binary fission into two daughter cells"
  },
  "What are lipids?": {
    "Water-soluble biomolecules": "Water-soluble biomolecules stored in cells",
    "Proteins with lipid coats": "Proteins wrapped in protective lipid coats",
    "Carbohydrates with fat coatings": "Carbohydrates coated with fatty materials"
  },
  "What is the importance of drug information services in a hospital?": {
    "Only for pharmacists": "Only for the benefit of hospital pharmacists",
    "Promotes brand-name drugs": "Promotes brand-name drugs over generics",
    "Replaces clinical judgment": "Replaces the clinical judgment of doctors"
  },
  "What is the purpose of a drug interaction checker?": {
    "To count drug inventory": "To count the drugs in the pharmacy inventory",
    "To check drug expiry dates": "To check the expiry dates of stored drugs",
    "To verify drug authenticity": "To verify the authenticity of purchased drugs"
  },
  "Specific mortality rate measures deaths:": {
    "From all causes": "From all causes combined together",
    "Only in hospitals": "That occur only in hospital settings",
    "Only in urban areas": "That occur only in urban populations"
  },
};

let fixed = 0;
let skipped = 0;

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
    const ci = typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? { a: 0, b: 1, c: 2, d: 3 }[q.correct_option] || 0 : 0);

    entries.forEach(([key, text]) => {
      if (typeof text !== 'string') return;
      const idx = typeof key === 'number' ? key : { a: 0, b: 1, c: 2, d: 3 }[key];
      if (idx === ci) return;
      const trimmed = text.trim();
      const replacement = fix[trimmed];
      if (replacement === undefined) { skipped++; return; }
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

console.log('Fixed:', fixed, '| Not matched:', skipped);