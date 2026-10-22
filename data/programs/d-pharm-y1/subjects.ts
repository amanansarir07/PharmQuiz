import type { SubjectData, UnitData } from "@/data/types";

/**
 * CTEVT PCL/Diploma in Health Sciences, First Year (Second revision, 2024).
 * IDs match the IDs produced by Bujh's bulk importer, such as
 * `chemistry-unit-1`, so imported questions immediately belong to a unit.
 */
const units = (
  subjectSlug: string,
  entries: Array<[name: string, hours?: number, subtopics?: string[]]>
): UnitData[] => entries.map(([name, hours = 0, subtopics = []], index) => ({
  id: `${subjectSlug}-unit-${index + 1}`,
  name,
  slug: name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  description: name,
  examHours: hours,
  // CTEVT publishes subject-level marks. Unit mark values are not invented.
  examMarks: 0,
  subtopics,
}));

const subject = (
  name: string,
  slug: string,
  description: string,
  examMarks: number,
  totalHours: number,
  entries: Array<[name: string, hours?: number, subtopics?: string[]]>
): SubjectData => ({ id: slug, name, slug, description, icon: "•", examMarks, totalHours, units: units(slug, entries) });

export const subjects: SubjectData[] = [
  subject("Nepali", "nepali", "Communication, grammar, comprehension and health-science expression.", 100, 105, [
    ["वर्ण र वर्णविन्यास", 10], ["शब्दभण्डार", 20], ["वाक्यतत्व र वाक्यान्तरण", 20],
    ["बोध र शब्दभण्डार", 10], ["संक्षेपीकरण", 4], ["निबन्ध लेखन", 8], ["कृति समीक्षा", 33],
  ]),
  subject("English", "english", "Academic and communicative English for health-science study.", 100, 105, [
    ["What Are You Like?", 4], ["Health Matters", 6], ["Looking Ahead", 4], ["It’s a Crime", 8],
    ["Buying and Selling", 6], ["Family", 4], ["Sports", 7], ["Education", 8], ["Humor", 8], ["Hobbies", 4],
    ["Globalization, Diaspora and Diversity", 4], ["Short Stories", 12], ["Poems", 12], ["Essays", 12], ["Play", 6],
  ]),
  subject("Social Studies", "social-studies", "Nepali society, culture, economy, government and foreign policy.", 50, 70, [
    ["History of Nepal", 20], ["Society and Culture", 15], ["Nepalese Economy", 10],
    ["Politics and Government", 20], ["Foreign Policy", 5],
  ]),
  subject("Anatomy and Physiology", "anatomy-physiology", "Normal structure and function of the human body.", 100, 140, [
    ["System Approach to the Human Body", 10], ["Introduction to Cells and Tissues", 8], ["Body Fluid and Electrolyte", 20],
    ["Introduction to Circulatory System", 10], ["Introduction to Lymphatic System", 8], ["Introduction to Muscular System", 8],
    ["Introduction to Skeletal System", 10], ["Introduction to Respiratory System", 10], ["Introduction to Digestive System", 6],
    ["Introduction to Urinary System", 8], ["Introduction to Nervous System", 8], ["Introduction to Reproductive System", 10],
    ["Introduction to Endocrine System", 10], ["Introduction to Special Sensory Organ", 6], ["Human Growth and Development", 8],
  ]),
  subject("Physics", "physics", "Mechanics, heat, light, waves, electricity, magnetism and modern physics.", 150, 140, [
    ["Mechanics", 30], ["Heat", 15], ["Light", 10], ["Waves and Sound", 10], ["Electrostatics", 15],
    ["Magnetism", 15], ["Current Electricity", 20], ["Modern Physics", 25],
  ]),
  subject("Chemistry", "chemistry", "Physical, inorganic, environmental and organic chemistry for health sciences.", 150, 140, [
    ["Physical and General Chemistry", 60], ["Inorganic Chemistry and Environmental Chemistry", 35], ["Organic Chemistry", 45],
  ]),
  subject("Zoology", "zoology", "Animal tissues, diversity, parasites, mammalian systems, evolution and health applications.", 150, 105, [
    ["Introduction to Zoology", 2], ["Animal Tissues and Their Types", 12], ["Diversity of Animal Life", 3],
    ["Economic Zoology", 33], ["Life Process of Mammals", 35], ["Evolution", 7], ["Wildlife Conservation", 5],
    ["Snakes of Nepal", 8],
  ]),
  subject("Botany", "botany", "Plant biology, physiology, genetics, ecology, medicinal plants and biotechnology.", 150, 105, [
    ["Introduction", 4], ["Life Components", 7], ["Cell Biology", 19], ["Diversity of Life", 26],
    ["Physiology", 16], ["Genetics", 11], ["Environmental Biology", 10], ["Economic Botany and Biotechnology", 12],
  ]),
  subject("Mathematics and Statistics", "mathematics-statistics", "Elementary mathematics, statistics, research methods and computer applications.", 125, 140, [
    ["Set Theory and Real Number System", 6], ["Function and Graph", 6], ["Permutation, Combination and Binomial Theorem", 9],
    ["Matrices and Determinants", 9], ["Algebra and Straight Line", 2], ["Coordinate Geometry", 6], ["Limits and Limiting Values", 6],
    ["Derivatives and Their Applications", 6], ["Integration", 10], ["Probability", 6], ["Introduction to Statistics", 3],
    ["Collection, Classification, Tabulation, Diagrams and Graphs", 3], ["Central Tendency", 5], ["Measure of Dispersion", 8],
    ["Correlation Coefficient", 9], ["Vital Statistics", 10], ["Research Methodology", 4], ["Introduction to Report Writing", 4],
    ["Introduction to Computer", 7], ["Computer Applications", 21],
  ]),
];
