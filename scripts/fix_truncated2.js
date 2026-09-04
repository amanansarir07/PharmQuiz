const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const completions = {
  // biochemistry
  "The study of chemical processes within": "The study of chemical processes within living organisms",
  "A heterogeneous group of naturally occurring molecules that are": "A heterogeneous group of naturally occurring molecules that are insoluble in water",
  "A differential staining method to classify bacteria based": "A differential staining method to classify bacteria based on cell wall properties",
  "Highly resistant dormant structures formed by some": "Highly resistant dormant structures formed by some bacteria under stress",
  "The primary method of bacterial reproduction where one": "The primary method of bacterial reproduction where one cell divides into two",
  "Transfer of genetic material between": "Transfer of genetic material between bacteria through direct contact",
  "Transfer of bacterial DNA from one": "Transfer of bacterial DNA from one bacterium to another via a virus",
  "A microorganism that causes disease only when": "A microorganism that causes disease only when the host is weakened",
  "Complete destruction or removal of all": "Complete destruction or removal of all microorganisms including spores",
  "The non-specific defense mechanisms that are": "The non-specific defense mechanisms that are present from birth",
  "HIV is the virus; AIDS is": "HIV is the virus; AIDS is the resulting disease syndrome",
  "An infection acquired during or after hospitalization that was": "An infection acquired during or after hospitalization that was not present on admission",

  // chemistry
  "A solution that resists changes in pH when": "A solution that resists changes in pH when small amounts of acid or base are added",
  "A carbon-carbon bond-forming reaction between two": "A carbon-carbon bond-forming reaction between two esters or carbonyl compounds",
  "A drug that binds to a receptor without": "A drug that binds to a receptor without activating it, blocking the agonist",
  "An atom or group that can replace another while": "An atom or group that can replace another while keeping similar biological activity",
  "Different salt forms of the same": "Different salt forms of the same active ingredient",
  "3-OH is essential; N-methyl can be": "3-OH is essential; N-methyl can be replaced or removed",
  "A substance listed in the narcotics schedule that affects": "A substance listed in the narcotics schedule that affects the central nervous system",
  "An Ayurvedic formulation containing equal": "An Ayurvedic formulation containing equal parts of three fruits",

  // management
  "Dividing the market into": "Dividing the market into distinct groups of buyers",
  "Ensure adequate supply while": "Ensure adequate supply while minimizing holding costs",
  "Quotation is informal pricing; tender is": "Quotation is informal pricing; tender is formal competitive bidding",
  "To identify potential interactions between": "To identify potential interactions between drugs and other substances",
  "Extra inventory held to prevent stockouts due": "Extra inventory held to prevent stockouts due to unexpected demand",

  // pharmaceutics
  "Random zigzag motion of colloidal particles due": "Random zigzag motion of colloidal particles due to bombardment by solvent molecules",
  "Alcoholic or oily preparations rubbed into": "Alcoholic or oily preparations rubbed into the skin",

  // pharmacognosy
  "Identifying and authenticating crude drugs through": "Identifying and authenticating crude drugs through their morphological features",
  "The difference between total ash and residue after": "The difference between total ash and the residue after treatment with water",
  "A group of techniques for separating mixtures based": "A group of techniques for separating mixtures based on differential distribution between phases",

  // pharmacology
  "Rapid tolerance to drug after": "Rapid tolerance to drug after repeated administration",
  "Congenital malformations when": "Congenital malformations when given during pregnancy",

  // pharmacotherapeutics
  "The treatment of disease through": "The treatment of disease through the use of drugs",
  "Aspirin + a P2Y12 inhibitor used after": "Aspirin + a P2Y12 inhibitor used after coronary stent placement",

  // public health
  "Tests hypotheses about": "Tests hypotheses about the causes and risk factors of disease",
  "WHO's global initiative to ensure all": "WHO's global initiative to ensure all children receive essential vaccines",
  "A condition where weight-for-height is below": "A condition where weight-for-height is far below the standard",
  "Providing patients with information about": "Providing patients with information about their medicines and usage",
  "How many essential amino acids are there for humans?": null, // handled specially below
};

let fixed = 0;
let special = 0;

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;

  data.forEach(q => {
    const opts = q.options;
    const entries = Array.isArray(opts) ? opts.map((o, i) => [i, typeof o === 'string' ? o : o.text]) : Object.entries(opts);

    // Special case: garbled amino acid option
    if ((q.question_text || '').includes('How many essential amino acids')) {
      entries.forEach(([key, text]) => {
        if (typeof text === 'string' && text.includes('10 (9 for adults')) {
          const replacement = '9 for adults and 10 for infants';
          if (Array.isArray(opts)) {
            if (typeof opts[key] === 'string') opts[key] = replacement;
            else opts[key].text = replacement;
          } else {
            opts[key] = replacement;
          }
          changed = true;
          special++;
        }
      });
    }

    entries.forEach(([key, text]) => {
      if (typeof text !== 'string') return;
      const trimmed = text.trim();
      const completion = completions[trimmed];
      if (!completion || completion === trimmed) return;
      if (Array.isArray(opts)) {
        if (typeof opts[key] === 'string') opts[key] = completion;
        else opts[key].text = completion;
      } else {
        opts[key] = completion;
      }
      changed = true;
      fixed++;
    });
  });

  if (changed) fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

console.log('Completed options:', fixed);
console.log('Special fixes:', special);