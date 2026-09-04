const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const curated = {
  "Steam distillation is used to extract:": {
    "Mineral salts": "Mineral salts from sea water",
    "Proteins": "Proteins from animal tissues",
    "Sugars": "Sugars from plant juices"
  },
  "Clindamycin is particularly effective against:": {
    "Gram-negative rods": "Gram-negative rods like E. coli",
    "Viral infections": "Viral infections like influenza",
    "Fungal infections": "Fungal infections like candidiasis"
  },
  "Inverse agonist produces:": {
    "Same effect as agonist": "Same effect as the agonist itself",
    "No effect": "No effect on the receptor at all",
    "Enhanced agonist effect": "Enhanced effect beyond full agonist"
  },
  "What is transformation in bacteria?": {
    "Changing shape": "Changing shape of the bacterial cell",
    "Binary fission": "Binary fission of bacterial cells",
    "Spore formation": "Spore formation under stress"
  },
  "What is variable cost in a pharmacy?": {
    "Rent of the pharmacy": "Rent of the pharmacy premises",
    "Insurance premiums": "Insurance premiums paid yearly",
    "Fixed staff salaries": "Fixed staff salaries each month"
  },
  "Depression is primarily treated with:": {
    "Benzodiazepines": "Benzodiazepines for short-term anxiety",
    "Antipsychotics": "Antipsychotics for schizophrenia",
    "Beta blockers": "Beta blockers for hypertension"
  },
  "What is nucleophilic substitution?": {
    "Nuclei being substituted": "Nuclei being substituted in the atom",
    "An addition reaction": "An addition reaction across a double bond",
    "An elimination reaction": "An elimination reaction removing water"
  },
  "Metronidazole is effective against:": {
    "All bacteria": "All bacteria including gram positives",
    "Fungi only": "Fungi like Candida species",
    "Viruses only": "Viruses like influenza virus"
  },
  "What is the difference between epidemic and pandemic?": {
    "No difference": "No difference between the two terms",
    "Pandemic is milder": "Pandemic is milder in its effects",
    "Epidemic is worldwide": "Epidemic spreads worldwide equally"
  },
  "What is the mechanism of action of dexamethasone?": {
    "Blocking histamine receptors": "Blocking histamine H1 receptors",
    "Blocking COX-1 enzyme": "Blocking COX-1 enzyme in platelets",
    "Inhibiting phosphodiesterase": "Inhibiting phosphodiesterase enzyme"
  },
  "What is the MDR-TB treatment regimen duration?": {
    "About 6 months": "About 6 months of daily drugs",
    "About 3 months": "About 3 months of daily drugs",
    "About 1 month": "About 1 month of daily drugs"
  },
  "What is the Bischler-Napieralski reaction?": {
    "A condensation reaction": "A condensation reaction of two esters",
    "An oxidation reaction": "An oxidation reaction of alcohols",
    "A reduction reaction": "A reduction reaction of nitro groups"
  },
  "Cod liver oil is rich in:": {
    "Proteins": "Proteins for muscle building",
    "Vitamin C": "Vitamin C for immunity",
    "Iron": "Iron for hemoglobin synthesis"
  },
  "What are triglycerides (triacylglycerols)?": {
    "Type of protein": "Type of protein with amino acids",
    "Type of sugar": "Type of sugar with glucose units",
    "Type of nucleic acid": "Type of nucleic acid with nucleotides"
  },
  "What is the difference between prokaryotes and eukaryotes?": {
    "No difference": "No difference between the two cell types",
    "Prokaryotes are larger": "Prokaryotes are larger in size",
    "Eukaryotes lack DNA": "Eukaryotes lack DNA in the nucleus"
  },
  "What is liposomal amphotericin B (AmBisome)?": {
    "A different antifungal": "A different antifungal from another class",
    "A more toxic version": "A more toxic version of the drug",
    "An oral formulation": "An oral formulation of the same drug"
  },
  "What is the mechanism of action of leflunomide in rheumatoid arthritis?": {
    "COX inhibition": "COX inhibition like NSAIDs",
    "Blocking TNF-alpha": "Blocking TNF-alpha with antibodies",
    "Inhibiting JAK pathway": "Inhibiting JAK-STAT pathway"
  },
  "What is the difference between competitive and non-competitive antagonism?": {
    "No difference": "No difference between the two mechanisms",
    "Competitive is always better": "Competitive is always clinically better",
    "Non-competitive is weaker": "Non-competitive antagonism is always weaker"
  },
  "What is the mechanism of action of omeprazole in detail?": {
    "Blocking histamine H2 receptors": "Blocking histamine H2 receptors on parietal cells",
    "Neutralizing acid in the stomach": "Neutralizing acid already present in the stomach",
    "Coating the gastric mucosa": "Coating the gastric mucosa as a barrier"
  },
  "What are cytokines?": {
    "Antibodies": "Antibodies produced by B cells",
    "Types of bacteria": "Types of pathogenic bacteria",
    "Types of viruses": "Types of infectious viruses"
  },
  "What is the contraindication for BCG vaccine?": {
    "Being underweight": "Being underweight at birth",
    "Having a cold": "Having a common cold",
    "Being a newborn": "Being a newborn infant"
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