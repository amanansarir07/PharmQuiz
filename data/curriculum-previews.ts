export interface PreviewSubject {
  name: string;
  code: string;
  icon: string;
  description: string;
  examMarks: number;
  totalHours: number;
  units: string[];
}

export interface ProgramCurriculumPreview {
  programSlug: string;
  regulatoryBody: string;
  regulatoryCode: string;
  stage: string;
  progressPercent: number;
  totalPlannedQuestions: number;
  plannedMockExams: number;
  gitBranch: string;
  lastUpdated: string;
  overviewSummary: string;
  subjects: PreviewSubject[];
  developmentMilestones: {
    title: string;
    description: string;
    status: "completed" | "in_progress" | "planned";
  }[];
}

export const CURRICULUM_PREVIEWS: Record<string, ProgramCurriculumPreview> = {
  "pcl-nursing": {
    programSlug: "pcl-nursing",
    regulatoryBody: "Nepal Nursing Council (NNC) & CTEVT",
    regulatoryCode: "CTEVT-NUR-2080",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 72,
    totalPlannedQuestions: 650,
    plannedMockExams: 10,
    gitBranch: "curriculum/pcl-nursing-v1",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "Comprehensive proficiency certificate nursing track covering patient care fundamentals, clinical diagnostics, maternal and child health, and Nepal Nursing Council licensure exam competencies.",
    subjects: [
      {
        name: "Fundamentals of Nursing & First Aid",
        code: "NUR-101",
        icon: "🩺",
        description:
          "Foundational nursing principles, patient hygiene, aseptic technique, vital signs monitoring, and emergency triage.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Introduction to Nursing Profession & Ethics",
          "Vital Signs & Clinical Assessment",
          "Aseptic Techniques & Hospital Infection Control",
          "Medication Administration & Safety",
          "Wound Care & Basic First Aid",
          "Patient Comfort & Bed Making Procedures",
        ],
      },
      {
        name: "Community Health Nursing & Epidemiology",
        code: "NUR-102",
        icon: "🌍",
        description:
          "Primary health care in Nepal, communicable disease surveillance, immunization schedules, and rural health administration.",
        examMarks: 100,
        totalHours: 100,
        units: [
          "Primary Health Care (PHC) Delivery in Nepal",
          "Epidemiology of Infectious Diseases",
          "Expanded Program on Immunization (EPI)",
          "Maternal, Neonatal & Child Health Services",
          "Environmental Sanitation & Safe Water Supply",
        ],
      },
      {
        name: "Anatomy & Physiology for Nurses",
        code: "NUR-103",
        icon: "🧬",
        description:
          "Structure and function of human bodily systems, organ physiology, homeostasis, and pathological correlates.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Cellular Biology & Tissue Architecture",
          "Musculoskeletal & Integumentary Systems",
          "Cardiovascular & Lymphatic Circulation",
          "Respiratory & Gas Exchange Physiology",
          "Digestive System & Clinical Metabolism",
          "Nervous & Endocrine Control Mechanisms",
        ],
      },
      {
        name: "Medical-Surgical Nursing",
        code: "NUR-201",
        icon: "🏥",
        description:
          "Care of adult medical-surgical patients, perioperative nursing, oncology, and intensive care interventions.",
        examMarks: 100,
        totalHours: 140,
        units: [
          "Perioperative Nursing & Anaesthesia Care",
          "Cardiovascular & Respiratory Disorders",
          "Gastrointestinal & Hepatic Pathologies",
          "Renal, Urinary & Electrolyte Imbalances",
          "Endocrine Disorders & Diabetes Management",
          "Oncology, Chemotherapy Care & Palliative Support",
        ],
      },
      {
        name: "Midwifery & Gynaecological Nursing",
        code: "NUR-202",
        icon: "👶",
        description:
          "Antenatal checkups, physiological labour management, postpartum monitoring, neonatal resuscitation, and family planning.",
        examMarks: 100,
        totalHours: 130,
        units: [
          "Antenatal Care & Foetal Development",
          "Physiology & Stages of Normal Labour",
          "Obstetric Complications & High-Risk Pregnancy",
          "Immediate Neonatal Assessment & Resuscitation",
          "Postpartum Care & Lactation Support",
          "Gynaecological Disorders & Reproductive Health",
        ],
      },
      {
        name: "Nursing Pharmacology & Therapeutics",
        code: "NUR-203",
        icon: "💊",
        description:
          "Drug classifications, pharmacokinetics, antimicrobial stewardship, dosage calculations, and adverse reaction management.",
        examMarks: 100,
        totalHours: 90,
        units: [
          "General Principles of Clinical Pharmacology",
          "Pediatric & Adult Dosage Calculations",
          "Antimicrobial Agents & Rational Use",
          "Autonomic & Cardiovascular Drugs",
          "Analgesics, Anaesthetics & Sedatives",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "Curriculum Schema Audit",
        description: "Verified subject boundaries against CTEVT 3-year PCL Nursing 2080 syllabus.",
        status: "completed",
      },
      {
        title: "Unit & Subtopic Mapping",
        description: "Mapped 34 high-yield units with learning competencies and exam marks.",
        status: "completed",
      },
      {
        title: "Question Bank Drafting",
        description: "Drafting 650 clinical case scenarios with detailed rationales.",
        status: "in_progress",
      },
      {
        title: "Nursing Council Board Review",
        description: "Peer evaluation by clinical nursing educators and preceptors.",
        status: "planned",
      },
      {
        title: "Full Mock Exam Deployment",
        description: "Timed 100-MCQ licensing examination simulation rollout.",
        status: "planned",
      },
    ],
  },

  "health-assistant": {
    programSlug: "health-assistant",
    regulatoryBody: "Nepal Health Professional Council (NHPC) & CTEVT",
    regulatoryCode: "CTEVT-HA-2080",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 68,
    totalPlannedQuestions: 600,
    plannedMockExams: 8,
    gitBranch: "curriculum/health-assistant-v1",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "Curriculum for General Medicine / Health Assistant practitioners serving as primary healthcare providers and health post in-charges across Nepal.",
    subjects: [
      {
        name: "Primary Health Care & Community Medicine",
        code: "HA-101",
        icon: "🌍",
        description:
          "Public health principles, National Health Policy of Nepal, health post administration, and epidemiological investigation.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Health Care Delivery Systems in Nepal",
          "Epidemiology of Endemic & Epidemic Diseases",
          "Maternal & Child Health / Safe Motherhood",
          "Environmental Sanitation, Vector & Waste Control",
          "Health Post Management & Recording / Reporting (HMIS)",
        ],
      },
      {
        name: "Clinical Anatomy & Physiology",
        code: "HA-102",
        icon: "🧬",
        description:
          "Systematic study of human organs, neurological reflexes, circulation, and clinical physiology.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Human Skeleton & Articulations",
          "Cardiopulmonary Physiology",
          "Gastrointestinal & Hepato-biliary Anatomy",
          "Nervous System & Special Senses",
          "Endocrine & Renal Excretion Physiology",
        ],
      },
      {
        name: "Clinical Pathology & Microbiology",
        code: "HA-103",
        icon: "🔬",
        description:
          "Basic laboratory investigations, haematology, urine and stool microscopy, and common tropical parasites.",
        examMarks: 100,
        totalHours: 90,
        units: [
          "Specimen Collection & Biosafety",
          "Routine Haematological Investigations",
          "Stool Examination for Helminths & Protozoa",
          "Urine Physical, Chemical & Microscopic Exam",
          "Common Bacterial & Viral Pathogens in Nepal",
        ],
      },
      {
        name: "Pharmacology & Rational Prescribing",
        code: "HA-201",
        icon: "💊",
        description:
          "Essential medicines list for Health Posts, antibiotic guidelines, toxicology, and emergency drug protocols.",
        examMarks: 100,
        totalHours: 100,
        units: [
          "Government of Nepal Essential Drugs List",
          "Antimicrobials, Anthelminthics & Antimalarials",
          "Cardiovascular & Respiratory Therapeutics",
          "Emergency Resuscitation Drugs",
          "Adverse Drug Reactions & Toxicity Management",
        ],
      },
      {
        name: "Clinical Medicine & Paediatrics",
        code: "HA-202",
        icon: "🩺",
        description:
          "Diagnosis and treatment of infectious diseases, respiratory infections, IMNCI protocols, and non-communicable diseases.",
        examMarks: 100,
        totalHours: 140,
        units: [
          "Infectious & Vector-Borne Diseases (TB, Malaria, Dengue)",
          "Integrated Management of Neonatal & Childhood Illness (IMNCI)",
          "Cardiovascular & Hypertension Management",
          "Respiratory Pathologies (COPD, Pneumonia, Asthma)",
          "Endocrine & Metabolic Disorders",
        ],
      },
      {
        name: "Basic Surgery, First Aid & Disaster Management",
        code: "HA-203",
        icon: "🩹",
        description:
          "Minor surgical procedures, suturing, shock management, fracture immobilization, and emergency trauma triage.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Sterilization & Surgical Asepsis",
          "Wound Debridement & Suturing Techniques",
          "Fractures, Dislocations & Splinting",
          "Burns, Electric Shock & Poisoning First Aid",
          "Disaster Preparedness & Mass Casualty Management",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "National Health Guidelines Review",
        description: "Cross-checked with MoHP Nepal & CTEVT Health Assistant syllabus.",
        status: "completed",
      },
      {
        title: "Clinical Competency Definition",
        description: "Categorized diagnosis, prescription, and triage modules.",
        status: "completed",
      },
      {
        title: "Primary Health MCQ Authoring",
        description: "Developing 600 high-yield items with practical clinical vignettes.",
        status: "in_progress",
      },
      {
        title: "Medical Officer Peer Review",
        description: "Verification by practicing District Hospital medical officers.",
        status: "planned",
      },
    ],
  },

  "cmlt": {
    programSlug: "cmlt",
    regulatoryBody: "Nepal Health Professional Council (NHPC) & CTEVT",
    regulatoryCode: "CTEVT-CMLT-2080",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 65,
    totalPlannedQuestions: 550,
    plannedMockExams: 6,
    gitBranch: "curriculum/cmlt-v1",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "Medical laboratory technology curriculum covering haematological profiling, biochemistry panels, clinical microbiology, and quality assurance.",
    subjects: [
      {
        name: "Clinical Haematology & Blood Banking",
        code: "CMLT-101",
        icon: "🩸",
        description:
          "Complete blood counts, haemoglobinometry, coagulation cascades, blood grouping, and cross-matching.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Haematopoiesis & Blood Cell Morphology",
          "Automated & Manual CBC Diagnostics",
          "Coagulation Profiles (PT, INR, APTT)",
          "Immunohematology & ABO/Rh Blood Grouping",
          "Donor Screening & Blood Component Therapy",
        ],
      },
      {
        name: "Clinical Biochemistry",
        code: "CMLT-102",
        icon: "🧪",
        description:
          "Enzyme assays, liver function tests, renal panels, lipid profiles, and photometric instrumentation.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Principles of Spectrophotometry & Colorimetry",
          "Carbohydrate Metabolism & Glucose Estimation",
          "Liver Function Tests (Bilirubin, SGOT, SGPT, ALP)",
          "Renal Profile (Urea, Creatinine, Uric Acid)",
          "Electrolytes & Arterial Blood Gas Basics",
        ],
      },
      {
        name: "Medical Microbiology & Parasitology",
        code: "CMLT-103",
        icon: "🔬",
        description:
          "Gram and AFB staining, bacterial culture media, antibiotic susceptibility testing, and parasitological smears.",
        examMarks: 100,
        totalHours: 130,
        units: [
          "Staining Techniques & Brightfield Microscopy",
          "Culture Media Preparation & Inoculation",
          "Antimicrobial Sensitivity Testing (Kirby-Bauer)",
          "Medical Mycology & Common Fungal Pathogens",
          "Intestinal & Blood Parasites (Giardia, Malaria)",
        ],
      },
      {
        name: "Histopathology & Cytological Techniques",
        code: "CMLT-201",
        icon: "🧫",
        description:
          "Tissue fixation, dehydration, embedding, microtomy, H&E staining, and Pap smear preparation.",
        examMarks: 100,
        totalHours: 90,
        units: [
          "Tissue Fixatives & Chemical Processing",
          "Microtome Sectioning & Ribbon Preparation",
          "Haematoxylin & Eosin (H&E) Staining",
          "Exfoliative Cytology & Pap Smears",
        ],
      },
      {
        name: "Laboratory Management & Biosafety",
        code: "CMLT-202",
        icon: "🛡️",
        description:
          "Quality control charts (Levey-Jennings), standard operating procedures, biosafety levels, and hazardous waste disposal.",
        examMarks: 100,
        totalHours: 70,
        units: [
          "Internal Quality Control (IQC) & Westgard Rules",
          "Biosafety Cabinets & Spill Management",
          "Laboratory Equipment Calibration & Maintenance",
          "Biohazard Waste Segregation & Autoclaving",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "Laboratory Syllabus Alignment",
        description: "Mapped against CTEVT 3-year CMLT curriculum standards.",
        status: "completed",
      },
      {
        title: "Test Methodology Taxonomy",
        description: "Standardized manual and automated laboratory diagnostic workflows.",
        status: "completed",
      },
      {
        title: "Question Item Generation",
        description: "Authoring laboratory calculations, image-based morphology, and quality control MCQs.",
        status: "in_progress",
      },
    ],
  },

  "d-physiotherapy": {
    programSlug: "d-physiotherapy",
    regulatoryBody: "Nepal Health Professional Council (NHPC) & CTEVT",
    regulatoryCode: "CTEVT-PHY-2080",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 60,
    totalPlannedQuestions: 500,
    plannedMockExams: 6,
    gitBranch: "curriculum/physiotherapy-v1",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "Diploma physiotherapy track specializing in kinesiology, therapeutic exercise, electrophysical modalities, and musculoskeletal rehabilitation.",
    subjects: [
      {
        name: "Human Anatomy & Kinesiology",
        code: "DPT-101",
        icon: "🦴",
        description:
          "Biomechanics of human movement, joint articulation, muscle levers, and functional gait kinematics.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Osteology & Arthrology of Upper & Lower Limbs",
          "Myology, Muscle Origins & Actions",
          "Biomechanics of Spine & Pelvic Girdle",
          "Kinetics & Kinematics of Human Gait",
        ],
      },
      {
        name: "Exercise Therapy & Remedial Gymnastics",
        code: "DPT-102",
        icon: "🏃",
        description:
          "Active, passive, and resisted movements, stretching protocols, manual therapy, and balance rehabilitation.",
        examMarks: 100,
        totalHours: 130,
        units: [
          "Range of Motion (ROM) & Goniometry",
          "Muscle Strength Grading (MMT)",
          "Stretching & Proprioceptive Neuromuscular Facilitation (PNF)",
          "Hydrotherapy & Postural Correction Exercises",
        ],
      },
      {
        name: "Electrotherapy & Physical Modalities",
        code: "DPT-103",
        icon: "⚡",
        description:
          "Therapeutic ultrasound, TENS, interferential therapy (IFT), shortwave diathermy (SWD), and cryotherapy.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Low Frequency Currents (TENS, Galvanic, Faradic)",
          "Medium Frequency Currents (IFT)",
          "High Frequency Currents & SWD",
          "Therapeutic Ultrasound & Light Therapy",
          "Cryotherapy & Superficial Heating Modalities",
        ],
      },
      {
        name: "Musculoskeletal & Orthopaedic Rehabilitation",
        code: "DPT-201",
        icon: "🩺",
        description:
          "Post-fracture rehabilitation, joint arthroplasty rehab, sports injuries, and spinal degenerative conditions.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Fracture Healing Stages & Post-Immobilization Care",
          "Ligamentous Sprains & Tendinopathies",
          "Spinal Disc Herniation & Cervical Spondylosis",
          "Joint Replacement Rehabilitation (THR, TKR)",
        ],
      },
      {
        name: "Neurological Physiotherapy",
        code: "DPT-202",
        icon: "🧠",
        description:
          "Rehabilitation for stroke, traumatic brain injury, spinal cord lesions, cerebral palsy, and peripheral neuropathies.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Stroke (Hemiplegia) Rehabilitation Protocols",
          "Spinal Cord Injury (Paraplegia/Quadriplegia) Care",
          "Cerebral Palsy Assessment & Motor Training",
          "Parkinson's Disease Functional Maintenance",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "CTEVT Physiotherapy Syllabus Alignment",
        description: "Verified core physical rehabilitation competencies.",
        status: "completed",
      },
      {
        title: "Biomechanical MCQ Mapping",
        description: "Structured questions for functional movement analysis.",
        status: "in_progress",
      },
    ],
  },

  "d-pharm-y1": {
    programSlug: "d-pharm-y1",
    regulatoryBody: "Nepal Pharmacy Council (NPC) & CTEVT",
    regulatoryCode: "CTEVT-DPHARM-Y1",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 70,
    totalPlannedQuestions: 500,
    plannedMockExams: 6,
    gitBranch: "curriculum/d-pharm-y1",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "First-year diploma pharmacy curriculum focusing on foundational sciences, basic pharmaceutical formulations, pharmacognosy, and human anatomy.",
    subjects: [
      {
        name: "Pharmaceutics I (Basics of Pharmacy)",
        code: "PH-101",
        icon: "💊",
        description:
          "History of pharmacy, pharmacopoeias, pharmaceutical calculations, and liquid dosage formulations.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Introduction to Pharmacy & Pharmacopoeias",
          "Pharmaceutical Weights & Measures (Metrology)",
          "Size Reduction & Size Separation",
          "Solutions, Syrups & Elixirs",
          "Packaging & Storage of Pharmaceuticals",
        ],
      },
      {
        name: "Pharmaceutical Chemistry I (Inorganic)",
        code: "PH-102",
        icon: "⚗️",
        description:
          "Inorganic pharmaceutical compounds, sources of impurities, limit tests, and diagnostic agents.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Sources of Impurities & Limit Tests (Cl, SO4, Fe, As)",
          "Gastrointestinal Agents (Antacids, Laxatives)",
          "Topical Agents & Antimicrobials",
          "Dental Products & Inhalants",
          "Radioactive Pharmaceuticals",
        ],
      },
      {
        name: "Pharmacognosy I",
        code: "PH-103",
        icon: "🌿",
        description:
          "Classification of crude drugs, collection and processing, adulteration, and herbal medicinal chemistry.",
        examMarks: 100,
        totalHours: 100,
        units: [
          "Definition & Historical Scope of Pharmacognosy",
          "Classification Systems for Crude Drugs",
          "Cultivation, Collection & Processing of Herbal Drugs",
          "Adulteration & Quality Evaluation of Crude Drugs",
          "Medicinal Plants of Nepal",
        ],
      },
      {
        name: "Human Anatomy & Physiology",
        code: "PH-104",
        icon: "🧬",
        description:
          "Cell structure, body tissues, skeletal system, cardiovascular system, and central nervous system.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Scope of Anatomy & Physiology / Cell Biology",
          "Elementary Tissues of the Human Body",
          "Skeletal & Muscular System",
          "Cardiovascular & Blood Circulation",
          "Respiratory & Digestive Systems",
        ],
      },
      {
        name: "Health Education & Community Pharmacy",
        code: "PH-105",
        icon: "🏥",
        description:
          "Concept of health and disease, communicable disease transmission, nutrition, and first aid.",
        examMarks: 100,
        totalHours: 90,
        units: [
          "Concept of Health, Disease & Prevention",
          "Nutrition & Balanced Diet in Nepal",
          "Epidemiology of Common Infectious Illnesses",
          "First Aid for Poisoning, Snakebites & Trauma",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "Year 1 Syllabus Scope Defined",
        description: "CTEVT 1st year foundational subjects audited.",
        status: "completed",
      },
      {
        title: "Pharmacognosy & Chemistry Items",
        description: "Drafting limit test and formulation MCQs.",
        status: "in_progress",
      },
    ],
  },

  "c-pharm": {
    programSlug: "c-pharm",
    regulatoryBody: "Nepal Pharmacy Council (NPC) & CTEVT",
    regulatoryCode: "CTEVT-CPHARM-2080",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 62,
    totalPlannedQuestions: 400,
    plannedMockExams: 5,
    gitBranch: "curriculum/c-pharm-v1",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "Certificate-level pharmacy assistant track emphasizing dispensing accuracy, inventory control, cold-chain preservation, and community pharmacy practice.",
    subjects: [
      {
        name: "Dispensing & Pharmacy Practice",
        code: "CP-101",
        icon: "💊",
        description:
          "Prescription reading, compounding basics, labelling standards, and patient counselling guidelines.",
        examMarks: 100,
        totalHours: 120,
        units: [
          "Prescription Anatomy & Legality",
          "Dispensing Procedures & Calculations",
          "Compounding of Mixtures, Powders & Ointments",
          "Labelling Requirements & Auxiliary Warnings",
          "Patient Counselling & Good Pharmacy Practice (GPP)",
        ],
      },
      {
        name: "Elementary Pharmacology & Therapeutics",
        code: "CP-102",
        icon: "🧪",
        description:
          "Common drug classes, dosages, indications, contraindications, and emergency antidote availability.",
        examMarks: 100,
        totalHours: 110,
        units: [
          "Routes of Drug Administration",
          "Common Analgesics & Anti-inflammatory Agents",
          "Broad-Spectrum Antibiotics & Proper Dosing",
          "Antacids & Anti-ulcer Medications",
          "Vitamins, Minerals & Rehydration Salts",
        ],
      },
      {
        name: "Drug Store Management & Inventory",
        code: "CP-103",
        icon: "📊",
        description:
          "Inventory control, FIFO/FEFO storage methods, cold chain maintenance, and drug laws of Nepal.",
        examMarks: 100,
        totalHours: 90,
        units: [
          "Drug Store Organization & Layout",
          "Procurement, Invoicing & Stock Register",
          "Storage Conditions & Vaccine Cold Chain",
          "Expiry Management (FEFO) & Recall Procedures",
          "Drugs Act 2035 & Nepal Pharmacy Council Code",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "Dispensing Competency Audit",
        description: "Aligned with community retail pharmacy standards.",
        status: "completed",
      },
      {
        title: "Question Drafting for Dispensing",
        description: "Authoring prescription verification and storage MCQs.",
        status: "in_progress",
      },
    ],
  },

  "plus-two-science-bio": {
    programSlug: "plus-two-science-bio",
    regulatoryBody: "National Examinations Board (NEB Nepal)",
    regulatoryCode: "NEB-SCI-BIO-2081",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 75,
    totalPlannedQuestions: 800,
    plannedMockExams: 12,
    gitBranch: "curriculum/neb-science-bio",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "NEB higher secondary science stream (Grades 11 & 12) tailored for students preparing for medical (CEE), pharmacy, nursing, and bioscience entrance examinations.",
    subjects: [
      {
        name: "Physics (Mechanics, Waves, Thermodynamics)",
        code: "NEB-PHY",
        icon: "⚡",
        description:
          "Newtonian mechanics, vectors, circular motion, heat engines, wave motion, geometrical optics, electricity, and modern physics.",
        examMarks: 75,
        totalHours: 150,
        units: [
          "Vectors, Kinematics & Laws of Motion",
          "Work, Energy, Power & Circular Dynamics",
          "Fluid Statics & Surface Tension",
          "First & Second Laws of Thermodynamics",
          "Wave Optics & Interference",
          "Electrostatics, Current Electricity & Magnetism",
          "Modern Physics, Photons & Radioactivity",
        ],
      },
      {
        name: "Chemistry (Physical, Inorganic & Organic)",
        code: "NEB-CHM",
        icon: "🧪",
        description:
          "Stoichiometry, chemical equilibrium, atomic models, periodic properties, transition metals, and organic functional groups.",
        examMarks: 75,
        totalHours: 150,
        units: [
          "Mole Concept & Chemical Calculations",
          "Atomic Structure & Chemical Bonding",
          "Chemical Kinetics & Equilibrium",
          "Non-metals (Halogens, Nitrogen, Oxygen families)",
          "Hydrocarbons (Alkanes, Alkenes, Alkynes)",
          "Haloalkanes, Alcohols & Phenols",
          "Aldehydes, Ketones & Carboxylic Acids",
        ],
      },
      {
        name: "Biology (Botany & Zoology)",
        code: "NEB-BIO",
        icon: "🧬",
        description:
          "Cell structure, plant taxonomy, plant physiology, animal tissues, human physiology, genetics, and evolutionary biology.",
        examMarks: 75,
        totalHours: 150,
        units: [
          "Cell Biology & Biomolecules",
          "Plant Diversity & Anatomy of Angiosperms",
          "Photosynthesis & Respiration in Plants",
          "Animal Kingdom Classification",
          "Human Digestive, Circulatory & Nervous Systems",
          "Genetics, Mendelian Inheritance & DNA Structure",
          "Ecology & Environmental Biology",
        ],
      },
      {
        name: "Mathematics",
        code: "NEB-MTH",
        icon: "📐",
        description:
          "Real numbers, trigonometry, algebra, coordinate geometry, differential and integral calculus, and vectors.",
        examMarks: 75,
        totalHours: 140,
        units: [
          "Set Theory, Relations & Functions",
          "Trigonometric Equations & Inverse Functions",
          "Matrices, Determinants & System of Linear Equations",
          "Limits, Continuity & Differentiation",
          "Indefinite & Definite Integrals",
          "Coordinate Geometry (Straight Lines, Conics)",
        ],
      },
      {
        name: "Compulsory English",
        code: "NEB-ENG",
        icon: "📚",
        description:
          "Grammar, comprehension, literary analysis, technical report writing, and communication skills.",
        examMarks: 75,
        totalHours: 100,
        units: [
          "Reading Comprehension & Critical Thinking",
          "Advanced English Grammar & Syntax",
          "Formal Letters, CVs & Report Writing",
          "Literary Prose, Poetry & Short Stories",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "NEB Grid Verification",
        description: "Verified with NEB Model Question Specification Grid 2081.",
        status: "completed",
      },
      {
        title: "High-Yield Medical Entrance Alignment",
        description: "Curated MCQs matching Common Entrance Examination (CEE) standards.",
        status: "in_progress",
      },
      {
        title: "Full Mock Test Architecture",
        description: "Setting up 75-mark and full-syllabus test banks.",
        status: "in_progress",
      },
    ],
  },

  "plus-two-computer": {
    programSlug: "plus-two-computer",
    regulatoryBody: "National Examinations Board (NEB Nepal)",
    regulatoryCode: "NEB-SCI-CS-2081",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 70,
    totalPlannedQuestions: 650,
    plannedMockExams: 8,
    gitBranch: "curriculum/neb-computer-science",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "NEB higher secondary computer science stream designed for aspiring software engineers, IT specialists, and computational researchers.",
    subjects: [
      {
        name: "Computer Science & Architecture",
        code: "NEB-CS",
        icon: "💻",
        description:
          "Computer generations, data representation (binary/hex), CPU components, memory hierarchy, and operating systems.",
        examMarks: 75,
        totalHours: 140,
        units: [
          "Computer Fundamentals & Architecture",
          "Number Systems & Boolean Algebra",
          "Operating System Concepts & Process Scheduling",
          "Computer Networks & Cyber Security Basics",
          "Software Engineering Principles",
        ],
      },
      {
        name: "Programming in C & C++",
        code: "NEB-PROG",
        icon: "⚙️",
        description:
          "Syntax, data types, control flow, functions, pointers, arrays, structures, file handling, and object-oriented fundamentals.",
        examMarks: 75,
        totalHours: 150,
        units: [
          "Algorithms, Flowcharts & Pseudo-code",
          "C Basics, Variables & Operators",
          "Control Statements (if-else, switch, loops)",
          "Functions & Recursion",
          "Pointers, Memory Allocation & Arrays",
          "Object-Oriented Programming in C++ (Classes, Inheritance)",
        ],
      },
      {
        name: "Web Technology & Database Management",
        code: "NEB-WEB",
        icon: "🌐",
        description:
          "HTML5 semantics, CSS3 styling, JavaScript DOM scripting, relational database concepts, and SQL queries.",
        examMarks: 75,
        totalHours: 130,
        units: [
          "HTML5 Markup & Semantic Layouts",
          "CSS3 Styling, Flexbox & Responsive Design",
          "Client-Side Scripting with JavaScript",
          "Database Architecture & Entity-Relationship Modeling",
          "Relational Database & Structured Query Language (SQL)",
        ],
      },
      {
        name: "Applied Mathematics",
        code: "NEB-MTH",
        icon: "📐",
        description:
          "Linear algebra, calculus, matrices, combinatorics, and discrete probability for computing.",
        examMarks: 75,
        totalHours: 140,
        units: [
          "Matrices & Determinants",
          "Differential Calculus & Applications",
          "Integral Calculus & Area Computation",
          "Discrete Mathematics & Combinatorics",
        ],
      },
      {
        name: "Compulsory English",
        code: "NEB-ENG",
        icon: "📚",
        description:
          "Language proficiency, technical documentation, essay writing, and communication for IT professionals.",
        examMarks: 75,
        totalHours: 100,
        units: [
          "Reading Comprehension & Critical Analysis",
          "Grammar & Usage for Technical Writing",
          "Project Proposal & Presentation Writing",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "Computer Curriculum Grid Mapped",
        description: "NEB Grades 11-12 IT curriculum verified.",
        status: "completed",
      },
      {
        title: "Code Snippet & Output MCQs",
        description: "Authoring conceptual C/C++ trace questions.",
        status: "in_progress",
      },
    ],
  },

  "plus-two-management": {
    programSlug: "plus-two-management",
    regulatoryBody: "National Examinations Board (NEB Nepal)",
    regulatoryCode: "NEB-MGMT-2081",
    stage: "Phase 2: Question Bank Authoring",
    progressPercent: 68,
    totalPlannedQuestions: 600,
    plannedMockExams: 8,
    gitBranch: "curriculum/neb-management",
    lastUpdated: "Kathmandu 2026",
    overviewSummary:
      "NEB higher secondary management stream for future business leaders, accountants, economists, and entrepreneurs.",
    subjects: [
      {
        name: "Principles of Accounting",
        code: "NEB-ACC",
        icon: "📊",
        description:
          "Double-entry bookkeeping, journalizing, ledger posting, trial balance, final accounts, and financial statement analysis.",
        examMarks: 75,
        totalHours: 150,
        units: [
          "Introduction to Accounting & GAAP Standards",
          "Journal, Cash Book & Subsidiary Ledgers",
          "Trial Balance & Accounting Rectification",
          "Financial Statements (Trading, Profit & Loss, Balance Sheet)",
          "Depreciation Accounting & Bank Reconciliation",
        ],
      },
      {
        name: "Economics (Micro & Macro)",
        code: "NEB-ECO",
        icon: "📈",
        description:
          "Theory of demand and supply, market structures, national income accounting, fiscal policy, and Nepal's economy.",
        examMarks: 75,
        totalHours: 140,
        units: [
          "Nature of Economics & Consumer Behaviour",
          "Law of Demand, Supply & Elasticity",
          "Production Costs & Market Structures",
          "National Income & Macroeconomic Indicators",
          "Money, Banking & Monetary Policy of Nepal",
        ],
      },
      {
        name: "Business Studies & Entrepreneurship",
        code: "NEB-BST",
        icon: "💼",
        description:
          "Forms of business organization, principles of management, human resource management, and enterprise creation.",
        examMarks: 75,
        totalHours: 130,
        units: [
          "Nature & Purpose of Business Activities",
          "Sole Proprietorship, Partnership & Joint Stock Companies",
          "Functions of Management (Planning, Organizing, Staffing, Directing)",
          "Entrepreneurship Development & Business Startups in Nepal",
        ],
      },
      {
        name: "Marketing & Office Management",
        code: "NEB-MKT",
        icon: "🏢",
        description:
          "Marketing mix (4Ps), consumer decision making, office procedures, records management, and business communication.",
        examMarks: 75,
        totalHours: 120,
        units: [
          "Marketing Concepts & Marketing Mix",
          "Advertising, Sales Promotion & Personal Selling",
          "Office Layout, Modern Office Appliances & Ergonomics",
          "Filing, Indexing & Official Correspondence",
        ],
      },
      {
        name: "Compulsory English",
        code: "NEB-ENG",
        icon: "📚",
        description:
          "Business communication, commercial correspondence, reading comprehension, and report preparation.",
        examMarks: 75,
        totalHours: 100,
        units: [
          "Business Letters, Memos & Formal Notices",
          "Grammar in Business Communication",
          "Critical Reading of Commercial Texts",
        ],
      },
    ],
    developmentMilestones: [
      {
        title: "Commerce Curriculum Grid Mapped",
        description: "NEB Grades 11-12 Management syllabus verified.",
        status: "completed",
      },
      {
        title: "Accounting & Economic Calculations",
        description: "Authoring numeric and conceptual business MCQs.",
        status: "in_progress",
      },
    ],
  },
};

const CURRICULUM_PREVIEW_ALIASES: Record<string, string> = {
  "c-pharm-y1": "c-pharm",
  "c-pharm-y2": "c-pharm",
  "c-pharm-y3": "c-pharm",
  "pcl-nursing-y1": "pcl-nursing",
  "pcl-nursing-y2": "pcl-nursing",
  "pcl-nursing-y3": "pcl-nursing",
  "health-assistant-y1": "health-assistant",
  "health-assistant-y2": "health-assistant",
  "health-assistant-y3": "health-assistant",
  "d-physiotherapy-y1": "d-physiotherapy",
  "d-physiotherapy-y2": "d-physiotherapy",
  "d-physiotherapy-y3": "d-physiotherapy",
  "cmlt-y1": "cmlt",
  "cmlt-y2": "cmlt",
  "cmlt-y3": "cmlt",
};

for (const [alias, source] of Object.entries(CURRICULUM_PREVIEW_ALIASES)) {
  const preview = CURRICULUM_PREVIEWS[source];
  if (preview) {
    CURRICULUM_PREVIEWS[alias] = {
      ...preview,
      programSlug: alias,
    };
  }
}

export function getCurriculumPreview(programSlug: string): ProgramCurriculumPreview | undefined {
  return CURRICULUM_PREVIEWS[programSlug];
}
