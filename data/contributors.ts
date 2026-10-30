export type Contributor = {
  id: string;
  name: string;
  role: string;
  photo: string;
  photoAlt: string;
  contribution: string;
  bio: string;
  // Reserved for future contributor details without changing the landing UI.
  note?: string;
};

// Keep contributor details here so the landing section can grow without a database.
export const contributors: readonly Contributor[] = [
  {
    id: "sandesh-poudel",
    name: "Sandesh Poudel",
    role: "Academic Contributor & Mentor",
    photo: "/contributors/sandesh-poudel.jpg",
    photoAlt: "Sandesh Poudel",
    contribution:
      "Grateful for his thoughtful feedback, academic guidance, and contribution of pharmacy licence preparation resources that have helped Bujh grow.",
    bio:
      "A pharmacy graduate with experience in pharmaceutical research and drug regulation. Former Pharmacy Officer at Nepal's Department of Drug Administration and Research Scientist at Fleur Himalayan Ltd.",
  },
];
