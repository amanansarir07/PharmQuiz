import json

def add(filename, qs):
    with open(filename, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    texts = {q['question_text'] for q in existing}
    added = 0
    for q in qs:
        if q['question_text'] not in texts:
            existing.append(q)
            texts.add(q['question_text'])
            added += 1
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    print(f"Added {added} questions. Total: {len(existing)}")

questions = [
    {
        "question_text": "What is the primary purpose of a hospital formulary?",
        "options": {"a": "To increase hospital revenue", "b": "To list medicines approved for use in the hospital", "c": "To replace all generic drugs with brands", "d": "To limit patient access to medication"},
        "correct_option": "b",
        "explanation": "A hospital formulary is a list of medicines that are approved for prescribing within a hospital. It helps standardize drug therapy, control costs, and ensure quality.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["hospital pharmacy", "formulary"]
    },
    {
        "question_text": "Who is responsible for managing the hospital pharmacy?",
        "options": {"a": "Medical superintendent", "b": "Hospital pharmacist", "c": "Pharmacist-in-charge or chief pharmacist", "d": "Nursing officer"},
        "correct_option": "c",
        "explanation": "The pharmacist-in-charge or chief pharmacist is responsible for all pharmacy operations, drug procurement, storage, dispensing, and staff management.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["hospital pharmacy", "roles"]
    },
    {
        "question_text": "What is the ABC analysis in inventory management?",
        "options": {"a": "Classification of drugs by alphabet", "b": "A method to classify inventory based on annual consumption value", "c": "A quality control method", "d": "A drug distribution system"},
        "correct_option": "b",
        "explanation": "ABC (Always Better Control) analysis classifies inventory into A (high value, ~10% items, 70% cost), B (moderate, ~20% items, 20% cost), C (low value, ~70% items, 10% cost).",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["inventory management", "ABC analysis"]
    },
    {
        "question_text": "In ABC analysis, which category items require strict control and frequent ordering?",
        "options": {"a": "C items", "b": "B items", "c": "A items", "d": "All items equally"},
        "correct_option": "c",
        "explanation": "A items are high-value items (~10% of items contributing ~70% of consumption value). They require strict control, accurate records, and frequent review.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["inventory management"]
    },
    {
        "question_text": "VED analysis classifies drugs based on:",
        "options": {"a": "Cost", "b": "Criticality to patient care", "c": "Expiry date", "d": "Storage temperature"},
        "correct_option": "b",
        "explanation": "VED (Vital, Essential, Desirable) classifies drugs based on their criticality. Vital drugs cannot be compromised at any cost, while Desirable drugs are nice to have.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["inventory management", "VED"]
    },
    {
        "question_text": "What is FIFO in pharmaceutical inventory management?",
        "options": {"a": "First In, First Out - oldest stock dispensed first", "b": "Fast In, Fast Out - quick turnover", "c": "First In, Final Out - end of shelf life", "d": "Fixed Interval, Frequent Ordering"},
        "correct_option": "a",
        "explanation": "FIFO (First In, First Out) ensures that drugs received first are dispensed first, preventing expiry and waste.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["inventory management", "FIFO"]
    },
    {
        "question_text": "What is the reorder level in inventory management?",
        "options": {"a": "Maximum stock level", "b": "The stock level at which a new order should be placed", "c": "Minimum stock level", "d": "Average stock level"},
        "correct_option": "b",
        "explanation": "Reorder level is the inventory level at which a new purchase order should be placed to avoid stockout. It is calculated as: (Average daily usage × Lead time) + Safety stock.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["inventory management", "reorder level"]
    },
    {
        "question_text": "Which of the following is NOT a method of drug distribution in hospitals?",
        "options": {"a": "Floor stock system", "b": "Individual prescription dispensing", "c": "Unit dose drug distribution", "d": "Random selection system"},
        "correct_option": "d",
        "explanation": "Random selection is not a recognized drug distribution method. The main methods are floor stock, individual prescription dispensing, and unit dose distribution.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["hospital pharmacy", "drug distribution"]
    },
    {
        "question_text": "What is the unit dose drug distribution system?",
        "options": {"a": "Giving bulk drugs to wards", "b": "Dispensing single-dose units of medication to patients", "c": "Storing drugs in the pharmacy only", "d": "A system where nurses mix their own IV fluids"},
        "correct_option": "b",
        "explanation": "Unit dose system dispenses medications in single-dose, ready-to-administer form. It reduces medication errors, improves safety, and allows better inventory control.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["hospital pharmacy", "unit dose"]
    },
    {
        "question_text": "The floor stock system has which major disadvantage?",
        "options": {"a": "Saves pharmacist time", "b": "Increased risk of medication errors and drug wastage", "c": "Easy inventory control", "d": "Better patient compliance"},
        "correct_option": "b",
        "explanation": "Floor stock keeps bulk medications on wards, which increases the risk of errors (wrong dose, wrong drug), theft, wastage, and expiration before use.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["hospital pharmacy", "floor stock"]
    },
    {
        "question_text": "What is a purchase order (PO) in pharmaceutical procurement?",
        "options": {"a": "A receipt for delivered goods", "b": "A formal document sent to a supplier to purchase goods", "c": "An internal request form", "d": "A quality inspection report"},
        "correct_option": "b",
        "explanation": "A purchase order is a formal, legally binding document issued by a buyer to a seller specifying the items, quantities, and agreed prices for products.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["procurement", "purchase order"]
    },
    {
        "question_text": "What is tendering in pharmaceutical procurement?",
        "options": {"a": "Direct purchase from one supplier", "b": "A process where suppliers bid to supply goods at competitive prices", "c": "Returning damaged goods", "d": "Quality testing of drugs"},
        "correct_option": "b",
        "explanation": "Tendering is a competitive bidding process where multiple suppliers submit bids for supplying drugs/equipment. It ensures fair pricing and transparency.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["procurement", "tendering"]
    },
    {
        "question_text": "What is the difference between a quotation and a tender?",
        "options": {"a": "No difference", "b": "Quotation is informal pricing; tender is a formal competitive bidding process", "c": "Tender is for small purchases only", "d": "Quotation is government-mandated"},
        "correct_option": "b",
        "explanation": "Quotation is a simple price estimate from a supplier. Tender is a formal, structured process with specific terms, conditions, and evaluation criteria.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["procurement"]
    },
    {
        "question_text": "What is a drug store management information system (DMIS)?",
        "options": {"a": "A manual record keeping book", "b": "A computerized system for managing drug store operations", "c": "A type of drug delivery system", "d": "A quality control instrument"},
        "correct_option": "b",
        "explanation": "DMIS is a computerized system that automates and manages inventory, procurement, dispensing, billing, and record keeping in a drug store or pharmacy.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["pharmacy management", "IT"]
    },
    {
        "question_text": "Which software is commonly used for pharmacy management in hospitals?",
        "options": {"a": "Microsoft Word", "b": "PharmAssist, PharmWare, or similar pharmacy management software", "c": "Adobe Photoshop", "d": "AutoCAD"},
        "correct_option": "b",
        "explanation": "Specialized pharmacy management software like PharmAssist or PharmWare are used for prescription management, inventory tracking, billing, and reporting.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["pharmacy management", "software"]
    },
    {
        "question_text": "What is the main objective of quality assurance in pharmaceutical manufacturing?",
        "options": {"a": "Maximize production speed", "b": "Ensure products consistently meet predetermined quality standards", "c": "Reduce the number of employees", "d": "Increase profit margins"},
        "correct_option": "b",
        "explanation": "Quality assurance (QA) is a systematic approach to ensure that products are consistently manufactured to meet quality standards and regulatory requirements.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["quality assurance"]
    },
    {
        "question_text": "What does GMP stand for?",
        "options": {"a": "General Medical Practice", "b": "Good Manufacturing Practice", "c": "Government Medical Protocol", "d": "Global Manufacturing Policy"},
        "correct_option": "b",
        "explanation": "GMP (Good Manufacturing Practice) is a system of guidelines ensuring that pharmaceutical products are consistently produced and controlled according to quality standards.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["GMP", "quality assurance"]
    },
    {
        "question_text": "Which of the following is NOT a component of GMP?",
        "options": {"a": "Quality control", "b": "Personnel training", "c": "Marketing strategy", "d": "Documentation and record keeping"},
        "correct_option": "c",
        "explanation": "Marketing strategy is not part of GMP. GMP covers production, quality control, personnel, premises, equipment, documentation, and self-inspection.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["GMP"]
    },
    {
        "question_text": "What is a standard operating procedure (SOP)?",
        "options": {"a": "A casual guideline", "b": "A detailed, written instruction to achieve uniformity of performance", "c": "A drug name", "d": "A type of prescription"},
        "correct_option": "b",
        "explanation": "SOPs are detailed written instructions describing step-by-step procedures to ensure consistency and compliance in pharmaceutical operations.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["SOP", "quality assurance"]
    },
    {
        "question_text": "What is a batch record in pharmaceutical manufacturing?",
        "options": {"a": "A sales record", "b": "A document containing all details of the manufacturing process for a specific batch", "c": "An employee attendance sheet", "d": "A customer complaint form"},
        "correct_option": "b",
        "explanation": "A batch record (or batch manufacturing record) documents every step, material, and parameter used in manufacturing a specific batch of product for traceability.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["GMP", "manufacturing"]
    },
    {
        "question_text": "What is the purpose of a stability study in pharmaceutical manufacturing?",
        "options": {"a": "To test taste of the product", "b": "To determine shelf life and storage conditions", "c": "To check packaging aesthetics", "d": "To test marketing appeal"},
        "correct_option": "b",
        "explanation": "Stability studies determine how factors like temperature, humidity, and light affect the product over time, establishing the expiry date and storage conditions.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["quality assurance", "stability"]
    },
    {
        "question_text": "What is pharmacoeconomics?",
        "options": {"a": "Economics of drug manufacturing only", "b": "The study of cost-effectiveness and value of drug therapies", "c": "The study of drug prices in the market", "d": "Economics of running a pharmacy"},
        "correct_option": "b",
        "explanation": "Pharmacoeconomics evaluates the cost and effects of pharmaceutical products to optimize resource allocation and provide value-based healthcare decisions.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["pharmacoeconomics"]
    },
    {
        "question_text": "Which pharmacoeconomic analysis compares the costs and consequences of two or more treatments?",
        "options": {"a": "Cost-benefit analysis", "b": "Cost-minimization analysis", "c": "Cost-effectiveness analysis", "d": "All of the above"},
        "correct_option": "d",
        "explanation": "All are pharmacoeconomic methods: CBA compares monetary value, CMA assumes equal outcomes and compares costs, and CEA compares costs per outcome unit.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["pharmacoeconomics"]
    },
    {
        "question_text": "What is the drug supply chain?",
        "options": {"a": "The path a prescription takes from doctor to patient", "b": "The sequence of processes from drug manufacturing to patient dispensing", "c": "The storage system in a pharmacy", "d": "The transportation of raw materials only"},
        "correct_option": "b",
        "explanation": "The drug supply chain encompasses all stages: raw material sourcing, manufacturing, distribution, wholesaling, and final dispensing to patients.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["supply chain"]
    },
    {
        "question_text": "What is cold chain management in pharmaceuticals?",
        "options": {"a": "Storing drugs in a freezer", "b": "Maintaining temperature-controlled storage and transport for sensitive products", "c": "A type of drug formulation", "d": "Chain pharmacy management"},
        "correct_option": "b",
        "explanation": "Cold chain management ensures temperature-sensitive products (vaccines, insulin, biologics) are stored and transported within required temperature ranges throughout the supply chain.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["supply chain", "cold chain"]
    },
    {
        "question_text": "Which vaccine requires strict cold chain management (2-8°C)?",
        "options": {"a": "Oral polio vaccine", "b": "BCG vaccine", "c": "All vaccines", "d": "Only live vaccines"},
        "correct_option": "c",
        "explanation": "All vaccines require cold chain maintenance at 2-8°C. BCG and oral polio are particularly sensitive to temperature deviations.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["cold chain", "vaccines"]
    },
    {
        "question_text": "What is a pharmaceutical waste?",
        "options": {"a": "Expired drugs only", "b": "Any unused, contaminated, or expired pharmaceutical product requiring proper disposal", "c": "Packaging materials only", "d": "Patient's leftover food in hospital"},
        "correct_option": "b",
        "explanation": "Pharmaceutical waste includes expired, unused, contaminated drugs, partially used medications, and related materials that must be disposed of safely.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["waste management"]
    },
    {
        "question_text": "How should cytotoxic (anticancer) drug waste be disposed?",
        "options": {"a": "Thrown in regular trash", "b": "In designated yellow cytotoxic waste bins for incineration", "c": "Flushed down the drain", "d": "Buried underground"},
        "correct_option": "b",
        "explanation": "Cytotoxic waste must be collected in clearly marked, puncture-resistant yellow containers and incinerated at high temperatures to destroy hazardous residues.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["waste management", "cytotoxic"]
    },
    {
        "question_text": "What color bin is typically used for infectious/clinical waste in hospitals?",
        "options": {"a": "Blue", "b": "Yellow", "c": "Green", "d": "White"},
        "correct_option": "b",
        "explanation": "Yellow bins are used for infectious/clinical waste. Blue is for sharps, green for general waste, and red for highly infectious waste in many systems.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["waste management"]
    },
    {
        "question_text": "What is the importance of drug information services in a hospital?",
        "options": {"a": "Only for pharmacists", "b": "Provides evidence-based drug information to healthcare professionals and patients", "c": "Promotes brand-name drugs", "d": "Replaces clinical judgment"},
        "correct_option": "b",
        "explanation": "Drug information services provide reliable, evidence-based information on drug use, interactions, side effects, and therapeutic options to support clinical decision-making.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug information"]
    },
    {
        "question_text": "What is adverse drug reaction (ADR) monitoring?",
        "options": {"a": "Monitoring drug prices", "b": "Systematic detection, assessment, and prevention of adverse effects of medications", "c": "Checking drug expiry dates", "d": "Counting pills in a bottle"},
        "correct_option": "b",
        "explanation": "ADR monitoring is a pharmacovigilance activity to identify, evaluate, and prevent adverse drug reactions, improving patient safety.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["pharmacovigilance", "ADR"]
    },
    {
        "question_text": "Which organization globally monitors adverse drug reactions?",
        "options": {"a": "WHO through its Programme for International Drug Monitoring (PIDM)", "b": "UNESCO", "c": "World Trade Organization", "d": "International Olympic Committee"},
        "correct_option": "a",
        "explanation": "WHO's PIDM, coordinated through Uppsala Monitoring Centre (UMC), is the global system for ADR monitoring with member countries reporting to the VigiBase database.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["pharmacovigilance", "WHO"]
    },
    {
        "question_text": "What is the role of a hospital pharmacy and therapeutic (P&T) committee?",
        "options": {"a": "Deciding hospital menu", "b": "Reviewing and formulating policies on drug use, formulary, and therapeutics", "c": "Managing hospital billing", "d": "Training nurses"},
        "correct_option": "b",
        "explanation": "The P&T committee evaluates drugs for formulary inclusion, develops therapeutic guidelines, monitors drug use, and ensures rational prescribing practices.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["hospital pharmacy", "P&T committee"]
    },
    {
        "question_text": "What is rational drug use?",
        "options": {"a": "Using the cheapest drug available", "b": "Patients receive appropriate drug therapy for their clinical needs at proper doses", "c": "Using only brand-name drugs", "d": "Prescribing maximum number of drugs"},
        "correct_option": "b",
        "explanation": "Rational drug use means patients receive medications appropriate to their clinical needs, in doses suited to their requirements, for an adequate period, at the lowest cost.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["rational drug use"]
    },
    {
        "question_text": "Which is an example of irrational drug use?",
        "options": {"a": "Prescribing a single appropriate antibiotic", "b": "Using antibiotics for viral infections like common cold", "c": "Following national treatment guidelines", "d": "Using generic drugs"},
        "correct_option": "b",
        "explanation": "Using antibiotics for viral infections is irrational because antibiotics have no effect on viruses. This contributes to antimicrobial resistance.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["rational drug use", "AMR"]
    },
    {
        "question_text": "What is the Essential Medicines List (EML)?",
        "options": {"a": "A list of the most expensive drugs", "b": "A curated list of medicines that satisfy the priority healthcare needs of the population", "c": "A list of banned drugs", "d": "A list of over-the-counter drugs only"},
        "correct_option": "b",
        "explanation": "WHO's EML, first published in 1977, lists essential medicines that should be available at all times in adequate amounts, appropriate forms, and at affordable cost.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["essential medicines", "WHO"]
    },
    {
        "question_text": "How often does WHO update the Essential Medicines List?",
        "options": {"a": "Every year", "b": "Every two years", "c": "Every five years", "d": "Never"},
        "correct_option": "b",
        "explanation": "WHO updates the EML every two years through an expert committee that reviews new evidence and makes recommendations.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["essential medicines"]
    },
    {
        "question_text": "What is generic substitution?",
        "options": {"a": "Replacing a drug with a different therapeutic class", "b": "Dispensing a generic version instead of the prescribed brand-name drug", "c": "Changing the dose of a medication", "d": "Stopping a medication"},
        "correct_option": "b",
        "explanation": "Generic substitution means dispensing a therapeutically equivalent generic drug instead of the brand-name product, usually at lower cost.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["generic drugs", "dispensing"]
    },
    {
        "question_text": "What is bioequivalence?",
        "options": {"a": "Two drugs having the same color", "b": "A generic drug delivering the same active ingredient at the same rate and extent as the reference drug", "c": "Two drugs having the same price", "d": "A drug having two active ingredients"},
        "correct_option": "b",
        "explanation": "Bioequivalence means the generic drug and the reference brand-name drug deliver the same amount of active ingredient to the site of action at the same rate.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["generic drugs", "bioequivalence"]
    },
    {
        "question_text": "What is the role of the Drug Advisory Committee in Nepal?",
        "options": {"a": "Selling drugs to public", "b": "Advising the government on drug policy, regulation, and essential medicines", "c": "Manufacturing drugs", "d": "Exporting drugs"},
        "correct_option": "b",
        "explanation": "The Drug Advisory Committee advises the government on drug policy matters, scheduling, essential medicines selection, and regulatory affairs.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["drug regulation", "Nepal"]
    },
    {
        "question_text": "What is drug scheduling (classification)?",
        "options": {"a": "Arranging drugs by color", "b": "Categorizing drugs based on their potential for abuse and safety profile", "c": "Setting drug prices", "d": "Packaging drugs"},
        "correct_option": "b",
        "explanation": "Drug scheduling classifies medications into categories (e.g., prescription-only, pharmacy-only, over-the-counter) based on safety, abuse potential, and need for supervision.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug regulation", "scheduling"]
    },
    {
        "question_text": "Which schedule in Nepal's drug regulations covers prescription-only medicines?",
        "options": {"a": "Schedule A", "b": "Schedule C", "c": "Schedule J", "d": "Schedule H (or equivalent)"},
        "correct_option": "d",
        "explanation": "Similar to India's Schedule H, Nepal classifies prescription-only medicines that require a registered practitioner's prescription for dispensing.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["drug regulation", "Nepal"]
    },
    {
        "question_text": "What is pharmaceutical care?",
        "options": {"a": "Just dispensing medications", "b": "Responsible provision of drug therapy to achieve definite outcomes that improve patient's quality of life", "c": "Marketing pharmaceutical products", "d": "Manufacturing drugs"},
        "correct_option": "b",
        "explanation": "Pharmaceutical care is a patient-centered approach where pharmacists take responsibility for drug therapy outcomes, monitoring and improving patient health.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["pharmaceutical care"]
    },
    {
        "question_text": "What is clinical pharmacy?",
        "options": {"a": "Working only in the dispensary", "b": "The branch of pharmacy where pharmacists provide direct patient care in clinical settings", "c": "Selling OTC drugs", "d": "Preparing drug formulations"},
        "correct_option": "b",
        "explanation": "Clinical pharmacy involves pharmacists working alongside physicians in hospitals/clinics to optimize drug therapy, monitor patients, and prevent adverse effects.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["clinical pharmacy"]
    },
    {
        "question_text": "What is drug utilization evaluation (DUE)?",
        "options": {"a": "Checking drug expiry", "b": "A systematic review of how drugs are prescribed, dispensed, and used", "c": "Testing new drugs", "d": "Pricing drugs"},
        "correct_option": "b",
        "explanation": "DUE (also called drug use review) evaluates patterns of drug use against established criteria to ensure rational, safe, and cost-effective therapy.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["drug utilization"]
    },
    {
        "question_text": "What is a medication error?",
        "options": {"a": "A drug with side effects", "b": "Any preventable event that may lead to inappropriate medication use or patient harm", "c": "A manufacturing defect", "d": "A natural drug reaction"},
        "correct_option": "b",
        "explanation": "Medication errors include prescribing errors, dispensing errors, administration errors, and monitoring errors that are preventable.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["patient safety", "medication errors"]
    },
    {
        "question_text": "Which is the most common cause of medication errors?",
        "options": {"a": "Wrong route of administration", "b": "Prescribing errors (wrong drug, dose, or indication)", "c": "Wrong storage", "d": "Wrong labeling"},
        "correct_option": "b",
        "explanation": "Prescribing errors are the most common type of medication error, accounting for the largest proportion of errors in healthcare settings.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["medication errors"]
    },
    {
        "question_text": "What is a tall-man lettering system?",
        "options": {"a": "Writing prescriptions in capital letters only", "b": "Using mixed-case lettering to differentiate look-alike drug names", "c": "A type of barcode", "d": "A signature style"},
        "correct_option": "b",
        "explanation": "Tall-man lettering (e.g., hydrOXYzine vs hydrALAZINE) helps distinguish look-alike/sound-alike drug names to prevent mix-ups.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["patient safety", "LASA drugs"]
    },
    {
        "question_text": "What does LASA stand for in pharmaceutical safety?",
        "options": {"a": "Long Acting Short Acting", "b": "Look Alike Sound Alike", "c": "Low Activity Slow Absorption", "d": "Limited Access Supply Availability"},
        "correct_option": "b",
        "explanation": "LASA (Look Alike Sound Alike) drugs are medications with names that look or sound similar, leading to potential dispensing errors.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["patient safety", "LASA"]
    },
    {
        "question_text": "What is the five rights of medication administration?",
        "options": {"a": "Right patient, right drug, right dose, right route, right time", "b": "Right price, right package, right store, right shelf, right label", "c": "Right doctor, right nurse, right ward, right bed, right chart", "d": "Right hospital, right city, right country, right continent, right planet"},
        "correct_option": "a",
        "explanation": "The five rights ensure safe medication administration: right patient, right drug, right dose, right route, and right time.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["patient safety"]
    },
    {
        "question_text": "What is the purpose of a drug interaction checker?",
        "options": {"a": "To count drug inventory", "b": "To identify potential interactions between two or more medications", "c": "To check drug expiry dates", "d": "To verify drug authenticity"},
        "correct_option": "b",
        "explanation": "Drug interaction checkers identify potential pharmacokinetic or pharmacodynamic interactions that could affect efficacy or safety when multiple drugs are used together.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug interactions", "patient safety"]
    },
    {
        "question_text": "What is polypharmacy?",
        "options": {"a": "Using a single drug", "b": "Concurrent use of multiple medications by a patient, often unnecessarily", "c": "Using drugs from multiple countries", "d": "A type of drug formulation"},
        "correct_option": "b",
        "explanation": "Polypharmacy refers to the use of five or more concurrent medications, increasing the risk of drug interactions, adverse effects, and non-adherence.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["polypharmacy", "patient safety"]
    },
    {
        "question_text": "What is medication reconciliation?",
        "options": {"a": "Reordering drugs from suppliers", "b": "Comparing a patient's medication orders to all medications they are actually taking", "c": "Counting pills in bottles", "d": "Updating drug prices"},
        "correct_option": "b",
        "explanation": "Medication reconciliation is the process of comparing a patient's current medication list against new orders to identify discrepancies during care transitions.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["patient safety"]
    },
    {
        "question_text": "What is the purpose of a medication therapy management (MTM) service?",
        "options": {"a": "Replace doctor consultations", "b": "Optimize drug therapy outcomes and improve patient health through pharmacist-led review", "c": "Increase drug sales", "d": "Train medical students"},
        "correct_option": "b",
        "explanation": "MTM is a comprehensive service where pharmacists review all medications, identify drug-related problems, and work with patients and physicians to optimize therapy.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["MTM", "pharmaceutical care"]
    },
    {
        "question_text": "What is a drug master file (DMF)?",
        "options": {"a": "A patient medication record", "b": "A confidential document submitted to a regulatory authority containing detailed information about drug manufacturing", "c": "A price list of drugs", "d": "A prescription pad"},
        "correct_option": "b",
        "explanation": "A DMF is a document submitted to regulatory authorities (like FDA) containing confidential, detailed information about the manufacturing, processing, and packaging of drug substances.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["drug regulation"]
    },
    {
        "question_text": "What is Good Pharmacy Practice (GPP)?",
        "options": {"a": "A marketing practice", "b": "Guidelines ensuring pharmacy services meet quality standards for patient care", "c": "A manufacturing standard", "d": "A pricing regulation"},
        "correct_option": "b",
        "explanation": "GPP is a set of standards established by WHO/FIP to ensure that pharmacy services are provided in a safe, effective, and quality manner.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["GPP", "quality assurance"]
    },
    {
        "question_text": "What is a refrigerator temperature log in a pharmacy?",
        "options": {"a": "A log of drug prices", "b": "A record of temperature readings taken at regular intervals to ensure proper storage conditions", "c": "A patient temperature record", "d": "A daily sales record"},
        "correct_option": "b",
        "explanation": "Temperature logs document refrigerator temperatures (typically 2-8°C) at set intervals to ensure cold storage drugs remain within required conditions.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["storage", "GMP"]
    },
    {
        "question_text": "What is a stock expiry monitoring system?",
        "options": {"a": "Checking if patients have expired prescriptions", "b": "A system to track and manage medications approaching their expiry dates", "c": "Monitoring stock prices", "d": "Checking building expiry"},
        "correct_option": "b",
        "explanation": "Expiry monitoring involves regular review of stock to identify approaching expiry dates, enabling timely use, return, or disposal of medications.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["inventory management"]
    },
    {
        "question_text": "What is the economic order quantity (EOQ)?",
        "options": {"a": "The maximum quantity to order", "b": "The optimal order size that minimizes total inventory costs (ordering + holding)", "c": "The minimum quantity to order", "d": "The average quantity ordered"},
        "correct_option": "b",
        "explanation": "EOQ is the ideal order quantity that balances ordering costs and holding costs to minimize total inventory management costs.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["inventory management", "EOQ"]
    },
    {
        "question_text": "What is safety stock in inventory management?",
        "options": {"a": "Drugs stored in a safe", "b": "Extra inventory held to prevent stockouts due to demand variability or supply delays", "c": "A locked storeroom", "d": "Drugs for emergency use only"},
        "correct_option": "b",
        "explanation": "Safety stock is buffer inventory maintained above the expected demand to protect against fluctuations in demand or supply delays.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["inventory management"]
    },
    {
        "question_text": "What is lead time in procurement?",
        "options": {"a": "Time taken to dispense a prescription", "b": "The time between placing an order and receiving the goods", "c": "Time to manufacture a drug", "d": "Time a patient waits in the queue"},
        "correct_option": "b",
        "explanation": "Lead time is the total time from when a purchase order is placed until the goods are received and ready for use.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["procurement", "supply chain"]
    },
    {
        "question_text": "Which of the following is a key performance indicator (KPI) for a pharmacy?",
        "options": {"a": "Number of chairs in the waiting area", "b": "Average prescription dispensing time", "c": "Color of the pharmacy sign", "d": "Number of windows"},
        "correct_option": "b",
        "explanation": "KPIs for pharmacy include dispensing time, error rate, patient wait time, inventory turnover, drug availability, and patient satisfaction scores.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["pharmacy management", "KPI"]
    },
    {
        "question_text": "What is drug存货周转率 (inventory turnover rate)?",
        "options": {"a": "How fast drugs rotate on shelves", "b": "The number of times inventory is sold and replaced over a specific period", "c": "The speed of drug delivery", "d": "How often shelves are cleaned"},
        "correct_option": "b",
        "explanation": "Inventory turnover rate measures how efficiently inventory is managed. Higher turnover indicates efficient stock management and less capital tied up in inventory.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["inventory management"]
    },
    {
        "question_text": "What is a pharmacy's break-even point?",
        "options": {"a": "When the pharmacy closes", "b": "When total revenue equals total costs, resulting in zero profit or loss", "c": "When a drug expires", "d": "When a patient leaves without buying"},
        "correct_option": "b",
        "explanation": "The break-even point is where total costs (fixed + variable) equal total revenue. Below this, the pharmacy operates at a loss; above, it generates profit.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["financial management"]
    },
    {
        "question_text": "What is fixed cost in pharmacy management?",
        "options": {"a": "Cost of drugs sold", "b": "Costs that remain constant regardless of sales volume (e.g., rent, salaries)", "c": "Cost of packaging materials", "d": "Cost of drugs purchased"},
        "correct_option": "b",
        "explanation": "Fixed costs (rent, utilities, permanent staff salaries) remain the same regardless of how much the pharmacy sells or dispenses.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["financial management"]
    },
    {
        "question_text": "What is variable cost in a pharmacy?",
        "options": {"a": "Rent of the pharmacy", "b": "Costs that change directly with the volume of business (e.g., drug purchases, packaging)", "c": "Insurance premiums", "d": "Fixed staff salaries"},
        "correct_option": "b",
        "explanation": "Variable costs increase or decrease with business volume — drug purchases, dispensing supplies, and temporary staff wages are examples.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["financial management"]
    },
    {
        "question_text": "What is markup in pharmaceutical pricing?",
        "options": {"a": "The amount added to the cost price to determine the selling price", "b": "A discount given to customers", "c": "The manufacturing cost", "d": "The tax on drugs"},
        "correct_option": "a",
        "explanation": "Markup is the percentage or amount added to the cost price of a drug to determine its selling price, covering operating expenses and profit.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["financial management", "pricing"]
    },
    {
        "question_text": "What is margin in pharmaceutical pricing?",
        "options": {"a": "The space on a page", "b": "The percentage of the selling price that is profit (profit/selling price × 100)", "c": "The cost of the drug", "d": "The wholesale price"},
        "correct_option": "b",
        "explanation": "Profit margin is calculated as (Selling Price - Cost) / Selling Price × 100. It differs from markup, which uses cost as the base.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["financial management", "pricing"]
    },
    {
        "question_text": "What is a controlled substance?",
        "options": {"a": "Any prescription drug", "b": "A drug whose manufacture, distribution, and use are regulated by law due to abuse potential", "c": "An over-the-counter drug", "d": "A herbal medicine"},
        "correct_option": "b",
        "explanation": "Controlled substances are regulated by law (e.g., Controlled Substances Act) due to potential for abuse or dependence. They are classified into schedules/categories.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug regulation", "controlled substances"]
    },
    {
        "question_text": "What is narcotic drug as defined legally?",
        "options": {"a": "Any painkiller", "b": "A substance listed in the narcotics schedule that affects the central nervous system and has potential for dependence", "c": "Any antibiotic", "d": "Any sedative"},
        "correct_option": "b",
        "explanation": "Narcotic drugs are legally defined substances listed in national/international schedules (e.g., Opium Act, NDPS Act) that have analgesic effects and abuse potential.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["drug regulation", "narcotics"]
    },
    {
        "question_text": "What is a psychotropic substance?",
        "options": {"a": "A vitamin supplement", "b": "A substance that acts on the mind, affecting perception, consciousness, or behavior", "c": "An antiseptic", "d": "A surgical instrument"},
        "correct_option": "b",
        "explanation": "Psychotropic substances affect mental processes including perception, consciousness, cognition, and mood. They are regulated under psychotropic substance laws.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["drug regulation"]
    },
    {
        "question_text": "What is the role of Drug Administration Division (DAD) in Nepal?",
        "options": {"a": "Manufacturing drugs", "b": "Regulating import, export, manufacture, sale, and distribution of drugs", "c": "Providing free drugs to patients", "d": "Training pharmacists"},
        "correct_option": "b",
        "explanation": "DAD under Nepal's Ministry of Health is responsible for drug regulation including registration, licensing, quality control, and enforcement of drug laws.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["drug regulation", "Nepal"]
    },
    {
        "question_text": "What is drug registration?",
        "options": {"a": "Patient registration for drug delivery", "b": "The process of officially listing a drug in the national register to allow its marketing", "c": "Recording drug side effects", "d": "Counting drug stock"},
        "correct_option": "b",
        "explanation": "Drug registration is the formal process where a regulatory authority evaluates and approves a drug for marketing in a country based on safety, efficacy, and quality data.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug regulation"]
    },
    {
        "question_text": "What documents are required for drug registration in Nepal?",
        "options": {"a": "Only the drug's price list", "b": "Application form, stability data, manufacturing details, labeling, samples, and certificates", "c": "Only the doctor's prescription", "d": "Only the import license"},
        "correct_option": "b",
        "explanation": "Drug registration requires comprehensive documentation: application forms, stability studies, manufacturing process details, specifications, labeling, certificates of analysis, and product samples.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["drug regulation", "Nepal"]
    },
    {
        "question_text": "What is a drug inspector?",
        "options": {"a": "A doctor who prescribes drugs", "b": "An official responsible for enforcing drug laws and ensuring compliance in pharmacies and manufacturing", "c": "A pharmacist in the dispensary", "d": "A nurse administering drugs"},
        "correct_option": "b",
        "explanation": "Drug inspectors are government officials who inspect pharmacies, manufacturers, and distributors to ensure compliance with drug laws and regulations.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug regulation"]
    },
    {
        "question_text": "What is the purpose of drug price control?",
        "options": {"a": "To increase drug company profits", "b": "To ensure essential medicines are available at affordable prices", "c": "To ban all imported drugs", "d": "To increase government revenue"},
        "correct_option": "b",
        "explanation": "Drug price control aims to make essential medicines affordable and accessible by setting maximum retail prices or controlling profit margins.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug pricing", "policy"]
    },
    {
        "question_text": "What is a maximum retail price (MRP)?",
        "options": {"a": "The lowest price a drug can be sold at", "b": "The highest price at which a product can be sold to consumers, including all taxes", "c": "The wholesale price", "d": "The manufacturing cost"},
        "correct_option": "b",
        "explanation": "MRP is the maximum price fixed by the manufacturer that a retailer can charge, inclusive of all taxes. It protects consumers from price exploitation.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["drug pricing"]
    },
    {
        "question_text": "What is a pharmaceutical company's product life cycle?",
        "options": {"a": "The shelf life of a product", "b": "The stages a drug goes through from introduction to withdrawal from the market", "c": "The time a pharmacist works", "d": "The life of a pill"},
        "correct_option": "b",
        "explanation": "Product life cycle includes: introduction, growth, maturity, and decline stages. Each stage has different marketing, pricing, and competitive strategies.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["marketing", "product life cycle"]
    },
    {
        "question_text": "What is Direct-to-Consumer (DTC) advertising of pharmaceuticals?",
        "options": {"a": "Selling drugs directly to patients without prescription", "b": "Advertising prescription drugs directly to consumers through media", "c": "Drug companies selling to hospitals", "d": "Advertising over-the-counter products only"},
        "correct_option": "b",
        "explanation": "DTC advertising involves pharmaceutical companies marketing prescription medications directly to consumers through TV, print, and digital media. It is allowed in very few countries.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["marketing", "pharmaceutical industry"]
    },
    {
        "question_text": "What is a pharmaceutical patent?",
        "options": {"a": "A license to sell drugs", "b": "An intellectual property right granting exclusive rights to manufacture and sell a drug for a limited period", "c": "A prescription for drugs", "d": "A drug formulation method"},
        "correct_option": "b",
        "explanation": "A pharmaceutical patent gives the innovator company exclusive rights (usually 20 years) to manufacture and sell the drug, after which generic competition is allowed.",
        "subject": "pharmaceutical-management",
        "difficulty": "medium",
        "tags": ["intellectual property"]
    },
    {
        "question_text": "What is a generic drug?",
        "options": {"a": "A fake drug", "b": "A drug marketed after patent expiry, containing the same active ingredient as the original brand", "c": "A drug only available in government hospitals", "d": "A drug with no brand name at all"},
        "correct_option": "b",
        "explanation": "Generic drugs contain the same active ingredient, strength, dosage form, and route of administration as the original brand-name drug but are sold under chemical names.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["generic drugs"]
    },
    {
        "question_text": "What is brand dilution in pharmaceutical marketing?",
        "options": {"a": "Reducing drug concentration", "b": "Loss of brand value and identity due to overextension or poor strategy", "c": "Mixing two drugs together", "d": "Diluting a syrup before use"},
        "correct_option": "b",
        "explanation": "Brand dilution occurs when a pharmaceutical brand loses its distinctive positioning due to overextension into unrelated products or poor marketing decisions.",
        "subject": "pharmaceutical-management",
        "difficulty": "hard",
        "tags": ["marketing"]
    },
    {
        "question_text": "What is the difference between medical representative (MR) and pharmacist?",
        "options": {"a": "No difference", "b": "MR promotes drugs to doctors; pharmacist dispenses and counsels patients on drug use", "c": "MR works in hospital; pharmacist works in company", "d": "MR is a doctor; pharmacist is a nurse"},
        "correct_option": "b",
        "explanation": "Medical representatives are sales professionals who detail products to prescribers. Pharmacists are healthcare professionals who dispense medications and provide patient counseling.",
        "subject": "pharmaceutical-management",
        "difficulty": "easy",
        "tags": ["pharmaceutical industry"]
    }
]

add("data/questions/pharmaceutical-management.json", questions)
