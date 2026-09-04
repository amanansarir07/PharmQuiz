const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

// Map: question_text -> { index: newText } for wrong options to replace
// Only wrong options are replaced (never the correct answer)
const curated = {
  "How many essential amino acids are there for humans?": {
    old: { 0: "5", 2: "20", 3: "15" },
    new: { 0: "5 for infants only", 2: "20 for all age groups", 3: "15 in adults" }
  },
  "What is the most common cause of nosocomial infections?": {
    old: { 0: "Viruses", 2: "Fungi only", 3: "Parasites" },
    new: { 0: "Viruses transmitted by blood", 2: "Fungi from contaminated food", 3: "Parasites in drinking water" }
  },
  "Clove is obtained from:": {
    old: { 0: "Roots", 2: "Leaves", 3: "Seeds" },
    new: { 0: "Roots of the mature tree", 2: "Leaves of the young plant", 3: "Seeds after full ripening" }
  },
  "Cinnamon is obtained from:": {
    old: { 0: "Root", 2: "Leaves", 3: "Seeds" },
    new: { 0: "Root of the mature tree", 2: "Leaves of the young plant", 3: "Seeds after full ripening" }
  },
  "What is the Grignard reagent?": {
    old: { 0: "An acid", 2: "A base", 3: "A catalyst" },
    new: { 0: "An acid with a carboxyl group", 2: "A base with a hydroxyl group", 3: "A catalyst for esterification" }
  },
  "Cyclone separator works on the principle of:": {
    old: { 0: "Filtration", 2: "Evaporation", 3: "Distillation" },
    new: { 0: "Filtration through a fine mesh", 2: "Evaporation of the liquid phase", 3: "Distillation of the volatile fraction" }
  },
  "What is the target HbA1c in diabetic patients?": {
    old: { 0: "<6%", 2: "<10%", 3: "<5%" },
    new: { 0: "<6% for pregnant women", 2: "<10% for elderly patients", 3: "<5% for all diabetics" }
  },
  "What is the vaccine vial monitor (VVM)?": {
    old: { 0: "A syringe", 2: "A thermometer", 3: "A storage box" },
    new: { 0: "A syringe with a built-in needle", 2: "A thermometer for room temperature", 3: "A storage box for vaccine transport" }
  },
  "What is a functional group in organic chemistry?": {
    old: { 0: "A group of atoms", 2: "A type of atom", 3: "A chemical bond" },
    new: { 0: "A group of atoms with fixed mass", 2: "A type of atom with fixed charge", 3: "A chemical bond between two atoms" }
  },
  "Magnesium trisilicate is used as:": {
    old: { 0: "Laxative", 2: "Diuretic", 3: "Analgesic" },
    new: { 0: "Laxative with rapid action", 2: "Diuretic with potassium loss", 3: "Analgesic for mild pain" }
  },
  "Light kaolin is used as:": {
    old: { 0: "Laxative", 2: "Antacid", 3: "Analgesic" },
    new: { 0: "Laxative with rapid action", 2: "Antacid with immediate relief", 3: "Analgesic for mild pain" }
  },
  "What is narcotic drug as defined legally?": {
    old: { 0: "Any painkiller", 2: "Any antibiotic", 3: "Any sedative" },
    new: { 0: "Any painkiller sold without prescription", 2: "Any antibiotic used for infections", 3: "Any sedative available in pharmacies" }
  },
  "What is diazepam's chemical classification?": {
    old: { 0: "Barbiturate", 2: "Phenothiazine", 3: "Imidazopyridine" },
    new: { 0: "Barbiturate with sedative action", 2: "Phenothiazine with antipsychotic action", 3: "Imidazopyridine with hypnotic action" }
  },
  "What is the general structure of a sulfonamide antibiotic?": {
    old: { 0: "R-SO2-NH-R'", 2: "R-COOH", 3: "R-NH2 only" },
    new: { 0: "R-SO2-NH-R' with sulfur in the ring", 2: "R-COOH with free carboxylic acid", 3: "R-NH2 only without any sulfonyl group" }
  },
  "What is the main function of cholesterol?": {
    old: { 0: "Energy storage", 2: "Oxygen transport", 3: "DNA synthesis" },
    new: { 0: "Energy storage in adipose tissue", 2: "Oxygen transport in red blood cells", 3: "DNA synthesis in the nucleus" }
  },
  "Silver nitrate is used as:": {
    old: { 0: "Antacid", 2: "Laxative", 3: "Diuretic" },
    new: { 0: "Antacid for gastric acidity", 2: "Laxative for constipation", 3: "Diuretic for fluid retention" }
  },
  "What is the mechanism of action of salbutamol at the molecular level?": {
    old: { 0: "Blocking M3 receptors", 2: "Blocking H1 receptors", 3: "Inhibiting PDE3" },
    new: { 0: "Blocking M3 receptors on bronchial muscle", 2: "Blocking H1 receptors on mast cells", 3: "Inhibiting PDE3 to raise cAMP slowly" }
  },
  "What is the Rf value in TLC?": {
    old: { 1: "Reflection factor", 2: "Recovery factor", 3: "Retention factor in HPLC" },
    new: { 1: "Reflection factor of the plate surface", 2: "Recovery factor of the applied sample", 3: "Retention factor measured in HPLC columns" }
  },
  "What is Ready-to-Use Therapeutic Food (RUTF)?": {
    old: { 0: "Intravenous nutrition", 2: "Baby formula", 3: "Vitamin tablet" },
    new: { 0: "Intravenous nutrition for hospital patients", 2: "Baby formula for infants under one year", 3: "Vitamin tablet for daily supplementation" }
  },
};

let fixed = 0;
let matched = 0;

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
      const idx = typeof key === 'number' ? key : { a: 0, b: 1, c: 2, d: 3 }[key];
      const oldText = fix.old[idx];
      const newText = fix.new[idx];
      if (oldText === undefined || newText === undefined) return;
      if (typeof text !== 'string' || text.trim() !== oldText) {
        console.log(`SKIP mismatch [${qt}] option ${idx}: expected "${oldText}", got "${text}"`);
        return;
      }
      if (Array.isArray(opts)) {
        if (typeof opts[idx] === 'string') opts[idx] = newText;
        else opts[idx].text = newText;
      } else {
        const keys = Object.keys(opts);
        opts[keys[idx]] = newText;
      }
      changed = true;
      matched++;
      fixed++;
    });
  });

  if (changed) fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

console.log('Matched and fixed wrong options:', fixed);