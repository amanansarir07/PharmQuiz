const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const completions = {
  "Monosaccharides are single sugar units;": "Monosaccharides are single sugar units; polysaccharides are long chains",
  "Saturated have no double bonds;": "Saturated fatty acids have no double bonds; unsaturated ones do",
  "DNA is double-stranded with deoxyribose and thymine;": "DNA is double-stranded with deoxyribose and thymine; RNA is single-stranded with ribose and uracil",
  "Lactic acid fermentation reduces pyruvate to lactate;": "Lactic acid fermentation reduces pyruvate to lactate; alcoholic fermentation produces ethanol and CO2",
  "Replication copies DNA to make more DNA;": "Replication copies DNA to make more DNA; transcription copies DNA to make RNA",
  "Gram-positive have thick peptidoglycan layer;": "Gram-positive bacteria have a thick peptidoglycan layer; gram-negative have a thin one",
  "Pathogenicity is the ability to cause disease;": "Pathogenicity is the ability to cause disease; virulence is the degree of severity",
  "Endotoxins are LPS;": "Endotoxins are LPS components of gram-negative cell walls; exotoxins are secreted proteins",
  "Sterilization kills ALL microorganisms including spores;": "Sterilization kills all microorganisms including spores; disinfection reduces but does not kill spores",
  "Bactericidal kill bacteria;": "Bactericidal agents kill bacteria; bacteriostatic agents only inhibit their growth",
  "Selective media inhibit unwanted organisms and encourage desired ones;": "Selective media inhibit unwanted organisms and encourage desired ones; differential media distinguish by appearance",
  "Primary response occurs on first exposure to antigen;": "Primary response occurs on first exposure; secondary response is faster and stronger",
  "A drug is a chemical substance;": "A drug is a chemical substance; a medicine is a drug in a suitable dosage form",
  "A pure substance has a fixed composition;": "A pure substance has a fixed composition; a mixture has variable composition",
  "The para-amino group must be free for activity;": "The para-amino group must be free for antibacterial activity",
  "Km is substrate concentration at half-Vmax;": "Km is substrate concentration at half-Vmax; Vmax is the maximum reaction rate",
  "Unionized drugs cross lipid membranes more easily;": "Unionized drugs cross lipid membranes more easily; ionized drugs do not",
  "Fluorine enhances metabolic stability and lipophilicity;": "Fluorine enhances metabolic stability and lipophilicity, improving drug action",
  "Intrinsic activity is the ability to activate a receptor;": "Intrinsic activity is the ability to activate a receptor; efficacy is the resulting response",
  "Affinity is how well a drug binds to a receptor;": "Affinity is how well a drug binds to a receptor; potency is the dose needed for effect",
  "Morphine has N-methyl group;": "Morphine has an N-methyl group; naloxone has an allyl group at that position",
  "Lipophilic prodrugs may bypass gut wall metabolism;": "Lipophilic prodrugs may bypass gut wall metabolism, reducing first-pass loss",
  "Administration makes policies;": "Administration makes policies; management implements them",
  "Marketing focuses on customer needs and building relationships;": "Marketing focuses on customer needs and building relationships; sales focuses on transactions",
  "MR promotes drugs to doctors;": "MR promotes drugs to doctors; a pharmacist dispenses and advises on medicines",
  "Glycosides contain a sugar moiety;": "Glycosides contain a sugar moiety; alkaloids contain nitrogen and are basic",
  "ACE inhibitors block ACE enzyme;": "ACE inhibitors block the ACE enzyme; ARBs block the angiotensin II receptor",
  "Myopathy;": "Myopathy (muscle pain and damage)",
  "Vitamin K for mild bleeding;": "Vitamin K for mild bleeding; fresh frozen plasma for severe bleeding",
  "DHP primarily vasodilate arteries;": "DHP CCBs primarily vasodilate arteries; non-DHP CCBs affect the heart more",
  "<7% for most adults;": "<7% for most adults; individualized for some patients",
  "Metformin reduces hepatic glucose production;": "Metformin reduces hepatic glucose production; sulfonylureas stimulate insulin release",
  "LABA are beta-2 agonists;": "LABA are beta-2 agonists; LAMA are muscarinic antagonists",
  "DVT and PE are treated similarly with anticoagulation;": "DVT and PE are treated similarly with anticoagulation, though PE may need more aggressive therapy",
  "Epidemic is a sudden increase in disease above normal;": "Epidemic is a sudden increase in disease above normal; endemic is a constant presence in a region",
};

let fixed = 0;

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const filepath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let changed = false;

  data.forEach(q => {
    const opts = q.options;
    const entries = Array.isArray(opts) ? opts.map((o, i) => [i, typeof o === 'string' ? o : o.text]) : Object.entries(opts);
    entries.forEach(([key, text]) => {
      if (typeof text !== 'string') return;
      const trimmed = text.trim();
      const completion = completions[trimmed];
      if (!completion) return;
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

console.log('Fixed trailing semicolons:', fixed);