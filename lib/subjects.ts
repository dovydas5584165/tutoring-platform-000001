// The six lesson subjects. `slug` matches lessons.name in Supabase and the /schedule/[slug] URL.
export const SUBJECTS = [
  { slug: "matematika", name: "Matematika", of: "matematikos", note: "Nuo pagrindų iki VBE" },
  { slug: "fizika", name: "Fizika", of: "fizikos", note: "Uždaviniai ir egzaminai" },
  { slug: "chemija", name: "Chemija", of: "chemijos", note: "Reakcijos ir skaičiavimai" },
  { slug: "biologija", name: "Biologija", of: "biologijos", note: "Temos ir egzaminai" },
  { slug: "it", name: "IT", of: "IT", note: "Programavimas ir VBE" },
  { slug: "anglu-k", name: "Anglų k.", of: "anglų kalbos", note: "Kalbėjimas ir gramatika" },
] as const;

/** Genitive form for phrases like "fizikos pamokos". */
export const subjectOf = (slug: string) => SUBJECTS.find((s) => s.slug === slug)?.of ?? slug;

export const subjectName = (slug: string) =>
  SUBJECTS.find((s) => s.slug === slug)?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
