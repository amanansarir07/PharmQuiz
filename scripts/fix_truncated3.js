const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

const completions = {
  "A racemic mixture contains equal amounts of both": "A racemic mixture contains equal amounts of both enantiomers",
  "An employee should receive orders from one superior only": "An employee should receive orders from one superior only",
  "Applying a thin coat of sugar or": "Applying a thin coat of sugar or syrup to tablets",
  "Naturally obtained drugs that have not yet": "Naturally obtained drugs that have not yet been processed or purified",
  "Intentional or unintentional substitution or": "Intentional or unintentional substitution or addition of inferior material",
  "Ability to activate receptor after binding": "Ability to activate the receptor after binding to it",
  "Treating ulcers and preventing": "Treating ulcers and preventing NSAID-induced gastric injury",
  "A glycylcycline effective against": "A glycylcycline effective against resistant bacteria including MRSA",
  "By inhibiting angiotensin-converting enzyme preventing": "By inhibiting angiotensin-converting enzyme, preventing angiotensin II formation",
  "Decreasing hepatic glucose production and increasing": "Decreasing hepatic glucose production and increasing peripheral glucose uptake",
  "Inhibiting vitamin K epoxide reductase preventing": "Inhibiting vitamin K epoxide reductase, preventing activation of clotting factors",
  "Irreversible acetylation of COX-1 in platelets blocking": "Irreversible acetylation of COX-1 in platelets, blocking thromboxane A2 formation",
  "Inhibiting DNA gyrase and topoisomerase IV preventing": "Inhibiting DNA gyrase and topoisomerase IV, preventing bacterial DNA replication",
  "Coxibs selectively inhibit COX-2 without inhibiting COX-1 reducing": "Coxibs selectively inhibit COX-2 without inhibiting COX-1, reducing GI toxicity",
  "Binding to D-Ala-D-Ala terminal of peptidoglycan precursors inhibiting": "Binding to D-Ala-D-Ala terminal of peptidoglycan precursors, inhibiting cell wall synthesis",
  "Any untoward medical occurrence after vaccination whether or": "Any untoward medical occurrence after vaccination whether or not related to the vaccine",
  "Monitoring and controlling environmental factors affecting": "Monitoring and controlling environmental factors affecting human health",
};

let fixed = 0;
let skipped = 0;

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

console.log('Completed:', fixed);