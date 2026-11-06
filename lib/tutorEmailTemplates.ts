// Email templates for tutors. Client-safe: no server imports.
import { format } from "date-fns";
import { lt } from "date-fns/locale";

export const ADMIN_EMAIL = "info.tiksliukai@gmail.com";

export type TemplateLesson = {
  student: string;      // student's name
  subject: string;
  when: string;         // formatted lesson time
  tutor: string;        // tutor's name
};

export type EmailTemplate = { id: string; label: string; to: "student" | "admin"; subject: string; body: string };

/** Placeholder values shown in the dashboard guide. */
export const PLACEHOLDERS: TemplateLesson = {
  student: "[mokinio vardas]",
  subject: "[dalykas]",
  when: "[data ir laikas]",
  tutor: "[jūsų vardas]",
};

export const fmtLessonTime = (iso: string) => format(new Date(iso), "MMMM d 'd.' (cccc) HH:mm", { locale: lt });

export function templates(l: TemplateLesson, studentEmail = "[mokinio el. paštas]"): EmailTemplate[] {
  return [
    {
      id: "confirm",
      label: "1. Pamokos patvirtinimas",
      to: "student",
      subject: `Pamoka: ${l.subject}, ${l.when}`,
      body: `Sveiki, ${l.student}!

Esu ${l.tutor}, jūsų Tiksliukai.lt mokytojas(-a). Patvirtinu mūsų pamoką:
${l.subject}, ${l.when}, 45 min.

Pamoka vyks čia: [Google Meet / Zoom nuoroda]

Kad pamoka būtų naudingesnė:
- parašykite, kokias temas norėtumėte aptarti, arba atsiųskite užduočių nuotraukas;
- turėkite po ranka sąsiuvinį, rašiklį ir skaičiuotuvą.

Jei negalėsite dalyvauti, praneškite bent prieš 24 val. atsakydami į šį laišką.

Iki pasimatymo!
${l.tutor}`,
    },
    {
      id: "reschedule",
      label: "2. Atšaukimas ir perkėlimas",
      to: "student",
      subject: `Pamokos perkėlimas: ${l.subject}, ${l.when}`,
      body: `Sveiki, ${l.student}!

Labai atsiprašau, bet negalėsiu pravesti mūsų pamokos ${l.when}, nes [priežastis].

Siūlau perkelti pamoką į vieną iš šių laikų:
- [laikas 1]
- [laikas 2]
- [laikas 3]

Atsakykite, kuris laikas jums tinka. Jei nė vienas netinka, parašykite, kada galėtumėte.

Dar kartą atsiprašau už nepatogumus.
${l.tutor}`,
    },
    {
      id: "admin",
      label: "3. Kreipimasis į administraciją",
      to: "admin",
      subject: `Negaliu pravesti pamokos: ${l.student}, ${l.subject}, ${l.when}`,
      body: `Sveiki,

negaliu pravesti pamokos ir nepavyko jos perkelti.

Mokinys: ${l.student} (${studentEmail})
Dalykas: ${l.subject}
Laikas: ${l.when}
Priežastis: [priežastis]
Ką jau bandžiau: [pvz. pasiūliau 3 naujus laikus, mokinys neatsakė per 24 val.]

Prašau perduoti pamoką kitam mokytojui arba susisiekti su mokiniu.

${l.tutor}`,
    },
  ];
}

/** mailto: link. Student emails always CC the administration. */
export function mailtoLink(t: EmailTemplate, studentEmail: string) {
  const to = t.to === "admin" ? ADMIN_EMAIL : studentEmail;
  const cc = t.to === "admin" ? "" : `cc=${encodeURIComponent(ADMIN_EMAIL)}&`;
  return `mailto:${encodeURIComponent(to)}?${cc}subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(t.body)}`;
}
