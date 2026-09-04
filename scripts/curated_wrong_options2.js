const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

// Map: question_text -> { oldText: newText } for WRONG options only
const curated = {
  "Fluconazole is effective against:": {
    "Bacteria": "Bacteria causing skin infections",
    "Viruses": "Viruses causing influenza",
    "Parasites": "Parasites causing malaria"
  },
  "The purpose of a fractionating column in fractional distillation is to:": {
    "Cool the vapor": "Cool the vapor to liquid form",
    "Heat the mixture": "Heat the mixture to boiling point",
    "Filter impurities": "Filter insoluble impurities from the mixture"
  },
  "What is the Robinson annulation?": {
    "A simple condensation": "A simple condensation of two esters",
    "A reduction reaction": "A reduction reaction of a ketone",
    "An oxidation reaction": "An oxidation reaction of an alcohol"
  },
  "Calcium gluconate is used for:": {
    "Hypertension": "Hypertension in elderly patients",
    "Diabetes": "Diabetes mellitus management",
    "Asthma": "Asthma in young children"
  },
  "What is the antidote for digoxin toxicity?": {
    "Atropine only": "Atropine to raise the heart rate",
    "N-acetylcysteine": "N-acetylcysteine for paracetamol overdose",
    "Vitamin K": "Vitamin K to reverse warfarin effect"
  },
  "What is a Michael acceptor in drug chemistry?": {
    "A type of receptor": "A type of receptor on cell membranes",
    "An enzyme inhibitor": "An enzyme inhibitor of cytochrome P450",
    "A drug metabolite": "A drug metabolite formed in the liver"
  },
  "What is chirality in drug molecules?": {
    "Drug color": "Drug color in solution",
    "Drug solubility": "Drug solubility in water",
    "Drug stability": "Drug stability at room temperature"
  },
  "The 'rebound acid hypersecretion' phenomenon is associated with:": {
    "PPIs": "PPIs when taken regularly",
    "Antacids": "Antacids on an empty stomach",
    "Prokinetics": "Prokinetics in diabetic patients"
  },
  "What is a carbonyl group?": {
    "-OH group": "-OH group of an alcohol",
    "-NH2 group": "-NH2 group of an amine",
    "-COOH group": "-COOH group of a carboxylic acid"
  },
  "What is the Vilsmeier-Haack reaction?": {
    "A hydrolysis reaction": "A hydrolysis reaction of an ester",
    "An oxidation reaction": "An oxidation reaction of an alcohol",
    "A reduction reaction": "A reduction reaction of a nitro group"
  },
  "Bethanechol is a muscarinic agonist used for:": {
    "Hypertension": "Hypertension in elderly patients",
    "Asthma": "Asthma in young children",
    "Migraine": "Migraine in adult patients"
  },
  "What is a minor ailment management by pharmacists?": {
    "Treating serious diseases": "Treating serious diseases in hospitals",
    "Performing surgery": "Performing minor surgical procedures",
    "Giving injections only": "Giving injections to all patients"
  },
  "Tyndallization involves:": {
    "Single autoclaving": "Single autoclaving at 121°C",
    "Dry heat sterilization": "Dry heat sterilization in an oven",
    "Chemical sterilization": "Chemical sterilization with ethylene oxide"
  },
  "What is a bacterium?": {
    "A virus": "A virus with protein coat",
    "A type of fungus": "A type of fungus with hyphae",
    "A type of parasite": "A type of parasite in blood"
  },
  "What is the general structure of a sulfonamide drug?": {
    "Ar-SO2-NH-R": "Ar-SO2-NH-R with a metal salt",
    "Ar-COOH": "Ar-COOH with a free acid group",
    "Ar-OH": "Ar-OH with a phenolic group"
  },
  "What is the Kirby-Bauer disk diffusion method?": {
    "A method to count bacteria": "A method to count bacteria in a sample",
    "A method to grow bacteria": "A method to grow bacteria on agar",
    "A method to stain bacteria": "A method to stain bacteria for microscopy"
  },
  "Lactulose is used for:": {
    "Hypertension": "Hypertension in elderly patients",
    "Asthma": "Asthma in young children",
    "Diabetes": "Diabetes mellitus management"
  },
  "What is a health education?": {
    "Medical school curriculum": "Medical school curriculum for doctors",
    "Teaching pharmacology": "Teaching pharmacology to pharmacy students",
    "Training pharmacists": "Training pharmacists in dispensing"
  },
  "What is the Beilstein test?": {
    "Test for nitrogen": "Test for nitrogen in amino acids",
    "Test for oxygen": "Test for oxygen in alcohols",
    "Test for sulfur": "Test for sulfur in thiols"
  },
  "Acacia (gum arabic) is primarily used as:": {
    "Laxative": "Laxative for constipation",
    "Analgesic": "Analgesic for mild pain",
    "Antiseptic": "Antiseptic for wound cleaning"
  },
  "Tragacanth is used as:": {
    "Purgative": "Purgative for bowel evacuation",
    "Antiseptic": "Antiseptic for skin infections",
    "Analgesic": "Analgesic for mild pain"
  },
  "Metoclopramide acts as:": {
    "Antacid": "Antacid for gastric acidity",
    "PPI": "PPI for acid suppression",
    "H2 blocker": "H2 blocker for peptic ulcer"
  },
  "What is the Cannizzaro reaction?": {
    "Oxidation of alcohols": "Oxidation of primary alcohols",
    "Reduction of ketones": "Reduction of ketones to alcohols",
    "Condensation of esters": "Condensation of esters with amines"
  },
  "What is the mechanism of action of warfarin in detail?": {
    "Blocking thrombin directly": "Blocking thrombin directly in the blood",
    "Inhibiting platelet COX-1": "Inhibiting platelet COX-1 enzyme",
    "Activating antithrombin III": "Activating antithrombin III in plasma"
  },
  "Vitamin D deficiency causes:": {
    "Scurvy": "Scurvy from vitamin C deficiency",
    "Beriberi": "Beriberi from thiamine deficiency",
    "Night blindness": "Night blindness from vitamin A deficiency"
  },
  "What is antiretroviral therapy (ART) for HIV?": {
    "A single antibiotic": "A single antibiotic for bacterial infection",
    "A vaccine for HIV": "A vaccine for HIV prevention",
    "A type of surgery": "A type of surgery for immune disorders"
  },
  "What is the mechanism of action of insulin glargine?": {
    "Short-acting insulin": "Short-acting insulin for meal coverage",
    "An oral insulin": "An oral insulin taken with food",
    "A rapid-acting analog": "A rapid-acting analog for post-meal spikes"
  },
  "What is the general structure of a sulfonamide antibiotic?": {
    "R-SO2-NH-R' with sulfur in the ring": "R-SO2-NH-R' with sulfur in the ring structure",
    "R-COOH with free carboxylic acid": "R-COOH with a free carboxylic acid group",
    "R-NH2 only without any sulfonyl group": "R-NH2 only without any sulfonyl group present"
  },
  "Clove is obtained from:": {
    "Roots of the mature tree": "Roots of the mature tree bark",
    "Leaves of the young plant": "Leaves of the young plant stems",
    "Seeds after full ripening": "Seeds after full ripening of fruit"
  },
  "Cinnamon is obtained from:": {
    "Root of the mature tree": "Root of the mature tree bark",
    "Leaves of the young plant": "Leaves of the young plant stems",
    "Seeds after full ripening": "Seeds after full ripening of fruit"
  },
  "What is the most common cause of nosocomial infections?": {
    "Viruses transmitted by blood": "Viruses transmitted by blood transfusion",
    "Fungi from contaminated food": "Fungi from contaminated food sources",
    "Parasites in drinking water": "Parasites in contaminated drinking water"
  },
  "Magnesium trisilicate is used as:": {
    "Laxative with rapid action": "Laxative with rapid cathartic action",
    "Diuretic with potassium loss": "Diuretic with potassium wasting effect",
    "Analgesic for mild pain": "Analgesic for mild to moderate pain"
  },
  "Light kaolin is used as:": {
    "Laxative with rapid action": "Laxative with rapid cathartic action",
    "Antacid with immediate relief": "Antacid with immediate acid neutralization",
    "Analgesic for mild pain": "Analgesic for mild to moderate pain"
  },
  "Silver nitrate is used as:": {
    "Antacid for gastric acidity": "Antacid for gastric hyperacidity",
    "Laxative for constipation": "Laxative for chronic constipation",
    "Diuretic for fluid retention": "Diuretic for fluid retention states"
  },
  "What is a functional group in organic chemistry?": {
    "A group of atoms with fixed mass": "A group of atoms with a fixed atomic mass",
    "A type of atom with fixed charge": "A type of atom with a fixed ionic charge",
    "A chemical bond between two atoms": "A chemical bond between two carbon atoms"
  },
  "What is the vaccine vial monitor (VVM)?": {
    "A syringe with a built-in needle": "A syringe with a built-in safety needle",
    "A thermometer for room temperature": "A thermometer for measuring room temperature",
    "A storage box for vaccine transport": "A storage box for vaccine cold chain transport"
  },
  "What is the target HbA1c in diabetic patients?": {
    "<6% for pregnant women": "<6% for pregnant women with diabetes",
    "<10% for elderly patients": "<10% for elderly frail patients",
    "<5% for all diabetics": "<5% for all diabetic patients"
  },
  "Cyclone separator works on the principle of:": {
    "Filtration through a fine mesh": "Filtration through a fine mesh screen",
    "Evaporation of the liquid phase": "Evaporation of the liquid phase under vacuum",
    "Distillation of the volatile fraction": "Distillation of the volatile liquid fraction"
  },
  "What is the Grignard reagent?": {
    "An acid with a carboxyl group": "An acid with a carboxyl functional group",
    "A base with a hydroxyl group": "A base with a hydroxyl functional group",
    "A catalyst for esterification": "A catalyst used for esterification reactions"
  },
  "How many essential amino acids are there for humans?": {
    "5 for infants only": "5 for infants in the first year",
    "20 for all age groups": "20 for all age groups equally",
    "15 in adults": "15 in healthy adults only"
  },
  "What is the Rf value in TLC?": {
    "Reflection factor of the plate surface": "Reflection factor of the plate surface area",
    "Recovery factor of the applied sample": "Recovery factor of the applied sample volume",
    "Retention factor measured in HPLC columns": "Retention factor measured in HPLC columns only"
  },
  "What is Ready-to-Use Therapeutic Food (RUTF)?": {
    "Intravenous nutrition for hospital patients": "Intravenous nutrition given to hospital patients",
    "Baby formula for infants under one year": "Baby formula for infants under one year of age",
    "Vitamin tablet for daily supplementation": "Vitamin tablet for routine daily supplementation"
  },
  "What is diazepam's chemical classification?": {
    "Barbiturate with sedative action": "Barbiturate with marked sedative action",
    "Phenothiazine with antipsychotic action": "Phenothiazine with antipsychotic action profile",
    "Imidazopyridine with hypnotic action": "Imidazopyridine with hypnotic action profile"
  },
  "What is narcotic drug as defined legally?": {
    "Any painkiller sold without prescription": "Any painkiller sold without a prescription",
    "Any antibiotic used for infections": "Any antibiotic used for bacterial infections",
    "Any sedative available in pharmacies": "Any sedative available in retail pharmacies"
  },
  "What is the main function of cholesterol?": {
    "Energy storage in adipose tissue": "Energy storage in adipose tissue stores",
    "Oxygen transport in red blood cells": "Oxygen transport in red blood cells by hemoglobin",
    "DNA synthesis in the nucleus": "DNA synthesis in the cell nucleus"
  },
  "What is the mechanism of action of salbutamol at the molecular level?": {
    "Blocking M3 receptors on bronchial muscle": "Blocking M3 receptors on bronchial smooth muscle",
    "Blocking H1 receptors on mast cells": "Blocking H1 receptors on mast cell surfaces",
    "Inhibiting PDE3 to raise cAMP slowly": "Inhibiting PDE3 to raise cAMP within cells"
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
      if (idx === q.correct_index || (q.correct_option && String.fromCharCode(97 + ({ a: 0, b: 1, c: 2, d: 3 }[key] ?? idx)) === q.correct_option)) {
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