import { officialOutline } from "@/data/programs/official-outline";

// CDC Secondary Education Curriculum 2076, optional subjects, parts I–IV.
// These are the published content areas for each grade. Schools select their
// own elective combinations; the catalogue exposes the named stream choices.
type Grade = 11 | 12;
type SubjectKey = "physics" | "chemistry" | "biology" | "mathematics" | "computer-science" | "accounting" | "economics" | "business-studies" | "business-mathematics";

const units: Record<SubjectKey, Record<Grade, string[]>> = {
  physics: {
    11: ["Physical Quantities", "Vectors", "Kinematics", "Dynamics", "Work, Energy and Power", "Circular Motion", "Gravitation", "Elasticity", "Heat and Temperature", "Thermal Expansion", "Quantity of Heat", "Rate of Heat Flow", "Ideal Gas", "Reflection at Curved Mirror", "Refraction at Plane Surfaces", "Refraction through Prisms", "Lenses", "Dispersion", "Electric Charges", "Electric Field", "Potential and Potential Difference", "Capacitor", "DC Circuits", "Nuclear Physics", "Solids", "Recent Trends in Physics"],
    12: ["Rotational Dynamics", "Periodic Motion", "Fluid Statics", "First Law of Thermodynamics", "Second Law of Thermodynamics", "Wave Motion", "Mechanical Waves", "Waves in Pipes and Strings", "Acoustic Phenomena", "Nature and Propagation of Light", "Interference", "Diffraction", "Polarization", "Electrical Circuits", "Thermoelectric Effects", "Magnetic Field", "Magnetic Properties of Materials", "Electromagnetic Induction", "Alternating Currents", "Electrons", "Photons", "Semiconductor Devices", "Quantization of Energy", "Radioactivity and Nuclear Reactions", "Recent Trends in Physics"],
  },
  chemistry: {
    11: ["Foundation and Fundamentals", "Stoichiometry", "Atomic Structure", "Classification of Elements and Periodic Table", "Chemical Bonding and Shapes of Molecules", "Oxidation and Reduction", "States of Matter", "Chemical Equilibrium", "Chemistry of Non-metals", "Chemistry of Metals", "Bio-inorganic Chemistry", "Basic Concept of Organic Chemistry", "Fundamental Principles of Organic Chemistry", "Hydrocarbons", "Aromatic Hydrocarbons", "Fundamentals of Applied Chemistry", "Modern Chemical Manufactures"],
    12: ["Volumetric Analysis", "Ionic Equilibrium", "Chemical Kinetics", "Thermodynamics", "Electrochemistry", "Transition Metals", "Studies of Heavy Metals", "Haloalkanes", "Haloarenes", "Alcohols", "Phenols", "Ethers", "Aldehydes and Ketones", "Carboxylic Acids and Derivatives", "Nitro Compounds", "Amines", "Organometallic Compounds", "Chemistry in the Service of Mankind", "Cement", "Paper and Pulp", "Nuclear Chemistry and Applications of Radioactivity"],
  },
  biology: {
    11: ["Biomolecules and Cell Biology", "Floral Diversity", "Introductory Microbiology", "Ecology", "Vegetation", "Introduction to Biology", "Evolutionary Biology", "Faunal Diversity", "Biota and Environment", "Conservation Biology"],
    12: ["Plant Anatomy", "Plant Physiology", "Genetics", "Embryology", "Biotechnology", "Animal Tissues", "Developmental Biology", "Human Biology", "Human Population and Health Disorders", "Applied Biology"],
  },
  mathematics: {
    11: ["Algebra", "Trigonometry", "Analytic Geometry", "Vectors", "Statistics and Probability", "Calculus", "Computational Methods", "Mechanics or Mathematics for Economics and Finance"],
    12: ["Algebra", "Trigonometry", "Analytic Geometry", "Vectors", "Statistics and Probability", "Calculus", "Computational Methods", "Mechanics or Mathematics for Economics and Finance"],
  },
  "computer-science": {
    11: ["Computer System", "Number System and Boolean Logic", "Computer Software and Operating System", "Application Package", "Programming Concepts and C", "Web Technology", "Multimedia", "Information Security and Cyber Law"],
    12: ["Database Management System", "Data Communication and Networking", "Web Technology II", "Programming II", "Object-Oriented Programming", "Software Process Model", "Recent Trends in Technology"],
  },
  accounting: {
    11: ["Concept of Bookkeeping and Accounting", "Miscellaneous Accounting Concepts", "Financial Statements", "Government Accounting"],
    12: ["Company Accounting", "Company Financial Statements", "Cost Accounting", "Computerized Accounting"],
  },
  economics: {
    11: ["Basic Concepts of Economics and Resource Allocation", "Microeconomics", "Macroeconomics", "Development Economics", "Economy of Nepal", "Quantitative Methods for Economics"],
    12: ["Basic Concepts of Economics and Resource Allocation", "Microeconomics", "Macroeconomics", "Development Economics", "Economy of Nepal", "Quantitative Methods for Economics"],
  },
  "business-studies": {
    11: ["Introduction to Business", "Business Idea Generation", "Resource Mobilization", "Forms of Business Ownership", "Business Ethics and Social Responsibility", "Risk and Insurance", "Taxation", "Office Management"],
    12: ["Nature of Management", "Classical Management Theories", "Planning and Decision Making", "Organizing", "Leading", "Controlling", "Other Management Functions", "Contemporary Issues on Management", "Business Letter Writing", "Business Plan"],
  },
  "business-mathematics": {
    11: ["Algebra", "Calculus", "Financial Mathematics", "Linear Programming Problem", "Statistics", "Probability"],
    12: ["Algebra", "Calculus", "Financial Mathematics", "Linear Programming Problem", "Statistics", "Probability"],
  },
};

const names: Record<SubjectKey, string> = {
  physics: "Physics", chemistry: "Chemistry", biology: "Biology", mathematics: "Mathematics", "computer-science": "Computer Science", accounting: "Accounting", economics: "Economics", "business-studies": "Business Studies", "business-mathematics": "Business Mathematics",
};

function programme(programSlug: string, keys: SubjectKey[]) {
  return officialOutline(programSlug, "CDC Secondary Education Curriculum 2076, Grade 11/12 optional subjects.",
    keys.flatMap((key) => ([11, 12] as Grade[]).map((grade) => ({
      key: `${key}-${grade}`,
      name: `${names[key]} · Grade ${grade}`,
      examMarks: 100,
      totalHours: 160,
      units: units[key][grade].map((name) => ({ name, hours: 0 })),
    }))));
}

export const scienceBiologySubjects = programme("plus-two-science-bio", ["physics", "chemistry", "biology", "mathematics"]);
export const computerScienceSubjects = programme("plus-two-computer", ["physics", "chemistry", "mathematics", "computer-science"]);
export const managementSubjects = programme("plus-two-management", ["accounting", "economics", "business-studies", "business-mathematics", "computer-science"]);
