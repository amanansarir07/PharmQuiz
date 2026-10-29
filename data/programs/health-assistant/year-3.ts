import { haSubject } from "./shared";

/**
 * CTEVT PCL in General Medicine, third revision (2024), Year III.
 * https://www.ctevt.org.np/uploads/docs/2024-08-25_CURRICULUM%20for%20General%20Medicine.pdf
 * The comprehensive clinical and community practica are practical placements,
 * not additional theory subjects or MCQ units.
 */
export const subjects = [
  haSubject(3, "Medicine II", "medicine-ii", 100, 88, [
    ["Pediatrics Including Neonatology", 38],
    ["Psychiatry", 30],
    ["Dermatology and Sexually Transmitted Infections", 20],
  ]),
  haSubject(3, "Surgery II", "surgery-ii", 100, 88, [
    ["Ear", 20], ["Nose", 10], ["Throat", 12],
    ["Dentistry", 28], ["Lid Diseases and Conjunctivitis", 18],
  ]),
  haSubject(3, "Health Management", "health-management", 50, 66, [
    ["Health Care System in Nepal", 2],
    ["Fundamentals of Health Management", 15],
    ["Disaster Coordination", 6], ["Health Post Management", 14],
    ["Health Related Organizations", 1],
    ["National Health Policy and Health Programs", 10],
    ["Epidemiology and Disease Control", 10],
    ["Health Manpower in Nepal", 4],
    ["Health Issues and Professional Practice", 4],
  ]),
  haSubject(3, "Epidemiology, Demography and Community Diagnosis", "epidemiology-community-diagnosis", 100, 66, [
    ["Concept of Health and Disease", 15],
    ["Concepts and Methods of Epidemiology", 6],
    ["Screening for Diseases", 3],
    ["Infectious Disease Epidemiology", 6],
    ["Investigation and Management of an Epidemic", 3],
    ["Concepts of Culture and Health", 3],
    ["Culture of Ethnic Groups in Nepal", 3],
    ["Effects of Culture on Health", 3],
    ["Community Diagnosis", 14],
    ["Methods of Sampling", 10],
  ]),
];
