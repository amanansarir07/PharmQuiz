import type { SubjectData } from "@/data/types";

/**
 * D. Pharmacy · Year 3 curriculum (CTEVT syllabus).
 *
 * Subject slugs are prefixed with `d-pharm-y3-` to maintain uniqueness across
 * programmes in accordance with repo architecture rules.
 */
export const subjects: SubjectData[] = [
  {
    id: "d-pharm-y3-pharmaceutics-ii",
    name: "Pharmaceutics II",
    slug: "d-pharm-y3-pharmaceutics-ii",
    description:
      "Advanced dosage forms, tablets, capsules, biphasic systems, semisolids, parenterals, ophthalmic products, aerosols, and pharmaceutical quality assurance.",
    icon: "💊",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "pharm-ii-unit-1",
        name: "Oral Solid Dosage Forms (Tablets & Capsules)",
        slug: "oral-solid-dosage-forms",
        description:
          "Classification, excipients, granulation, compression defects, coating techniques, and capsule formulation.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Classification and formulation of tablets",
          "Tablet excipients (diluents, binders, disintegrants, lubricants, glidants)",
          "Granulation techniques (wet, dry, direct compression)",
          "Tablet compression machines and tooling",
          "Tablet compression defects (capping, lamination, sticking, picking, mottling, chipping)",
          "Tablet coating processes (sugar coating, film coating, enteric coating)",
          "Evaluation of tablets (hardness, friability, disintegration, dissolution, weight variation)",
          "Hard gelatin capsules (composition, shell manufacturing, sizes 000 to 5, filling)",
          "Soft gelatin capsules (composition, plasticizers, rotary die process)",
          "Quality control and stability of capsules",
        ],
      },
      {
        id: "pharm-ii-unit-2",
        name: "Biphasic Products & Semisolids",
        slug: "biphasic-products-semisolids",
        description:
          "Formulation and physical stability of emulsions, suspensions, ointments, creams, pastes, and gels.",
        examHours: 25,
        examMarks: 18,
        subtopics: [
          "Suspensions: flocculated vs deflocculated systems, sedimentation volume",
          "Suspending agents and formulation of pharmaceutical suspensions",
          "Emulsions: theories of emulsification, identification tests (dye, dilution, conductivity)",
          "Emulsifying agents (natural, synthetic, semi-synthetic, HLB value)",
          "Physical instabilities in emulsions (creaming, cracking, phase inversion, coalescence)",
          "Semisolid dosage forms: classification and properties of ointment bases",
          "Formulation and evaluation of ointments, creams, pastes, and gels",
        ],
      },
      {
        id: "pharm-ii-unit-3",
        name: "Packaging of Pharmaceutical Dosage Forms",
        slug: "pharmaceutical-packaging",
        description:
          "Primary, secondary and tertiary packaging materials, glass, plastics, metals, closures, blister/strip packs.",
        examHours: 12,
        examMarks: 10,
        subtopics: [
          "Functions and classification of packaging (primary, secondary, tertiary)",
          "Glass containers: types of glass (Type I, II, III, NP) and hydrolytic resistance test",
          "Plastic containers: polymers (polyethylene, polypropylene, PVC, PET), advantages and hazards",
          "Metals (aluminum, tin) and collapsible tubes",
          "Rubber closures: composition, coring, compatibility testing",
          "Blister packaging, strip packaging, and child-resistant closures",
          "Quality control tests for packaging materials",
        ],
      },
      {
        id: "pharm-ii-unit-4",
        name: "Pharmaceutical Aerosols & Inhalation Therapy",
        slug: "pharmaceutical-aerosols",
        description:
          "Components, propellants, valves, MDIs, DPIs, and nebulizers for pulmonary delivery.",
        examHours: 12,
        examMarks: 10,
        subtopics: [
          "Definition, advantages, and limitations of aerosol drug delivery",
          "Propellants: liquefied gases (CFCs, HFAs) and compressed gases",
          "Aerosol containers and valve assembly (metered dose valves, actuators)",
          "Formulation of pharmaceutical aerosols (solutions, suspensions, emulsions)",
          "Metered Dose Inhalers (MDIs), Dry Powder Inhalers (DPIs), and Nebulizers",
          "Quality control and evaluation of aerosols (leak test, flame extension, discharge rate)",
        ],
      },
      {
        id: "pharm-ii-unit-5",
        name: "Parenteral Preparations & Sterile Products",
        slug: "parenteral-preparations",
        description:
          "Small & large volume parenterals, vehicles, cleanrooms, pyrogen testing, and sterility testing.",
        examHours: 30,
        examMarks: 22,
        subtopics: [
          "Definition, routes of parenteral administration, advantages and disadvantages",
          "Small Volume Parenterals (SVP) vs Large Volume Parenterals (LVP / IV fluids)",
          "Aqueous vehicles (WFI, Sterile WFI, Bacteriostatic WFI) and non-aqueous vehicles",
          "Cleanroom classification, HEPA filtration, laminar airflow benches, aseptic processing",
          "Formulation additives: antioxidants, antimicrobial preservatives, buffers, tonicity adjusters",
          "Sterility testing methods (membrane filtration and direct inoculation)",
          "Pyrogen testing: Rabbit pyrogen test and Bacterial Endotoxin Test (LAL test)",
          "Particulate inspection and container closure integrity",
        ],
      },
      {
        id: "pharm-ii-unit-6",
        name: "Biological Products & Cold Chain Management",
        slug: "biological-products-cold-chain",
        description:
          "Vaccines, toxoids, sera, immunoglobulins, storage standards, and cold chain maintenance.",
        examHours: 12,
        examMarks: 10,
        subtopics: [
          "Classification of biologicals: live attenuated, inactivated vaccines, toxoids, antisera",
          "Manufacturing principles and storage of immunological products",
          "National immunization cold chain requirements in Nepal (2°C to 8°C)",
          "Vaccine Vial Monitor (VVM) stages and usability guidelines",
          "Adverse events following immunization (AEFI) awareness",
        ],
      },
      {
        id: "pharm-ii-unit-7",
        name: "Dispensing Pharmacy & Incompatibilities",
        slug: "dispensing-pharmacy-incompatibilities",
        description:
          "Prescriptions, Latin terminology, pediatric dose calculations, and pharmaceutical incompatibilities.",
        examHours: 20,
        examMarks: 15,
        subtopics: [
          "Parts of a medical prescription and legal dispensing responsibilities",
          "Official Latin terms, pharmaceutical abbreviations, and directions",
          "Posology and pediatric dose calculations (Young's rule, Dilling's rule, Clark's rule, Fried's rule)",
          "Physical incompatibilities (liquefaction, immiscibility, insolubility) and remedies",
          "Chemical incompatibilities (precipitation, gas evolution, oxidation) and remedies",
          "Therapeutic incompatibilities (drug interactions, contraindications, synergistic toxicity)",
          "Labelling requirements and patient cautionary advisories",
        ],
      },
      {
        id: "pharm-ii-unit-8",
        name: "Suppositories & Pessaries",
        slug: "suppositories-pessaries",
        description:
          "Types, suppository bases, displacement value, fusion moulding, and quality evaluation.",
        examHours: 12,
        examMarks: 8,
        subtopics: [
          "Types of suppositories (rectal suppositories, vaginal pessaries, urethral bougies)",
          "Ideal suppository bases: fatty bases (theobroma oil/cocoa butter), hydrophilic bases (PEG, glycerogelatin)",
          "Polymorphism of theobroma oil (alpha, beta, gamma forms)",
          "Displacement value: concept, practical calculation, and significance",
          "Manufacturing by fusion moulding and lubrication of moulds",
          "Quality evaluation: breaking test, melting range, liquefaction time",
        ],
      },
      {
        id: "pharm-ii-unit-9",
        name: "Ophthalmic Preparations",
        slug: "ophthalmic-preparations",
        description:
          "Eye drops, eye lotions, eye ointments, tonicity calculation, buffers, and preservation.",
        examHours: 12,
        examMarks: 8,
        subtopics: [
          "Physiological factors and essential requirements of ophthalmic products (sterility, tonicity, clarity)",
          "Isotonicity calculation: sodium chloride equivalent and freezing point depression methods",
          "Ophthalmic preservatives (benzalkonium chloride, chlorobutanol, thiomersal)",
          "Viscosity increasing agents (HPMC, methylcellulose, polyvinyl alcohol)",
          "Formulation and filling of sterile eye drops and eye ointments",
          "Packaging and in-use stability of multi-dose ophthalmic containers",
        ],
      },
      {
        id: "pharm-ii-unit-10",
        name: "Quality Assurance & Good Manufacturing Practice",
        slug: "quality-assurance-gmp",
        description:
          "QA vs QC, WHO-GMP guidelines, SOPs, validation, and stability testing.",
        examHours: 15,
        examMarks: 10,
        subtopics: [
          "Definitions and functional differences between QA and QC",
          "Core principles of Good Manufacturing Practice (GMP / WHO-GMP)",
          "Documentation, Standard Operating Procedures (SOPs), and Batch Manufacturing Records (BMR)",
          "In-process quality control (IPQC) for solid and liquid manufacturing",
          "Validation: process validation, equipment qualification (DQ, IQ, OQ, PQ)",
          "ICH stability testing: climatic zones, real-time vs accelerated stability testing",
        ],
      },
      {
        id: "pharm-ii-unit-11",
        name: "Surgical Devices, Dressings & Medical Appliances",
        slug: "surgical-devices-appliances",
        description:
          "Sutures, ligatures, wound dressings, bandages, catheters, IV sets, and syringes.",
        examHours: 10,
        examMarks: 4,
        subtopics: [
          "Surgical sutures and ligatures: absorbable (catgut, synthetic polyglycolic acid) vs non-absorbable (silk, nylon)",
          "Primary wound dressings, absorbent cotton wool, surgical gauze, bandages",
          "Plaster of Paris and adhesive surgical tapes",
          "Cannulas, urinary catheters, IV administration sets, and hypodermic syringes",
          "Sterilization methods and regulatory quality standards for surgical appliances",
        ],
      },
    ],
  },
  {
    id: "d-pharm-y3-pharmacology-ii",
    name: "Pharmacology II",
    slug: "d-pharm-y3-pharmacology-ii",
    description:
      "Drugs acting on the cardiovascular, central nervous, and endocrine systems, autacoids, cancer chemotherapy, and toxicology.",
    icon: "💉",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "pharmaco-ii-unit-1",
        name: "Cardiovascular System Drugs",
        slug: "cardiovascular-system-drugs",
        description:
          "Antihypertensives, antianginals, heart failure drugs, antiarrhythmics, and lipid-lowering drugs.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Antihypertensive agents (ACEi, ARBs, CCBs, beta-blockers, diuretics)",
          "Antianginal drugs (organic nitrates, beta-blockers, calcium channel blockers)",
          "Drugs for congestive heart failure (cardiac glycosides, digoxin, ACE inhibitors)",
          "Antiarrhythmic agents (Vaughan Williams classification)",
          "Hypolipidemic drugs (statins, fibrates, bile acid sequestrants)",
        ],
      },
      {
        id: "pharmaco-ii-unit-2",
        name: "Central Nervous System Drugs",
        slug: "central-nervous-system-drugs",
        description:
          "Sedatives, hypnotics, antiepileptics, antipsychotics, antidepressants, and opioid analgesics.",
        examHours: 40,
        examMarks: 30,
        subtopics: [
          "General and local anesthetics",
          "Sedatives and hypnotics (benzodiazepines, barbiturates)",
          "Antiepileptic drugs (phenytoin, carbamazepine, sodium valproate)",
          "Antipsychotics and mood stabilizers",
          "Antidepressants (SSRIs, TCAs, SNRIs)",
          "Opioid analgesics and antagonists (morphine, codeine, tramadol, naloxone)",
        ],
      },
      {
        id: "pharmaco-ii-unit-3",
        name: "Drugs Acting on Hemopoietic System",
        slug: "drugs-hemopoietic-system",
        description:
          "Coagulants, anticoagulants, antiplatelets, fibrinolytics, and hematinics.",
        examHours: 20,
        examMarks: 15,
        subtopics: [
          "Anticoagulants (heparin, low-molecular-weight heparins, warfarin)",
          "Antiplatelet drugs (aspirin, clopidogrel)",
          "Fibrinolytics and antifibrinolytics",
          "Hematinics (iron preparations, folic acid, vitamin B12)",
        ],
      },
      {
        id: "pharmaco-ii-unit-4",
        name: "Endocrine & Hormonal Drugs",
        slug: "endocrine-hormonal-drugs",
        description:
          "Insulin, oral hypoglycemics, thyroid/antithyroid drugs, corticosteroids, and oral contraceptives.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Insulin preparations and oral hypoglycemic agents (metformin, sulfonylureas, DPP-4 inhibitors)",
          "Thyroid hormones and antithyroid agents (carbimazole, propylthiouracil)",
          "Corticosteroids (hydrocortisone, prednisolone, dexamethasone)",
          "Sex hormones and oral hormonal contraceptives",
          "Drugs affecting calcium metabolism and bone health",
        ],
      },
      {
        id: "pharmaco-ii-unit-5",
        name: "Autacoids & Related Drugs",
        slug: "autacoids-related-drugs",
        description:
          "Histamine and antihistamines, serotonin, prostaglandins, and leukotriene antagonists.",
        examHours: 20,
        examMarks: 15,
        subtopics: [
          "Histamine and H1/H2-receptor antagonists",
          "5-HT (Serotonin) and its antagonists (triptans, ondansetron)",
          "Prostaglandins, thromboxanes, and leukotrienes",
        ],
      },
      {
        id: "pharmaco-ii-unit-6",
        name: "Chemotherapy of Neoplastic Diseases",
        slug: "chemotherapy-neoplastic-diseases",
        description:
          "General principles of cancer chemotherapy, cytotoxic agents, and management of toxicity.",
        examHours: 25,
        examMarks: 15,
        subtopics: [
          "General principles of antineoplastic chemotherapy",
          "Alkylating agents, antimetabolites, and natural plant products",
          "Hormonal and targeted antineoplastic therapy",
          "Common adverse effects of cytotoxic drugs and supportive care",
        ],
      },
      {
        id: "pharmaco-ii-unit-7",
        name: "Toxicology & Management of Poisoning",
        slug: "toxicology-poisoning-management",
        description:
          "General management of acute poisoning, organophosphate poisoning, snakebite, and specific antidotes.",
        examHours: 25,
        examMarks: 15,
        subtopics: [
          "General principles and emergency management of acute poisoning",
          "Organophosphate (OP) poisoning, atropine, and pralidoxime therapy",
          "Heavy metal toxicity and chelating agents (dimercaprol, penicillamine, EDTA)",
          "Snake envenomation and antivenom therapy in Nepal",
          "Common drug poisonings (paracetamol, opioids, benzodiazepines) and specific antidotes",
        ],
      },
    ],
  },
  {
    id: "d-pharm-y3-pharmaceutical-chemistry-ii",
    name: "Pharmaceutical Chemistry II",
    slug: "d-pharm-y3-pharmaceutical-chemistry-ii",
    description:
      "Medicinal chemistry, nomenclature, chemical structure, structure-activity relationship (SAR), and synthesis of therapeutic agents.",
    icon: "⚗️",
    examMarks: 140,
    totalHours: 200,
    units: [
      {
        id: "chem-ii-unit-1",
        name: "Medicinal Chemistry of Cardiovascular Drugs",
        slug: "medicinal-chemistry-cardiovascular",
        description:
          "Structure, chemical classification, and SAR of antihypertensives, nitrates, and statins.",
        examHours: 40,
        examMarks: 30,
        subtopics: [
          "Chemical classification and SAR of ACE inhibitors and ARBs",
          "Calcium channel blockers: 1,4-dihydropyridines chemistry",
          "Organic nitrates and vasodilator chemistry",
          "Beta-adrenergic receptor blockers SAR",
          "HMG-CoA reductase inhibitors (statins) chemical structure",
        ],
      },
      {
        id: "chem-ii-unit-2",
        name: "Medicinal Chemistry of CNS Drugs",
        slug: "medicinal-chemistry-cns",
        description:
          "Chemical structure and SAR of sedatives, hypnotics, antiepileptics, and analgesics.",
        examHours: 45,
        examMarks: 30,
        subtopics: [
          "Barbiturates and benzodiazepines SAR and synthesis",
          "Hydantoin and iminostilbene antiepileptics",
          "Phenothiazine and butyrophenone antipsychotics",
          "Tricyclic and SSRI antidepressant chemistry",
          "Morphine alkaloids and synthetic opioid derivatives",
        ],
      },
      {
        id: "chem-ii-unit-3",
        name: "Chemotherapeutic & Antineoplastic Agents",
        slug: "chemotherapeutic-agents-chemistry",
        description:
          "Chemistry of alkylating agents, antimetabolites, and synthetic antimicrobials.",
        examHours: 45,
        examMarks: 30,
        subtopics: [
          "Chemistry of alkylating agents (nitrogen mustards, nitrosoureas)",
          "Antimetabolites: folic acid, purine, and pyrimidine analogs",
          "Fluoroquinolones SAR and chemistry",
          "Antitubercular and antimalarial chemical agents",
        ],
      },
      {
        id: "chem-ii-unit-4",
        name: "Medicinal Chemistry of Hormones & Steroids",
        slug: "medicinal-chemistry-hormones-steroids",
        description:
          "Steroid nomenclature, corticosteroids, sex hormones, and oral antidiabetic agents.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Steroidal skeleton nomenclature and stereochemistry",
          "Glucocorticoids and mineralocorticoids SAR",
          "Estrogens, progestins, and androgens chemistry",
          "Sulfonylurea and biguanide antidiabetic chemistry",
        ],
      },
      {
        id: "chem-ii-unit-5",
        name: "Vitamins, Coenzymes & Diagnostic Agents",
        slug: "vitamins-diagnostic-agents",
        description:
          "Chemical structures of water-soluble/fat-soluble vitamins, coenzymes, and radio-opaque contrast media.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Chemistry of fat-soluble vitamins (A, D, E, K)",
          "Chemistry of water-soluble vitamins (B-complex, C)",
          "Coenzymes and biochemical significance",
          "Diagnostic dyes and iodinated contrast media",
        ],
      },
    ],
  },
  {
    id: "d-pharm-y3-hospital-clinical-pharmacy",
    name: "Hospital and Clinical Pharmacy",
    slug: "d-pharm-y3-hospital-clinical-pharmacy",
    description:
      "Hospital pharmacy organization, drug distribution systems, clinical pharmacy, TDM, ADR monitoring, and patient counseling.",
    icon: "🏥",
    examMarks: 100,
    totalHours: 150,
    units: [
      {
        id: "hosp-unit-1",
        name: "Hospital Pharmacy Organization & Management",
        slug: "hospital-pharmacy-organization",
        description:
          "Hospital classification, pharmacy layout, staffing, Pharmacy & Therapeutics Committee (PTC), and hospital formulary.",
        examHours: 25,
        examMarks: 18,
        subtopics: [
          "Organization, functions, and role of hospital pharmacy in Nepal",
          "Pharmacy and Therapeutics Committee (PTC): composition, duties, policies",
          "Hospital Formulary: development, contents, maintenance, and revision",
          "Hospital drug procurement and inventory control methods",
          "Safe storage and handling of narcotics and controlled substances in hospitals",
        ],
      },
      {
        id: "hosp-unit-2",
        name: "Hospital Drug Distribution Systems",
        slug: "drug-distribution-systems",
        description:
          "Inpatient and outpatient drug distribution, unit dose dispensing, automated systems, and ward stock.",
        examHours: 25,
        examMarks: 18,
        subtopics: [
          "Outpatient dispensing procedures and ambulatory care services",
          "Inpatient drug distribution: individual prescription order system",
          "Complete floor stock system and emergency drug kits",
          "Unit Dose Dispensing System (UDDS): centralized vs decentralized",
          "Distribution of controlled substances, hazardous drugs, and radio-pharmaceuticals",
        ],
      },
      {
        id: "hosp-unit-3",
        name: "Central Sterile Services & Intravenous Admixtures",
        slug: "sterile-services-iv-admixtures",
        description:
          "CSSD, sterile product preparation, IV admixture services, and total parenteral nutrition (TPN).",
        examHours: 25,
        examMarks: 16,
        subtopics: [
          "Central Sterile Supply Department (CSSD): workflow, sterilization monitoring",
          "Intravenous (IV) admixture services and aseptic technique",
          "Total Parenteral Nutrition (TPN): composition, compounding, stability",
          "Safe preparation and handling of cytotoxic hazardous medications",
        ],
      },
      {
        id: "hosp-unit-4",
        name: "Clinical Pharmacy & Patient Care",
        slug: "clinical-pharmacy-patient-care",
        description:
          "Clinical pharmacy practice, medication history interview, chart review, and patient counseling.",
        examHours: 35,
        examMarks: 24,
        subtopics: [
          "Concept, scope, and daily activities of clinical pharmacists",
          "Medication history interviewing and documentation (SOAP format)",
          "Inpatient chart review and identification of drug-related problems (DRPs)",
          "Patient counseling skills: chronic illnesses (hypertension, diabetes, asthma)",
          "Special patient populations: pediatrics, geriatrics, pregnancy, renal/hepatic impairment",
        ],
      },
      {
        id: "hosp-unit-5",
        name: "Therapeutic Drug Monitoring & Pharmacovigilance",
        slug: "tdm-pharmacovigilance",
        description:
          "TDM indications, drug interactions, adverse drug reaction (ADR) reporting, and pharmacovigilance in Nepal.",
        examHours: 40,
        examMarks: 24,
        subtopics: [
          "Therapeutic Drug Monitoring (TDM): indications, narrow therapeutic index drugs (digoxin, phenytoin, aminoglycosides)",
          "Drug-drug, drug-food, and drug-disease interactions",
          "Pharmacovigilance: classification of Adverse Drug Reactions (ADRs)",
          "National Pharmacovigilance Centre (DDA Nepal) and yellow form reporting",
          "Medication errors: types, root causes, prevention strategies",
        ],
      },
    ],
  },
  {
    id: "d-pharm-y3-jurisprudence-community-practice",
    name: "Pharmaceutical Jurisprudence and Community Pharmacy Practice",
    slug: "d-pharm-y3-jurisprudence-community-practice",
    description:
      "Drug regulations of Nepal, Drug Act 2035, NPC Act, National Health Policy, and Good Community Pharmacy Practice.",
    icon: "⚖️",
    examMarks: 100,
    totalHours: 150,
    units: [
      {
        id: "juris-unit-1",
        name: "Pharmaceutical Legislation in Nepal",
        slug: "pharmaceutical-legislation-nepal",
        description:
          "Historical development of drug legislation, Drug Act 2035, and relevant regulatory bodies.",
        examHours: 30,
        examMarks: 20,
        subtopics: [
          "History and evolution of pharmaceutical laws and regulatory framework in Nepal",
          "Drug Act 2035 (1978) and its key objectives",
          "Classification of drugs and regulatory schedules under Drug Act 2035",
          "Department of Drug Administration (DDA): structure, inspection powers, functions",
          "Drug standard regulations and banned drug list in Nepal",
        ],
      },
      {
        id: "juris-unit-2",
        name: "Pharmacy Council Act & Professional Ethics",
        slug: "pharmacy-council-ethics",
        description:
          "Nepal Pharmacy Council Act 2057, registration categories, code of conduct, and disciplinary actions.",
        examHours: 25,
        examMarks: 18,
        subtopics: [
          "Nepal Pharmacy Council (NPC) Act 2057 and NPC Regulations",
          "Registration of Pharmacists and Pharmacy Assistants (Category A, B, C)",
          "NPC Code of Conduct and professional ethics for pharmacy practice",
          "Powers, duties, and disciplinary procedures of Nepal Pharmacy Council",
          "Continuing Pharmacy Education (CPE) and registration renewal requirements",
        ],
      },
      {
        id: "juris-unit-3",
        name: "Special Acts & National Health Policies",
        slug: "special-acts-health-policies",
        description:
          "Narcotic Drugs Control Act 2033, National Drug Policy 1995, and National Health Policy.",
        examHours: 25,
        examMarks: 18,
        subtopics: [
          "Narcotic Drugs (Control) Act 2033 (1976): definitions, control, legal penalties",
          "National Drug Policy 1995: objectives, rational drug use, local production",
          "National Health Policy of Nepal and essential medicines concept",
          "Consumer Protection Act provisions relevant to healthcare and medications",
          "Good Distribution Practice (GDP) and Good Storage Practice (GSP)",
        ],
      },
      {
        id: "juris-unit-4",
        name: "Good Community Pharmacy Practice",
        slug: "good-community-pharmacy-practice",
        description:
          "Community pharmacy setup, layout, legal licenses, Good Dispensing Practices (GDP), and cold chain.",
        examHours: 35,
        examMarks: 22,
        subtopics: [
          "Role, duties, and responsibilities of community pharmacists in healthcare delivery",
          "Physical layout, space, equipment, and licensing criteria for retail/wholesale pharmacy in Nepal",
          "Good Dispensing Practice (GDP): checking, packaging, labelling, and patient instructions",
          "Cold chain management and storage standards for temperature-sensitive drugs",
          "Inventory control, expiry date tracking, and management of returned/damaged goods",
        ],
      },
      {
        id: "juris-unit-5",
        name: "Community Health Services & OTC Counseling",
        slug: "community-health-otc-counseling",
        description:
          "Primary health care, OTC medication counseling, health promotion, and point-of-care screening.",
        examHours: 35,
        examMarks: 22,
        subtopics: [
          "Community pharmacy in Primary Health Care (PHC) and immunization support",
          "Over-The-Counter (OTC) vs prescription-only medicines dispensing protocols",
          "Patient counseling for common self-limiting ailments (coughs, minor pain, diarrhea)",
          "Point-of-care screening services: blood pressure, blood glucose monitoring",
          "Health promotion, family planning advisories, and anti-smoking counseling",
        ],
      },
    ],
  },
  {
    id: "d-pharm-y3-pharmacotherapeutics-ii",
    name: "Pharmacotherapeutics II",
    slug: "d-pharm-y3-pharmacotherapeutics-ii",
    description:
      "Etiology, clinical manifestations, pathophysiology, pharmacotherapy, and treatment guidelines of complex diseases.",
    icon: "🩺",
    examMarks: 140,
    totalHours: 160,
    units: [
      {
        id: "thera-ii-unit-1",
        name: "Cardiovascular Disorders",
        slug: "cardiovascular-disorders",
        description:
          "Pharmacotherapy of hypertension, ischemic heart disease, heart failure, and dyslipidemia.",
        examHours: 35,
        examMarks: 25,
        subtopics: [
          "Hypertension: classification, JNC/ESC clinical guidelines, stepped-care pharmacotherapy",
          "Ischemic Heart Disease: angina pectoris, acute myocardial infarction management",
          "Congestive Heart Failure: NYHA staging, pharmacological treatment algorithm",
          "Cardiac Arrhythmias: clinical presentation and treatment approaches",
          "Hyperlipidemia and atherosclerosis: risk stratification and lipid-lowering therapy",
        ],
      },
      {
        id: "thera-ii-unit-2",
        name: "Endocrine & Metabolic Disorders",
        slug: "endocrine-metabolic-disorders",
        description:
          "Pharmacotherapy of Diabetes Mellitus, thyroid disorders, and osteoporosis.",
        examHours: 30,
        examMarks: 25,
        subtopics: [
          "Diabetes Mellitus Type 1 and Type 2: diagnostic criteria, ADA guidelines, oral vs insulin therapy",
          "Diabetic emergencies: Diabetic Ketoacidosis (DKA) and hypoglycemia management",
          "Hypothyroidism and Hyperthyroidism: clinical manifestations and treatment protocols",
          "Osteoporosis: pathophysiology, calcium/vitamin D supplementation, bisphosphonate therapy",
        ],
      },
      {
        id: "thera-ii-unit-3",
        name: "Renal & Urinary Tract Disorders",
        slug: "renal-urinary-disorders",
        description:
          "Acute kidney injury, chronic kidney disease (CKD), and drug-induced nephrotoxicity.",
        examHours: 25,
        examMarks: 20,
        subtopics: [
          "Acute Kidney Injury (AKI): etiology, diagnostic markers, pharmacological support",
          "Chronic Kidney Disease (CKD): KDIGO stages, anemia and electrolyte management",
          "Drug dosing adjustments in renal impairment based on creatinine clearance (CrCl)",
          "Drug-induced nephrotoxicity: offending agents (NSAIDs, aminoglycosides, contrast dyes) and prevention",
        ],
      },
      {
        id: "thera-ii-unit-4",
        name: "Hematological & Oncological Disorders",
        slug: "hematological-oncological-disorders",
        description:
          "Anemias, thromboembolic disorders, common cancers, and cancer supportive care.",
        examHours: 35,
        examMarks: 35,
        subtopics: [
          "Iron deficiency anemia, megaloblastic anemia, and aplastic anemia pharmacotherapy",
          "Deep vein thrombosis (DVT) and pulmonary embolism: prophylaxis and anticoagulation protocols",
          "General principles of cancer pharmacotherapy and regimens for common malignancies",
          "Management of chemotherapy-induced nausea and vomiting (CINV)",
          "Febrile neutropenia and pain management in oncology patients (WHO ladder)",
        ],
      },
      {
        id: "thera-ii-unit-5",
        name: "Dermatological & Ophthalmic Disorders",
        slug: "dermatological-ophthalmic-disorders",
        description:
          "Pharmacotherapy of acne, eczema, psoriasis, glaucoma, and ocular infections.",
        examHours: 35,
        examMarks: 35,
        subtopics: [
          "Acne vulgaris: topical and systemic therapies",
          "Eczema, contact dermatitis, and psoriasis: corticosteroid potency and emollients",
          "Fungal and bacterial skin infections: topical vs systemic antifungal/antibacterial regimens",
          "Glaucoma (open-angle vs closed-angle): prostaglandin analogs, beta-blockers, carbonic anhydrase inhibitors",
          "Conjunctivitis, blepharitis, and dry eye syndrome clinical management",
        ],
      },
    ],
  },
];
