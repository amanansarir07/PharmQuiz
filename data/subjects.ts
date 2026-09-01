export interface SubjectData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  examMarks: number;
  totalHours: number;
  units: UnitData[];
}

export interface UnitData {
  id: string;
  name: string;
  slug: string;
  description: string;
  examHours: number;
  examMarks: number;
  subtopics: string[];
}

export const subjects: SubjectData[] = [
  {
    id: "pharmaceutics-i",
    name: "Pharmaceutics I",
    slug: "pharmaceutics-i",
    description:
      "Pharmaceutical development, calculations, unit operations, physicochemical principles, and biopharmaceutics.",
    icon: "💊",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "pharm-i-unit-1",
        name: "Introduction to Pharmaceutical Development & Dosage Forms",
        slug: "introduction-dosage-forms",
        description:
          "History of pharmacy in Nepal, classification of dosage forms (solid, liquid, semisolid, gaseous).",
        examHours: 15,
        examMarks: 10,
        subtopics: [
          "History of pharmacy profession in Nepal",
          "Definition and examples of dosage forms",
          "Solid dosage forms (Tablets, Capsules, Powders, Granules, Suppositories, Lozenges)",
          "Liquid dosage forms (Solutions, Syrups, Elixirs, Emulsions, Suspensions, Liniments, Injections, Tinctures)",
          "Semisolid dosage forms (Ointments, Creams, Paste, Gels)",
          "Gaseous dosage forms (Aerosol, Inhalants)",
        ],
      },
      {
        id: "pharm-i-unit-2",
        name: "Pharmacopoeias and Formularies",
        slug: "pharmacopoeias-formularies",
        description:
          "Definition of Pharmacopoeias, Formularies (NNF), Compendia, and contents of monographs.",
        examHours: 10,
        examMarks: 7,
        subtopics: [
          "Definition of Pharmacopoeias, Formularies and Compendia",
          "Contents of Monograph",
          "Official Compendia (BP, EP, IP, USP, JP, BPC)",
          "Recognized pharmacopoeias in Nepal",
        ],
      },
      {
        id: "pharm-i-unit-3",
        name: "Unit Operations",
        slug: "unit-operations",
        description:
          "Milling, size separation, mixing, filtration, and drying operations in pharmaceutical industry.",
        examHours: 35,
        examMarks: 30,
        subtopics: [
          "Milling: Hammer mill, Ball mill, Colloidal mill",
          "Size Separation: Sieves, standards, Cyclone separator",
          "Mixing and Homogenization: Double cone blender, Triple roller mill, Silverson mixer",
          "Filtration: Theory, membrane filter, sintered glass filter",
          "Drying: Tray dryer, fluidized bed dryer, freeze dryer",
        ],
      },
      {
        id: "pharm-i-unit-4",
        name: "Heat Process",
        slug: "heat-process",
        description:
          "Heat transfer methods, evaporation principles, and pharmaceutical applications.",
        examHours: 7,
        examMarks: 8,
        subtopics: [
          "Heat and temperature definitions",
          "Methods of heat transfer (conduction, convection, radiation)",
          "Evaporation and pharmaceutical applications",
          "Evaporation pan and evaporating still",
          "Factors affecting evaporation",
        ],
      },
      {
        id: "pharm-i-unit-5",
        name: "Distillation",
        slug: "distillation",
        description:
          "Types of distillation including simple, steam, azeotropic, vacuum, fractional, and molecular.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Simple distillation",
          "Steam distillation",
          "Azeotropic distillation",
          "Vacuum distillation",
          "Fractional distillation",
          "Molecular distillation",
        ],
      },
      {
        id: "pharm-i-unit-6",
        name: "Physicochemical Principles of Pharmaceutics",
        slug: "physicochemical-principles",
        description:
          "pH, buffers, rheology, surface phenomena, colloids, and reaction kinetics.",
        examHours: 30,
        examMarks: 30,
        subtopics: [
          "pH, buffers and Isotonic solutions (Sorensen's pH scale, buffer equation, buffer capacity)",
          "Rheology: Viscosity, Newtonian and Non-Newtonian fluids, capillary viscometer",
          "Surface and Interfacial Tension (Capillary method, Drop method), Contact angle, Surfactants",
          "Disperse systems and Colloids",
          "Kinetics and stability testing (Zero and first order reactions, ICH guidelines)",
        ],
      },
      {
        id: "pharm-i-unit-7",
        name: "Monophasic Liquid Dosage Forms",
        slug: "monophasic-liquids",
        description:
          "Solubility, formulation and preparation of syrups, elixirs, lotions and liniments.",
        examHours: 10,
        examMarks: 7,
        subtopics: [
          "Definition and advantages/disadvantages",
          "Solubility and factors affecting it",
          "Formulations of monophasic liquid dosage forms",
          "Preparation of Syrups, Elixirs, Lotions and Liniments",
        ],
      },
      {
        id: "pharm-i-unit-8",
        name: "Introduction to Biopharmaceutics",
        slug: "biopharmaceutics",
        description:
          "Drug transport, bioavailability, bioequivalence, plasma concentration curves, and pharmacokinetic terms.",
        examHours: 20,
        examMarks: 20,
        subtopics: [
          "Definition and importance of Biopharmaceutics",
          "Mechanism of drug transport across GI barrier",
          "Bioavailability and Bioequivalence",
          "Absolute and relative bioavailability",
          "Plasma concentration time curve (oral, IV bolus, IV infusion)",
          "Volume of Distribution, Half-life, Steady state concentration, Clearance",
          "Loading dose, Maintenance dose, Elimination rate constant",
        ],
      },
      {
        id: "pharm-i-unit-9",
        name: "Weight and Measures",
        slug: "weight-measures",
        description:
          "Metrology, unit conversion, and calculations (percentage, ratio strength, allegation method).",
        examHours: 5,
        examMarks: 5,
        subtopics: [
          "Classification of weight and measure",
          "Unit conversion (system to system, unit to unit)",
          "Percentage and ratio strength problems",
          "Allegation method",
          "Isotonic solution calculations",
        ],
      },
    ],
  },
  {
    id: "pharmacology-i",
    name: "Pharmacology I",
    slug: "pharmacology-i",
    description:
      "Drug actions on living organisms — pharmacodynamics, pharmacokinetics, adverse effects, clinical uses, and doses.",
    icon: "💉",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "pharmaco-i-unit-1",
        name: "General Pharmacology",
        slug: "general-pharmacology",
        description:
          "Basic terminologies, routes of drug administration, pharmacokinetics, pharmacodynamics, dose-response, and receptors.",
        examHours: 25,
        examMarks: 25,
        subtopics: [
          "Basic terminologies of pharmacology",
          "Nomenclature and sources of drugs",
          "Routes of drug administration (advantages/disadvantages)",
          "Pharmacokinetics: Absorption, Distribution, Metabolism, Excretion",
          "Pharmacodynamics: Principles and mechanisms of drug action",
          "Factors affecting drug action",
          "Dose-response relationship",
          "LD50, ED50, Therapeutic index, Safety, Potency, Efficacy, Toxicity",
          "Theories and classification of receptors",
        ],
      },
      {
        id: "pharmaco-i-unit-2",
        name: "Gastrointestinal Drugs",
        slug: "gi-drugs",
        description:
          "Drugs used in peptic ulcer, vomiting, diarrhea, and constipation.",
        examHours: 20,
        examMarks: 20,
        subtopics: [
          "Drugs used in Peptic ulcer: Aluminium hydroxide, Magnesium hydroxide, Sodium bicarbonate, Ranitidine, Omeprazole, Sucralfate",
          "Antiemetic drugs: Domperidone, Ondansetron, Promethazine",
          "Antidiarrheal: Loperamide, ORS",
          "Drugs used in constipation: Isapgol husk, Bisacodyl, Castor oil, Lactulose",
        ],
      },
      {
        id: "pharmaco-i-unit-3",
        name: "NSAIDs and Antipyretic Analgesics",
        slug: "nsaids-analgesics",
        description:
          "Pain, pyrexia, inflammation, NSAIDs classification, and drugs for gout/rheumatoid arthritis.",
        examHours: 15,
        examMarks: 15,
        subtopics: [
          "Definitions: Pain, pyrexia, inflammation, analgesics, antipyretics",
          "Pharmacological classification of NSAIDs",
          "Ibuprofen, Indomethacin, Mefenamic acid, Diclofenac, Paracetamol, Aspirin, Etoricoxib, Ketorolac",
          "Drugs for gout and rheumatoid arthritis: Colchicine, Allopurinol, Febuxostat, Gold compounds, Methotrexate, Methylprednisolone",
        ],
      },
      {
        id: "pharmaco-i-unit-4",
        name: "Drugs Acting on Autonomic Nervous System",
        slug: "ans-drugs",
        description:
          "Cholinergic, anticholinergic, adrenergic, and antiadrenergic drugs.",
        examHours: 20,
        examMarks: 20,
        subtopics: [
          "Physiology of ANS",
          "Cholinergic drugs: Pilocarpine, Neostigmine, Pyridostigmine",
          "Anticholinergic drugs: Atropine, Hyoscine",
          "Adrenergic drugs: Adrenaline, Noradrenaline, Dopamine",
          "Antiadrenergic drugs: Doxazosin, Tamsulosin, Atenolol, Metoprolol",
        ],
      },
      {
        id: "pharmaco-i-unit-5",
        name: "Respiratory System Drugs",
        slug: "respiratory-drugs",
        description:
          "Drugs used in cough, asthma, and COPD.",
        examHours: 10,
        examMarks: 10,
        subtopics: [
          "Anti-tussives: Codeine, Dextromethorphan",
          "Expectorants: Ammonium Chloride, Bromohexine",
          "Asthma and COPD drugs: Salbutamol, Salmeterol, Aminophylline, Tiotropium bromide, Montelukast",
        ],
      },
      {
        id: "pharmaco-i-unit-6",
        name: "Antimicrobials",
        slug: "antimicrobials",
        description:
          "Classification, mechanism, and clinical use of antibiotics, antifungals, antivirals, antimalarials, and antihelminthics.",
        examHours: 50,
        examMarks: 50,
        subtopics: [
          "Classification of antimicrobials (mechanism, spectrum, organism type)",
          "General principles of antimicrobial therapy",
          "Sulphonamides: Co-trimoxazole, Silver sulfadiazine",
          "Penicillins: Benzyl penicillin, Ampicillin, Amoxicillin, Piperacillin, Imipenem",
          "Cephalosporins: Cefadroxil, Cefixime, Cefotaxime, Cefpodoxime",
          "Beta-lactamase inhibitors: Clavulanic acid, Sulbactam, Tazobactam",
          "Tetracyclines: Tetracycline, Doxycycline",
          "Aminoglycosides: Streptomycin, Gentamicin, Amikacin",
          "Macrolides: Erythromycin, Azithromycin, Clarithromycin",
          "Quinolones/Fluoroquinolones: Nalidixic acid, Norfloxacin, Ofloxacin",
          "Antitubercular (1st line: INH, Rifampicin, Pyrazinamide, Ethambutol; 2nd line: PAS, Cycloserine, Ciprofloxacin)",
          "Antileprotic: Dapsone, Clofazimine",
          "Antifungal: Nystatin, Amphotericin B, Itraconazole, Clotrimazole, Ketoconazole, Fluconazole",
          "Antiviral: Acyclovir, Remdesivir, Zidovudine, Lamivudine, Tenofovir",
          "Antimalarial: Chloroquine, Primaquine, Quinine, Artemisinin derivatives",
          "Antiprotozoal: Metronidazole, Diloxanide furoate, Tinidazole",
          "Antihelminthic: Albendazole, Mebendazole, Diethylcarbamazine citrate",
        ],
      },
    ],
  },
  {
    id: "pharmaceutical-chemistry-i",
    name: "Pharmaceutical Chemistry I",
    slug: "pharmaceutical-chemistry-i",
    description:
      "Inorganic pharmaceutical ingredients — preparation, properties, quality control, volumetric analysis, and chromatography.",
    icon: "⚗️",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "chem-i-unit-1",
        name: "Introduction",
        slug: "introduction",
        description:
          "Importance of inorganic drug molecules, pharmacopoeia, and monograph interpretation.",
        examHours: 4,
        examMarks: 5,
        subtopics: [
          "Importance of inorganic drug molecules in pharmacy",
          "Pharmacopoeia and official monograph",
          "Interpretation of pharmacopoeial monograph",
        ],
      },
      {
        id: "chem-i-unit-2",
        name: "Acids, Bases, Buffers, Antioxidants & Preservatives",
        slug: "acids-bases-buffers",
        description:
          "Acid-base concepts, buffers, antioxidants, and preservatives used in pharmacy.",
        examHours: 15,
        examMarks: 15,
        subtopics: [
          "Acid-base concepts (Arrhenius, Lewis, Bronsted-Lowry)",
          "Boric acid, Hydrochloric acid, Strong ammonia solution",
          "Calcium hydroxide, Sodium hydroxide",
          "Buffer solutions and capacity",
          "Citric acid, Sodium citrate, Sodium phosphate",
          "Antioxidants and Preservatives: Sodium benzoate, Methylparaben, Propylparaben",
          "Sodium metabisulphite, BHA, BHT",
        ],
      },
      {
        id: "chem-i-unit-3",
        name: "Gastrointestinal Agents",
        slug: "gi-agents",
        description:
          "Antacids, protective agents, adsorbents, and laxatives.",
        examHours: 15,
        examMarks: 15,
        subtopics: [
          "Acidifying agent: Dilute Hydrochloric acid",
          "Antacids: Calcium Carbonate, Aluminium hydroxide gel, Magnesium Hydroxide, Magaldrate, Magnesium Trisilicate",
          "Rational combination antacid therapy",
          "Protective and adsorbents: Bismuth subsalicylate, Light Kaolin",
          "Laxative: Magnesium Sulphate",
        ],
      },
      {
        id: "chem-i-unit-4",
        name: "Topical Agents",
        slug: "topical-agents",
        description:
          "Protective, antimicrobial, and astringent agents for topical use.",
        examHours: 10,
        examMarks: 10,
        subtopics: [
          "Protective: Talc, Zinc Oxide, Calamine",
          "Antimicrobial: H₂O₂, KMnO₄, Chlorinated lime, Iodine, Povidone iodine, Silver nitrate",
          "Sulphur compounds: Precipitated sulphur, Selenium sulphide",
          "Astringents: Alum, Zinc sulphate",
        ],
      },
      {
        id: "chem-i-unit-5",
        name: "Inorganic Compounds in Dentistry",
        slug: "dentistry-compounds",
        description:
          "Anti-caries agents, dentifrices, and desensitizing agents.",
        examHours: 4,
        examMarks: 5,
        subtopics: [
          "Anti-caries: Sodium fluoride, Stannous fluoride",
          "Dentifrices: Calcium carbonate, Dibasic calcium phosphate",
          "Desensitizing: Potassium nitrate, Strontium chloride",
        ],
      },
      {
        id: "chem-i-unit-6",
        name: "Miscellaneous Agents",
        slug: "miscellaneous-agents",
        description:
          "Inhalants, expectorants, antidotes, and hematinics.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Inhalants: Oxygen, Carbon dioxide",
          "Expectorants: Ammonium chloride, Potassium iodide",
          "Antidotes: Sodium nitrite, Activated Charcoal",
          "Hematinics: Ferrous Fumarate",
        ],
      },
      {
        id: "chem-i-unit-7",
        name: "Major Intra & Extracellular Electrolytes",
        slug: "electrolytes",
        description:
          "Physiological role of electrolytes, replacement therapy, acid-base balance.",
        examHours: 10,
        examMarks: 10,
        subtopics: [
          "Physiological role of major electrolytes (Cl, PO₄, HCO₃, Na, K, Ca, Mg)",
          "Replacement therapy: Sodium chloride, Potassium chloride, Calcium gluconate",
          "Acid-base balance: Sodium acetate, Potassium acetate, Sodium bicarbonate, Potassium citrate",
          "Combination therapy: Ringer Lactate solution, ORS",
        ],
      },
      {
        id: "chem-i-unit-8",
        name: "Radiopharmaceuticals & Radio-opaque Contrast Media",
        slug: "radiopharmaceuticals",
        description:
          "Radioactivity, radioisotopes, and contrast media.",
        examHours: 5,
        examMarks: 4,
        subtopics: [
          "Radioactivity, Alpha, Beta, Gamma radiations, GM Counter",
          "Radioisotopes: Iodine-131, Gold-198, Technetium-99m, Calcium-47",
          "Contrast Media: Barium Sulphate",
        ],
      },
      {
        id: "chem-i-unit-9",
        name: "Quality Control of Inorganic APIs",
        slug: "quality-control",
        description:
          "QC/QA, impurities, limit tests, identification tests, melting/boiling point, errors, volumetric analysis.",
        examHours: 40,
        examMarks: 20,
        subtopics: [
          "Quality control and Quality assurance",
          "Sources of impurities and Tests of purity",
          "Limit tests: Chloride, Sulphate, Iron, Heavy metals",
          "Identification tests for Cations (Al, Ca, Mg, Zn, Fe, Ag, Na, K)",
          "Identification tests for Anions (Halides, Phosphate, Sulphate, Bicarbonate, Carbonate, Nitrate)",
          "Melting point and boiling point determination",
          "Errors, classification, minimization, Precision and accuracy",
          "Volumetric Analysis: Equivalent weight, Standard solutions, Concentration expressions (Molarity, Normality, Molality)",
        ],
      },
      {
        id: "chem-i-unit-10",
        name: "Titration",
        slug: "titration",
        description:
          "Acid-base titration, redox titration (iodometry, iodimetry), indicators, pH curves.",
        examHours: 25,
        examMarks: 15,
        subtopics: [
          "Titration terminologies (Titrant, titrand, indicator, endpoint, equivalence point)",
          "Acid-base titration: Acidimetry and alkalimetry",
          "Acid-base indicators and selection",
          "pH curves (strong acid-strong base, weak acid-weak base, etc.)",
          "Normality factor and normality equation",
          "Redox titration: Iodometry and Iodimetry",
        ],
      },
      {
        id: "chem-i-unit-11",
        name: "Chromatography",
        slug: "chromatography",
        description:
          "Principles and types of chromatography, column chromatography, HPLC.",
        examHours: 4,
        examMarks: 5,
        subtopics: [
          "Definition and terms in chromatography",
          "Column Chromatography: Principle, stationary/mobile phase, wet/dry packing, elution techniques",
          "HPLC: Definition and application",
        ],
      },
    ],
  },
  {
    id: "pharmacognosy",
    name: "Pharmacognosy",
    slug: "pharmacognosy",
    description:
      "Study of medicinal drugs from natural sources — biological sources, chemical constituents, cultivation, and therapeutic uses.",
    icon: "🌿",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "pharmaco-unit-1",
        name: "Introduction to Pharmacognosy",
        slug: "intro-pharmacognosy",
        description:
          "Definition, scope, history, and classification of crude drugs.",
        examHours: 10,
        examMarks: 10,
        subtopics: [
          "Definition and scope of Pharmacognosy",
          "History and development of Pharmacognosy",
          "Classification of crude drugs (alphabetical, morphological, taxonomical, chemical, pharmacological)",
          "Terminologies: Drug, Crude drug, Medicinal plant, Phytochemistry",
        ],
      },
      {
        id: "pharmaco-unit-2",
        name: "Biological Sources & Cultivation",
        slug: "biological-sources",
        description:
          "Biological sources, cultivation methods, and collection of medicinal plants.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Biological source and its importance",
          "Cultivation of medicinal plants",
          "Collection and processing of crude drugs",
          "Factors affecting quality of crude drugs",
        ],
      },
      {
        id: "pharmaco-unit-3",
        name: "Evaluation of Crude Drugs",
        slug: "evaluation-crude-drugs",
        description:
          "Organoleptic, microscopic, physical, chemical, and biological evaluation methods.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Organoleptic evaluation (color, odor, taste, texture)",
          "Microscopic evaluation",
          "Physical evaluation (moisture content, ash value, extractive values)",
          "Chemical evaluation (chemical tests, chromatography)",
          "Biological evaluation (bioassays)",
        ],
      },
      {
        id: "pharmaco-unit-4",
        name: "Plant Tissues & Organs as Drug Sources",
        slug: "plant-tissues-organs",
        description:
          "Drugs from bark, root, leaf, flower, fruit, seed, and other plant parts.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Drugs from bark (Cinnamon, Cinchona, Cascara)",
          "Drugs from root (Rauwolfia, Ipecac, Glycyrrhiza)",
          "Drugs from leaf (Senna, Digitalis, Belladonna)",
          "Drugs from flower (Clove, Chamomile, Saffron)",
          "Drugs from fruit and seed (Fennel, Coriander, Nux vomica)",
        ],
      },
      {
        id: "pharmaco-unit-5",
        name: "Alkaloids",
        slug: "alkaloids",
        description:
          "Definition, classification, general properties, and important alkaloid-containing drugs.",
        examHours: 10,
        examMarks: 10,
        subtopics: [
          "Definition, classification, and general properties of alkaloids",
          "Extraction and isolation methods",
          "Important alkaloids: Morphine, Quinine, Caffeine, Atropine, Ephedrine, Vincristine",
          "Biological sources, chemical constituents, and uses",
        ],
      },
      {
        id: "pharmaco-unit-6",
        name: "Glycosides",
        slug: "glycosides",
        description:
          "Definition, classification, and important glycoside-containing drugs.",
        examHours: 10,
        examMarks: 10,
        subtopics: [
          "Definition, classification of glycosides (cardiac, anthraquinone, saponin, cyanogenic, etc.)",
          "Important glycoside drugs: Digitalis, Senna, Dioscorea, liquorice",
          "Biological sources, chemical constituents, and uses",
        ],
      },
      {
        id: "pharmaco-unit-7",
        name: "Volatile Oils",
        slug: "volatile-oils",
        description:
          "Definition, properties, extraction methods, and important volatile oil drugs.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Definition, general properties, and composition of volatile oils",
          "Methods of extraction (steam distillation, expression)",
          "Important volatile oil drugs: Clove, Eucalyptus, Peppermint, Lemon, Cinnamon",
          "Uses and quality control",
        ],
      },
      {
        id: "pharmaco-unit-8",
        name: "Resins",
        slug: "resins",
        description:
          "Definition, classification, and important resin-containing drugs.",
        examHours: 5,
        examMarks: 5,
        subtopics: [
          "Definition, classification of resins",
          "Important resin drugs: Myrrh, Asafoetida, Cannabis, Colophony",
          "Biological sources, chemical constituents, and uses",
        ],
      },
      {
        id: "pharmaco-unit-9",
        name: "Lipids & Waxes",
        slug: "lipids-waxes",
        description:
          "Fixed oils, fats, waxes, and their pharmaceutical applications.",
        examHours: 5,
        examMarks: 5,
        subtopics: [
          "Fixed oils and fats (Castor oil, Coconut oil, Cod liver oil)",
          "Waxes (Beeswax, Carnauba wax)",
          "Hydrogenation and saponification",
          "Pharmaceutical applications",
        ],
      },
      {
        id: "pharmaco-unit-10",
        name: "Gums & Mucilages",
        slug: "gums-mucilages",
        description:
          "Definition, properties, sources, and pharmaceutical uses of natural gums.",
        examHours: 5,
        examMarks: 5,
        subtopics: [
          "Definition and differences between gums and mucilages",
          "Important sources: Acacia, Tragacanth, Guar gum, Agar",
          "Properties, chemical constitution, and pharmaceutical uses",
        ],
      },
      {
        id: "pharmaco-unit-11",
        name: "Biological & Immunological Products",
        slug: "biological-products",
        description:
          "Sera, vaccines, toxins, antitoxins, and other biological products.",
        examHours: 8,
        examMarks: 10,
        subtopics: [
          "Classification of biological products",
          "Sera and antitoxins (antivenom serum, anti-tetanus serum)",
          "Vaccines (BCG, DPT, Polio, Hepatitis)",
          "Toxoids, antigens, and immunoglobulins",
        ],
      },
      {
        id: "pharmaco-unit-12",
        name: "Fibers & Fatty Acids",
        slug: "fibers-fatty-acids",
        description:
          "Natural fibers, fatty acids, and their pharmaceutical relevance.",
        examHours: 5,
        examMarks: 5,
        subtopics: [
          "Natural fibers (Cotton, Silk, Sisal)",
          "Fatty acids (Stearic acid, Oleic acid, Linoleic acid)",
          "Pharmaceutical applications",
        ],
      },
      {
        id: "pharmaco-unit-13",
        name: "Enzymes & Proteins",
        slug: "enzymes-proteins",
        description:
          "Important enzymes and proteins of pharmaceutical origin.",
        examHours: 8,
        examMarks: 8,
        subtopics: [
          "Important enzymes: Papain, Bromelain, Pancreatin, Pepsin",
          "Proteins: Gelatin, Albumin, Casein",
          "Pharmaceutical and therapeutic applications",
        ],
      },
      {
        id: "pharmaco-unit-14",
        name: "Natural Products as Drug Leads",
        slug: "natural-drug-leads",
        description:
          "Drug discovery from natural sources, biotechnology, and phytopharmaceuticals.",
        examHours: 10,
        examMarks: 8,
        subtopics: [
          "Drug discovery from natural sources",
          "Biotechnology in Pharmacognosy",
          "Phytopharmaceuticals and standardization",
          "Quality control of herbal drugs",
          "Regulatory aspects",
        ],
      },
    ],
  },
  {
    id: "biochemistry-microbiology",
    name: "Biochemistry & Microbiology",
    slug: "biochemistry-microbiology",
    description:
      "Molecular biology of living cells, metabolism, nucleic acids, immunology, microorganisms, sterilization, and microbial assay.",
    icon: "🔬",
    examMarks: 120,
    totalHours: 180,
    units: [
      {
        id: "bio-unit-1",
        name: "[Bio] Introduction to Biochemistry",
        slug: "intro-biochemistry",
        description:
          "Importance of biochemistry for health science.",
        examHours: 2,
        examMarks: 2,
        subtopics: [
          "Introduction to biochemistry",
          "Importance for health science",
        ],
      },
      {
        id: "bio-unit-2",
        name: "[Bio] Biomolecules",
        slug: "biomolecules",
        description:
          "Carbohydrates, amino acids, lipids, vitamins, and enzymes — metabolism and clinical significance.",
        examHours: 26,
        examMarks: 20,
        subtopics: [
          "Carbohydrates: Glycolysis, Citric acid cycle",
          "Amino acids, Peptides and Proteins: Urea cycle",
          "Lipids and fatty acids: Beta-oxidation",
          "Relation of Carbohydrate, Fat and Protein metabolism",
          "Vitamins",
          "Enzymes: Coenzymes, Isoenzymes",
        ],
      },
      {
        id: "bio-unit-3",
        name: "[Bio] Nucleic Acids & rDNA Technology",
        slug: "nucleic-acids",
        description:
          "DNA, RNA, replication, transcription, translation, recombinant DNA technology, PCR.",
        examHours: 20,
        examMarks: 15,
        subtopics: [
          "Nucleotides, nucleosides, nucleic acids, genes, chromosomes",
          "DNA vs RNA",
          "DNA replication, transcription, translation",
          "Recombinant DNA technology and pharmaceutical products",
          "Gene sequencing and PCR",
        ],
      },
      {
        id: "bio-unit-4",
        name: "[Bio] Laboratory & Diagnostic Tests",
        slug: "diagnostic-tests",
        description:
          "Common lab tests: CBC, LFT, KFT, thyroid, lipid profile, blood sugar, urine/stool analysis.",
        examHours: 6,
        examMarks: 5,
        subtopics: [
          "Complete Blood Count (CBC)",
          "Liver Function Test (LFT)",
          "Kidney Function Test (KFT)",
          "Thyroid Function Test",
          "Lipid Profile and Blood Sugar",
          "Urine and Stool analysis",
        ],
      },
      {
        id: "bio-unit-5",
        name: "[Bio] Fundamentals of Immunology",
        slug: "immunology",
        description:
          "Immunity, antigens, antibodies, vaccines, T and B lymphocytes.",
        examHours: 6,
        examMarks: 5,
        subtopics: [
          "Immunity and its types",
          "Antigens, Antibodies, Immunoglobulins",
          "Vaccines, Sera and Antisera",
          "Types of vaccines with examples",
          "T and B-lymphocytes comparison",
        ],
      },
      {
        id: "micro-unit-1",
        name: "[Micro] Introduction to Microbiology",
        slug: "intro-microbiology",
        description:
          "Definition, importance, branches, and history of pharmaceutical microbiology.",
        examHours: 5,
        examMarks: 5,
        subtopics: [
          "Definition and importance of microbiology",
          "Branches of microbiology",
          "Historical development of pharmaceutical microbiology",
          "Applications in pharmaceutical sciences",
        ],
      },
      {
        id: "micro-unit-2",
        name: "[Micro] Microorganisms",
        slug: "microorganisms",
        description:
          "Bacteria (morphology, gram staining, growth curve), viruses, and fungi.",
        examHours: 25,
        examMarks: 15,
        subtopics: [
          "Bacterial morphology and classification",
          "Gram positive vs Gram negative bacteria",
          "Bacterial growth curve",
          "Nutritional requirements and growth factors",
          "Culture media types and preparation",
          "Staining techniques (Simple, Gram, AFB staining)",
          "Bacterial resistance mechanisms",
          "Virus: definition, classification, morphology",
          "Fungi/Yeasts/Molds: definition, morphology, pharmaceutical importance",
        ],
      },
      {
        id: "micro-unit-3",
        name: "[Micro] Normal Flora",
        slug: "normal-flora",
        description:
          "Normal flora of skin, GIT, ear, nose, and genitourinary tract.",
        examHours: 4,
        examMarks: 3,
        subtopics: [
          "Normal flora of skin",
          "Normal flora of gastrointestinal tract",
          "Normal flora of ear, nose, and genitourinary tract",
          "Roles in normal physiology",
        ],
      },
      {
        id: "micro-unit-4",
        name: "[Micro] Sterilization",
        slug: "sterilization",
        description:
          "Methods of sterilization and disinfection, sterility testing.",
        examHours: 20,
        examMarks: 15,
        subtopics: [
          "Definition of sterilization and disinfection",
          "Methods of sterilization with examples",
          "Methods of disinfection with examples",
          "Sterility testing: Membrane filtration method and LAL test",
        ],
      },
      {
        id: "micro-unit-5",
        name: "[Micro] Microbiological Assay",
        slug: "microbiological-assay",
        description:
          "Microbial assay of antibiotics and vitamins.",
        examHours: 6,
        examMarks: 5,
        subtopics: [
          "Microbial assay of antibiotics (disc diffusion and tube dilution)",
          "Microbial assay of vitamins (cyanocobalamine)",
        ],
      },
    ],
  },
  {
    id: "pharmacotherapeutics-i",
    name: "Pharmacotherapeutics I",
    slug: "pharmacotherapeutics-i",
    description:
      "Clinical manifestation, pathophysiology, and pharmacological management of common diseases.",
    icon: "🏥",
    examMarks: 140,
    totalHours: 160,
    units: [
      {
        id: "thera-unit-1",
        name: "Gastrointestinal System",
        slug: "gi-system",
        description:
          "Vomiting, diarrhea, constipation, GERD, dysentery, hepatitis, jaundice, and peptic ulcer disease.",
        examHours: 30,
        examMarks: 15,
        subtopics: [
          "Definitions: Gastritis, Ulcer, Colitis, Pancreatitis, Dyspepsia",
          "Vomiting, Diarrhea, Constipation — causes, manifestations, treatment",
          "GERD — pathophysiology, pharmacological treatment",
          "Dysentery, Alcoholic liver disease",
          "Viral hepatitis and jaundice",
          "Peptic Ulcer Disease (PUD): Etiological classification, pathophysiology, treatment guidelines",
        ],
      },
      {
        id: "thera-unit-2",
        name: "Musculoskeletal Disorders",
        slug: "musculoskeletal",
        description:
          "Pain management, RA, OA, gout, spondylitis, osteoporosis, myasthenia gravis.",
        examHours: 15,
        examMarks: 10,
        subtopics: [
          "Pain pathways and WHO analgesic ladder",
          "Rheumatoid arthritis — management",
          "Osteoarthritis — management",
          "Gout — management",
          "Spondylitis — management",
          "Osteoporosis — management",
          "Myasthenia Gravis — management",
        ],
      },
      {
        id: "thera-unit-3",
        name: "Nervous System",
        slug: "nervous-system",
        description:
          "Epilepsy, Parkinsonism, stroke, depression, psychosis, anxiety, Alzheimer's, MS.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Motor neuron disease, Multiple sclerosis, Cerebral palsy, Alzheimer's Disease",
          "Epilepsy — pathophysiology, treatment",
          "Parkinsonism — pathophysiology, treatment",
          "Stroke — pathophysiology, treatment",
          "Depression — pharmacological treatment",
          "Psychotic disorders — treatment",
          "Anxiety disorders — treatment",
        ],
      },
      {
        id: "thera-unit-4",
        name: "Respiratory System",
        slug: "respiratory-system",
        description:
          "Asthma, COPD, bronchitis, pneumonia — causes, management, and treatment.",
        examHours: 30,
        examMarks: 15,
        subtopics: [
          "Pulmonary effusion, Emphysema, Cystic Fibrosis",
          "Asthma — causes, clinical features, treatment",
          "COPD — causes, clinical features, treatment",
          "Acute bronchitis — management",
          "Pneumonia — etiological classification, pathophysiology, treatment",
        ],
      },
      {
        id: "thera-unit-5",
        name: "Infectious Diseases",
        slug: "infectious-diseases",
        description:
          "TB (DOTS), meningitis, typhoid, cholera, UTI, malaria, HIV-AIDS, COVID-19, STDs, worm infestations.",
        examHours: 30,
        examMarks: 15,
        subtopics: [
          "Tuberculosis (DOTS therapy according to Nepal national guideline)",
          "Meningitis — diagnosis and management",
          "Gastroenteritis, Typhoid, Cholera",
          "Septicaemia, UTI",
          "Malaria, Kala-azar",
          "Fungal infections (Ring worm)",
          "Viral infections (Rhinitis, Herpes Zoster, Measles, Chicken pox, HIV-AIDS, SARS-COVID-19)",
          "Gonorrhoea and Syphilis",
          "Communicable diseases: Filariasis, Dengue, Dysentery, Giardiasis, Rabies, Influenza, Swine flu",
          "Worm infestations: Hookworm, Roundworm, Tapeworm",
        ],
      },
    ],
  },
  {
    id: "pharmaceutical-management",
    name: "Pharmaceutical Management",
    slug: "pharmaceutical-management",
    description:
      "Business management, supply chain, pharmaceutical marketing, entrepreneurship, and pharmacoeconomics.",
    icon: "📊",
    examMarks: 80,
    totalHours: 70,
    units: [
      {
        id: "mgmt-unit-1",
        name: "Fundamentals of Management",
        slug: "management-fundamentals",
        description:
          "Concept, principles, roles of manager, organizational structures, motivation, leadership, HRM.",
        examHours: 15,
        examMarks: 20,
        subtopics: [
          "Concept and function of management",
          "Principles and importance of management",
          "Management vs Administration",
          "Roles and responsibilities of a manager",
          "Stages of rational decision making",
          "Types of organizational structures",
          "Maslow's motivation theory",
          "Leadership: characteristics and styles",
          "HRM: objectives, importance, and functions",
        ],
      },
      {
        id: "mgmt-unit-2",
        name: "Pharmaceutical Logistics & Supply Chain",
        slug: "supply-chain",
        description:
          "Supply chain management, procurement, storage, and pharmacy management software.",
        examHours: 15,
        examMarks: 20,
        subtopics: [
          "Definition of supply chain management",
          "Components of pharmaceutical supply chain network",
          "Pharmaceutical Supply process",
          "Challenges in Pharmaceutical Supply Chain",
          "Medicine requirements estimation and tender process",
          "Storage of medicines including vaccines",
          "Pharmaceutical logistics for healthcare system",
          "Pharmacy Management Software importance",
        ],
      },
      {
        id: "mgmt-unit-3",
        name: "Pharmaceutical Marketing",
        slug: "pharmaceutical-marketing",
        description:
          "Marketing concepts, SWOT, market mix, segmentation, sales vs marketing, digital marketing.",
        examHours: 20,
        examMarks: 20,
        subtopics: [
          "Major marketing concepts and strategies",
          "SWOT analysis in marketing",
          "Market mix (7Ps)",
          "Segmentation, Positioning and Targeting",
          "Sales vs Marketing",
          "Sales promotion principles",
          "Emerging trends: Network marketing and Digital pharmaceutical marketing",
        ],
      },
      {
        id: "mgmt-unit-4",
        name: "Entrepreneurship & Innovation",
        slug: "entrepreneurship",
        description:
          "Definition, principles, types of entrepreneurs, and impact in Nepalese pharma sector.",
        examHours: 6,
        examMarks: 5,
        subtopics: [
          "Definition of entrepreneurship",
          "Principles and application in pharmacy",
          "Characteristics and types of entrepreneurs",
          "Impact in Nepalese pharmaceutical sector",
          "Causes for success and failure of business in Nepal",
        ],
      },
      {
        id: "mgmt-unit-5",
        name: "Pharmacoeconomics & Accounting",
        slug: "pharmacoeconomics",
        description:
          "Pharmacoeconomics principles, demand/supply, cost accounting, taxation, insurance, inventory management.",
        examHours: 14,
        examMarks: 15,
        subtopics: [
          "Definition, principle, importance, and application of Pharmacoeconomics",
          "Laws of demand and supply",
          "Cost and cost accounting concepts",
          "Taxation and its types",
          "Healthcare financing (Insurance) in Nepal",
          "Inventory management concepts and techniques",
        ],
      },
    ],
  },
  {
    id: "public-health-pharmacy",
    name: "Public Health Pharmacy",
    slug: "public-health-pharmacy",
    description:
      "Health education, healthcare delivery systems, pharmacoepidemiology, and environmental health.",
    icon: "🌍",
    examMarks: 80,
    totalHours: 140,
    units: [
      {
        id: "phs-unit-1",
        name: "Health Education",
        slug: "health-education",
        description:
          "Concept of health, principles of health education, learning, methods and media.",
        examHours: 30,
        examMarks: 15,
        subtopics: [
          "Definition of health",
          "Promotive, preventive, curative and rehabilitative health services",
          "Factors influencing health",
          "Principles of health education",
          "Importance of health education in pharmacy",
          "Definition of learning and ways of learning",
          "Factors affecting learning",
          "Health education methods (Individual, Group, Mass)",
          "Selection criteria for health education media",
        ],
      },
      {
        id: "phs-unit-2",
        name: "Health Care Delivery System in Nepal",
        slug: "healthcare-delivery",
        description:
          "Organogram, Primary Health Care, Alma Ata, PHC elements, MDG/SDG.",
        examHours: 20,
        examMarks: 10,
        subtopics: [
          "Current organogram of health care system of Nepal",
          "Primary Health Care and Alma Ata declaration",
          "Principles of Primary Health Care",
          "Elements of Primary Health Care",
          "Role of pharmacist in PHC",
          "Millennium Development Goals and SDG health aspects",
        ],
      },
      {
        id: "phs-unit-3",
        name: "Pharmacoepidemiology",
        slug: "pharmacoepidemiology",
        description:
          "Epidemiology concepts, disease transmission, measures of morbidity/mortality/risk, epidemiological studies.",
        examHours: 40,
        examMarks: 25,
        subtopics: [
          "Introduction, scope and uses of Epidemiology",
          "Definition and importance of Pharmacoepidemiology",
          "Disease transmission (Chain of Infection)",
          "Epidemiological triad (Agent, Host, Environment)",
          "Measures of morbidity (Incidence, Prevalence)",
          "Measures of mortality (Crude death rate, Specific death rate, Birth rate, IMR, MMR)",
          "Measures of risk (Relative risk, Attributable risk, Odds Ratio)",
          "Epidemic, Endemic and Pandemic",
          "Types of epidemiological studies (Descriptive, Analytical, Experimental)",
        ],
      },
      {
        id: "phs-unit-4",
        name: "Environmental Health",
        slug: "environmental-health",
        description:
          "Environment, water pollution, air pollution, waste management, food hygiene, occupational diseases.",
        examHours: 50,
        examMarks: 30,
        subtopics: [
          "Environment, Environmental Health, Sanitation and Hygiene",
          "Water quality standards (Physical, chemical, biological)",
          "Hard and soft water, removing hardness",
          "Water uses: Domestic, Public, Industrial, Agricultural",
          "Water pollutants and health impacts",
          "Water purification methods (Household: Boiling, Filtration, SODIS; Large-scale: Slow/Rapid sand filtration)",
          "Air pollution: health effects and control measures",
          "Solid and liquid waste management",
          "Waste segregation (color-coded bins)",
          "Solid waste disposal: Landfilling, composting, incineration",
          "Liquid waste management: Soakage pit, Septic tanks",
          "3R concept: Reuse, Reduce, Recycle",
          "Hospital waste management",
          "Food hygiene: importance, food intoxication vs infection",
          "Food fortification, additives, and adulteration",
          "Occupational health and safety, occupational diseases",
        ],
      },
    ],
  },
];

// Helper functions
export function getSubjectBySlug(slug: string): SubjectData | undefined {
  return subjects.find((s) => s.slug === slug);
}

export function getUnitById(unitId: string): UnitData | undefined {
  for (const subject of subjects) {
    const unit = subject.units.find((u) => u.id === unitId);
    if (unit) return unit;
  }
  return undefined;
}

export function getSubjectForUnit(unitId: string): SubjectData | undefined {
  return subjects.find((s) => s.units.some((u) => u.id === unitId));
}

export function getTotalUnits(): number {
  return subjects.reduce((acc, s) => acc + s.units.length, 0);
}

export function getTotalSubtopics(): number {
  return subjects.reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.subtopics.length, 0),
    0
  );
}
