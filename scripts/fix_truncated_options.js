const fs = require('fs');
const path = require('path');
const dir = 'data/questions';

// Completion map: truncated text -> completed correct option
const completions = {
  // biochemistry-microbiology
  "Rickets in children and": "Rickets in children and osteomalacia in adults",
  "Organic non-protein molecules that": "Organic non-protein molecules that assist enzyme activity",
  "Allergic reactions and": "Allergic reactions and anaphylaxis",
  "Intermittent sterilization by heating at 100°C for": "Intermittent sterilization by heating at 100°C for three consecutive days",
  "The substrate fits perfectly into the active site of": "The substrate fits perfectly into the enzyme's active site",
  "Component of cell membranes precursor for": "Component of cell membranes and precursor for steroid hormones",
  "Major component of": "Major component of cell membranes",
  "A porphyrin ring with": "A porphyrin ring with a central iron atom",
  "A point mutation in the": "A point mutation in the beta-globin gene",
  "Transfers specific amino acids to the": "Transfers specific amino acids to the ribosome",
  "The set of rules by which the nucleotide sequence of a": "The set of rules by which nucleotide sequence encodes amino acids",
  "Prokaryotes lack membrane-bound nucleus and": "Prokaryotes lack a membrane-bound nucleus and organelles",
  "Viral DNA integrates into the host genome and": "Viral DNA integrates into the host genome and remains latent",
  "A single-celled prokaryotic microorganism with a": "A single-celled prokaryotic microorganism without a nucleus",
  "Short hair-like appendages used for": "Short hair-like appendages used for adhesion and conjugation",
  "Uptake of free DNA from the": "Uptake of free DNA from the environment",
  "Four criteria to establish that a": "Four criteria to establish that a microbe causes disease",
  "The community of microorganisms that normally reside on": "The community of microorganisms that normally reside on the body",
  "Inhibits protein synthesis by binding to": "Inhibits protein synthesis by binding to the 30S ribosome",
  "The ability of bacteria to survive and grow in the": "The ability of bacteria to survive and grow in the presence of antibiotics",
  "A nutrient substance used to": "A nutrient substance used to grow microorganisms",
  "The lowest concentration of an antibiotic that": "The lowest concentration of an antibiotic that inhibits visible growth",
  "Humoral immunity involves B cells and": "Humoral immunity involves B cells and antibodies",
  "A group of plasma proteins that enhance the": "A group of plasma proteins that enhance the immune response",
  "Human Immunodeficiency Virus — a retrovirus that": "Human Immunodeficiency Virus — a retrovirus that attacks CD4 cells",
  "Epidemic is a disease outbreak in a": "Epidemic is a disease outbreak in a specific community",
  "Staphylococcus aureus and other bacteria from": "Staphylococcus aureus and other bacteria from hospital environments",

  // pharmaceutical-chemistry
  "Neutralizing gastric acid and": "Neutralizing gastric acid and protecting the gastric mucosa",
  "Calcium deficiency and": "Calcium deficiency and hypocalcemic tetany",
  "A specific group of atoms within a": "A specific group of atoms within a molecule that determines reactivity",
  "Mechanisms by which drugs interact with": "Mechanisms by which drugs interact with receptors",
  "Replacement of an atom or group with a": "Replacement of an atom or group with a similar one",
  "An inactive compound that is converted to an": "An inactive compound that is converted to an active drug in the body",
  "An inactive substance added to a": "An inactive substance added to a formulation",
  "A pure substance has a fixed composition; a": "A pure substance has a fixed composition; a mixture does not",
  "A reaction where a nucleophile attacks an": "A reaction where a nucleophile attacks an electrophilic carbon",
  "Loss of electrons or gain of": "Loss of electrons or gain of oxygen",
  "Gain of electrons or gain of": "Gain of electrons or gain of hydrogen",
  "Insertion of an oxygen atom next to": "Insertion of an oxygen atom next to a carbonyl group",
  "By enhancing GABAergic inhibition — they increase the": "By enhancing GABAergic inhibition — they increase chloride channel opening",
  "A condensation between an aldehyde/ketone and an": "A condensation between an aldehyde/ketone and an active methylene compound",
  "pKa determines the ionization state of a": "pKa determines the ionization state of a drug at a given pH",
  "An alpha beta-unsaturated carbonyl compound that": "An alpha,beta-unsaturated carbonyl compound that accepts electrons",
  "A ring-forming reaction combining a Michael addition with an": "A ring-forming reaction combining Michael addition with aldol condensation",
  "All are methylxanthines differing in the number and": "All are methylxanthines differing in the number and position of methyl groups",
  "Nitration of phenol → reduction to": "Nitration of phenol, then reduction and acetylation",
  "Amide bond formation with": "Amide bond formation with loss of water",
  "An organomagnesium compound used as a": "An organomagnesium compound used as a carbon nucleophile",
  "Reaction of aldehydes with no alpha-hydrogens in the presence of": "Reaction of aldehydes with no alpha-hydrogens in concentrated alkali",
  "Competitive antagonist competes with agonist for the": "Competitive antagonist competes with agonist for the same receptor site",
  "A mathematical relationship between reaction rates and": "A mathematical relationship between reaction rates and substituent effects",
  "Metabolism of a drug in the gut wall and": "Metabolism of a drug in the gut wall and liver before systemic circulation",
  "Ki is the dissociation constant of inhibitor from": "Ki is the dissociation constant of inhibitor from the enzyme",
  "An inhibitor that follows Michaelis-Menten kinetics with": "An inhibitor that increases Km without changing Vmax",
  "An inhibitor that binds only to the": "An inhibitor that binds only to the enzyme-substrate complex",
  "pH = pKa + log — used to": "pH = pKa + log [A-]/[HA] — used to find drug ionization",
  "The ratio of drug concentration in": "The ratio of drug concentration in oil and water phases",
  "The ability of a drug to exist in": "The ability of a drug to exist in multiple crystalline forms",
  "A condensation of a beta-arylethylamine with an": "A condensation of a beta-arylethylamine with an aldehyde",
  "Thermal decomposition of an acyl azide to an isocyanate with": "Thermal decomposition of an acyl azide to an isocyanate with loss of nitrogen",
  "A method to prepare pure primary amines from": "A method to prepare pure primary amines from alkyl halides",
  "A theory stating that drug response is proportional to": "A theory stating that drug response is proportional to receptor occupancy",
  "A formylation reaction using DMF and POCl3 to": "A formylation reaction using DMF and POCl3 to introduce a formyl group",
  "Conversion of alpha-hydroxy amides to": "Conversion of alpha-hydroxy amides to aldehydes",

  // pharmaceutical-management
  "From raw material procurement to": "From raw material procurement to final product delivery",
  "Nepal Pharmacy Council and": "Nepal Pharmacy Council and local authorities",
  "The place a product occupies in": "The place a product occupies in the minds of consumers",
  "Storage of pharmaceutical products in": "Storage of pharmaceutical products in proper conditions",
  "The stock level at which a": "The stock level at which a new order must be placed",
  "A process where suppliers bid to": "A process where suppliers bid to supply goods at competitive prices",
  "A detailed written instruction to": "A detailed written instruction to perform a task consistently",
  "A document containing all details of the": "A document containing all details of a batch's manufacturing process",
  "Maintaining temperature-controlled storage and": "Maintaining temperature-controlled storage and transport of vaccines",
  "Provides evidence-based drug information to": "Provides evidence-based drug information to healthcare professionals",
  "Patients receive appropriate drug therapy for": "Patients receive appropriate drug therapy for their clinical condition",
  "Advising the government on": "Advising the government on drug regulation and policy",
  "Any preventable event that may lead to": "Any preventable event that may lead to inappropriate medication use",
  "Comparing a patient's medication orders to": "Comparing a patient's medication orders to their current medication list",
  "The optimal order size that": "The optimal order size that minimizes total inventory cost",
  "Costs that change directly with": "Costs that change directly with the volume of output",
  "A substance that acts on": "A substance that acts on the central nervous system",
  "The process of officially listing a drug in": "The process of officially listing a drug in the national register",
  "The stages a drug goes through from": "The stages a drug goes through from introduction to decline",
  "A drug marketed after patent expiry containing the": "A drug marketed after patent expiry containing the same active ingredient",

  // pharmaceutics
  "Centrifugal force for": "Centrifugal force for separating particles from a gas stream",
  "Sterile filtration of": "Sterile filtration of heat-labile solutions",
  "Passage of solvent through packed bed of": "Passage of solvent through a packed bed of drug powder",
  "Heating by immersion in": "Heating by immersion in hot water",
  "Provide multiple theoretical plates for": "Provide multiple theoretical plates for efficient separation",
  "Volume of distribution and": "Volume of distribution",
  "Selecting appropriate emulsifier for": "Selecting appropriate emulsifier for a given formulation",
  "Release rate proportional to": "Release rate proportional to the amount of drug remaining",
  "Cylinders rotating around central axis AND": "Cylinders rotating around a central axis with grinding balls",
  "Maintain therapeutic drug levels over an": "Maintain therapeutic drug levels over an extended period",
  "A thin stagnant layer of": "A thin stagnant layer of liquid adjacent to the dissolving surface",

  // pharmacognosy
  "Plant part used": "Plant part used as the drug",
  "The plant or animal species from": "The plant or animal species from which the drug is obtained",
  "Antiseptic mouthwash and": "Antiseptic mouthwash and toothpaste",
  "Topical treatment of warts and": "Topical treatment of warts and genital lesions",
  "Moschus moschiferus - dried secretion from": "Moschus moschiferus - dried secretion from the musk gland",
  "Refined semi-solid mixture of": "Refined semi-solid mixture of hydrocarbons",
  "Glycosides that produce soap-like foam in": "Glycosides that produce soap-like foam in water",
  "Retardation factor - ratio of distance moved by": "Retardation factor - ratio of distance moved by the solute to that of the solvent front",
  "The residue after treating total ash with": "The residue after treating total ash with dilute acid",
  "The amount of crude drug extracted by a": "The amount of crude drug extracted by a given solvent",
  "Determining the percentage of volatile oil in": "Determining the percentage of volatile oil in a crude drug",
  "Any material other than the": "Any material other than the drug's own constituents",

  // pharmacology
  "Drug is bound to albumin and": "Drug is bound to albumin and other plasma proteins",
  "Requires metabolic conversion in the": "Requires metabolic conversion in the body to become active",
  "Opposite effect to agonist by": "Opposite effect to an agonist by acting on the same receptor",
  "Class III antiarrhythmic with": "Class III antiarrhythmic with beta-blocking activity",
  "Breaks disulfide bonds in": "Breaks disulfide bonds in mucus glycoproteins",
  "Gold standard antifungal for": "Gold standard antifungal for severe systemic fungal infections",
  "Anaerobic bacteria and": "Anaerobic bacteria and some gram-positive cocci",

  // pharmacotherapeutics
  "130/80 mmHg or below for": "130/80 mmHg or below for most hypertensive patients",
  "Warfarin works in the liver; heparin works in the": "Warfarin works in the liver; heparin works in the blood",
  "Inhibiting vitamin K epoxide reductase complex 1 preventing regeneration of": "Inhibiting vitamin K epoxide reductase, preventing regeneration of active vitamin K",
  "SABA — short-acting used for": "SABA — short-acting, used for quick relief of bronchospasm",
  "Irreversibly binding to the H+/K+-ATPase on the luminal surface of": "Irreversibly binding to the H+/K+-ATPase on the luminal surface of parietal cells",
  "Its reduced metabolites damage DNA causing strand breakage and": "Its reduced metabolites damage DNA causing strand breakage and cell death",
  "Amoxicillin has better oral bioavailability and": "Amoxicillin has better oral bioavailability and broader spectrum",
  "Binding to L-type calcium channels in": "Binding to L-type calcium channels in vascular smooth muscle",
  "Inhibiting the NaCl cotransporter in the": "Inhibiting the NaCl cotransporter in the distal convoluted tubule",
  "Bronchodilator for asthma and COPD — used as": "Bronchodilator for asthma and COPD — used as an add-on therapy",
  "Metformin is weight-neutral or causes modest weight loss — an": "Metformin is weight-neutral or causes modest weight loss — an advantage over sulfonylureas",
  "Primarily central COX inhibition and activation of": "Primarily central COX inhibition and activation of descending inhibitory pathways",
  "It primarily reduces hepatic glucose production by": "It primarily reduces hepatic glucose production by inhibiting gluconeogenesis",
  "Inhaler technique assessment and": "Inhaler technique assessment and adherence counseling",
  "A potent synthetic glucocorticoid that binds to": "A potent synthetic glucocorticoid that binds to glucocorticoid receptors",

  // public-health
  "Occurs in greater numbers than expected in": "Occurs in greater numbers than expected in a community",
  "Ensure healthy lives and": "Ensure healthy lives and promote well-being",
  "Constantly present in a": "Constantly present in a particular region",
  "From a specific disease in": "From a specific disease in a specific population",
  "Infection risk and": "Infection risk and environmental contamination",
  "Adding essential micronutrients to": "Adding essential micronutrients to staple foods",
  "Administration of a vaccine to stimulate the": "Administration of a vaccine to stimulate the immune system",
  "An additional dose given after the": "An additional dose given after the primary series",
  "A heat-sensitive label on vaccine vials indicating if": "A heat-sensitive label on vaccine vials indicating heat exposure",
  "HIV infection with": "HIV infection with severe immunosuppression",
  "Sugar and salt dissolved in": "Sugar and salt dissolved in clean water",
  "A strategy where a healthcare worker watches the": "A strategy where a healthcare worker watches the patient take each dose",
  "TB resistant to at least Isoniazid and": "TB resistant to at least isoniazid and rifampicin",
  "Aggressive fluid replacement with": "Aggressive fluid replacement with ORS and IV fluids",
  "A set of criteria for deciding whether a": "A set of criteria for deciding whether a person has a disease",
  "Loss of 500ml or more of": "Loss of 500 ml or more of blood after delivery",
  "A strategy integrating management of major causes of": "A strategy integrating management of major causes of childhood illness",
  "A energy-dense nutrient-rich food paste used to": "An energy-dense, nutrient-rich food paste used to treat severe malnutrition",
  "A state of well-being enabling individuals to": "A state of well-being enabling individuals to realize their potential",
  "Harmful or hazardous use of": "Harmful or hazardous use of psychoactive substances",
  "The branch of public health concerned with": "The branch of public health concerned with environmental factors",
  "Information and activities that increase awareness and": "Information and activities that increase awareness and promote healthy behavior",
  "Pharmacists assessing and recommending treatment for": "Pharmacists assessing and recommending treatment for minor self-limiting conditions",
  "An approach recognizing that": "An approach recognizing that human, animal, and environmental health are linked",
};

let fixed = 0;
let notFound = 0;

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
      if (completion && completion !== trimmed) {
        if (Array.isArray(opts)) {
          if (typeof opts[key] === 'string') opts[key] = completion;
          else opts[key].text = completion;
        } else {
          opts[key] = completion;
        }
        changed = true;
        fixed++;
      } else if (completions[trimmed] === undefined && / (a|an|the|from|if|of|and|to|with|for|as|in|on|that|which|indicating|used|per|by)$/i.test(trimmed) && trimmed.length > 10) {
        notFound++;
        console.log('NOT FOUND: "' + trimmed + '"  (Q: ' + q.question_text + ')');
      }
    });
  });

  if (changed) fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

console.log('\nFixed:', fixed, 'truncated options');
console.log('Unmatched (need manual):', notFound);