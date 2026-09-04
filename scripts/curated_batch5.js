const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const curated = {
  "What is the drug of choice for preventing postpartum hemorrhage?": {
    "Paracetamol": "Paracetamol for fever relief",
    "Amoxicillin": "Amoxicillin for infection",
    "Ibuprofen": "Ibuprofen for mild pain"
  },
  "Loading dose is calculated using:": {
    "Clearance and Css": "Clearance and steady-state concentration",
    "Only half-life": "Considering only the drug half-life",
    "Only body weight": "Considering only the patient's weight"
  },
  "What is the primary function of hemoglobin?": {
    "Blood clotting": "Blood clotting in injured vessels",
    "Fighting infection": "Fighting bacterial infections",
    "Hormone transport": "Transporting hormones in blood"
  },
  "What is a lead compound?": {
    "A heavy metal compound": "A heavy metal compound like lead oxide",
    "A final drug product": "A final drug product ready for market",
    "An inactive compound": "An inactive compound with no activity"
  },
  "What is safety stock in inventory management?": {
    "Drugs stored in a safe": "Drugs stored in a locked safe",
    "A locked storeroom": "A locked storeroom for controlled drugs",
    "Drugs for emergency use only": "Drugs reserved for emergency use only"
  },
  "What is NAPQI?": {
    "A brand of paracetamol": "A brand name of paracetamol tablets",
    "A type of painkiller": "A type of over-the-counter painkiller",
    "An excipient": "An excipient used in tablet manufacturing"
  },
  "What is the Claisen condensation?": {
    "Condensation of two alcohols": "Condensation of two alcohol molecules",
    "Condensation of an acid and amine": "Condensation of an acid and an amine",
    "A reduction reaction": "A reduction reaction of a ketone"
  },
  "Market segmentation involves:": {
    "Selling to everyone": "Selling the product to everyone alike",
    "Increasing prices": "Increasing the product price",
    "Reducing product quality": "Reducing the product quality"
  },
  "What is a buffer solution?": {
    "A solution that changes pH easily": "A solution whose pH changes very easily",
    "A pure water solution": "A solution of pure distilled water",
    "A highly acidic solution": "A solution that is highly acidic"
  },
  "Methylparaben is classified as:": {
    "Antioxidant": "Antioxidant preventing oxidation",
    "Buffer": "Buffer maintaining the pH",
    "Surfactant": "Surfactant reducing surface tension"
  },
  "What is medication reconciliation?": {
    "Reordering drugs from suppliers": "Reordering drugs from the suppliers",
    "Counting pills in bottles": "Counting the pills present in bottles",
    "Updating drug prices": "Updating the drug price lists"
  },
  "What are proteins made of?": {
    "Fatty acids": "Fatty acids and glycerol",
    "Nucleotides": "Nucleotides and bases",
    "Monosaccharides": "Monosaccharide sugar units"
  },
  "Zinc oxide is used as:": {
    "Internal antiseptic": "Internal antiseptic for gut infections",
    "Analgesic": "Analgesic for mild pain relief",
    "Laxative": "Laxative for constipation"
  },
  "What is a functional group interconversion (FGI)?": {
    "Changing drug brand": "Changing the brand of a drug",
    "Changing drug dose": "Changing the dose of a drug",
    "Changing drug form": "Changing the dosage form of a drug"
  },
  "What is binary fission?": {
    "Sexual reproduction in bacteria": "Sexual reproduction in bacterial cells",
    "Viral replication": "Replication cycle of viruses",
    "Spore formation": "Formation of bacterial spores"
  },
  "HLB (Hydrophilic-Lipophilic Balance) value helps in:": {
    "Measuring viscosity": "Measuring the viscosity of liquids",
    "Measuring pH": "Measuring the pH of a solution",
    "Measuring particle size": "Measuring the particle size of powders"
  },
  "What is the condensation reaction between an amine and a carboxylic acid?": {
    "Esterification": "Esterification of an alcohol and acid",
    "Aldol condensation": "Aldol condensation of two aldehydes",
    "Michael addition": "Michael addition to an alkene"
  },
  "Aluminum hydroxide gel is classified as:": {
    "Laxative": "Laxative for constipation",
    "Antiemetic": "Antiemetic for nausea",
    "Analgesic": "Analgesic for mild pain"
  },
  "What is HIV?": {
    "A bacterium that causes AIDS": "A bacterium that causes the disease AIDS",
    "A type of fungus": "A type of fungus infecting the skin",
    "A parasite": "A parasite found in blood"
  },
  "What is the primary treatment for cholera?": {
    "Antibiotics first": "Antibiotics given as the first treatment",
    "Surgery": "Surgery to remove the infected tissue",
    "Vaccination": "Vaccination given before exposure"
  },
  "What is the mechanism of action of insulin glargine?": {
    "Short-acting insulin": "Short-acting insulin for meal time",
    "An oral insulin": "An oral insulin taken daily",
    "A rapid-acting analog": "A rapid-acting insulin analog"
  },
  "What is the Kirby-Baker-Bauer method?": null,
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
    const ci = typeof q.correct_index === 'number' ? q.correct_index : (q.correct_option ? { a: 0, b: 1, c: 2, d: 3 }[q.correct_option] || 0 : 0);

    entries.forEach(([key, text]) => {
      if (typeof text !== 'string') return;
      const idx = typeof key === 'number' ? key : { a: 0, b: 1, c: 2, d: 3 }[key];
      if (idx === ci) return;
      const trimmed = text.trim();
      const replacement = fix[trimmed];
      if (replacement === undefined) return;
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

console.log('Fixed:', fixed, '| Mismatches:', mismatches);