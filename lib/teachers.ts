// Mokytojų kortelės: naudojamos pradiniame ir pamokos puslapiuose.
export type TeacherCard = { name: string; subject: string; experience: string; description: string; img: string };

export const TEACHERS: TeacherCard[] = [
{
  name: "Karolina Kuncevičiūtė",
  subject: "Chemija ir Biologija",
  experience: "5 metai",
  description:
    "Studijuoju biologiją VU Gyvybės mokslų centre. Lengvai randu kalbą su jaunimu ir padedu mokiniams užpildyti chemijos bei biologijos spragas, žinau būdų, kaip teisingai motyvuoti ir užtikrinti, kad klysti nėra taip baisu:)",
  img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/884478047_2087940021906681_146320583796691306_n.webp",
},
{
  name: "Katia",
  subject: "Prancūzų",
  experience: "3 metai",
  description:
    "Currently pursuing a Master’s degree in Didactics of French as a Foreign Language (FLE) and holding a Bachelor’s degree in Language Sciences and French Literature, I offer tailored French lessons for all learning levels. Backed by a full year of classroom teaching experience alongside hands-on work with international university students and adult learners, my teaching focus is built on communicative and practical methods. Through custom-designed, interactive learning materials, I provide personalized instruction aimed at building your speaking confidence, improving reading and writing skills, and achieving your language goals at your own pace",
  img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/katia.jpg",
},
{
  name: "Aleksandras Šileika",
  subject: "Matematika",
  experience: "1 metai",
  description:
    "Esu matematikos korepetitorius, studijuojantis matematiką Bonos universitete (Vokietijoje). Iš matematikos VBE gavau 100 balų. Puikiai suprantu atnaujintą bendrąją ugdymo programą ir žinau, kokie iššūkiai laukia mokinių ruošiantis kontroliniams, NMPP, PUPP ar VBE.",
  img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/E0Tsj4D9OTOfOSOhS6zfFxwscH4sVtb8INL9xPp4.jpg",
},
{
  name: "Kajus Tutor",
  subject: "Matematika, fizika",
  experience: "2 metai",
  description:
    "Esu Kajus, mokau matematiką ir fiziką. Mėgstu paaiškinti sudėtingas temas paprastai ir suprantamai, kad kiekvienas mokinys galėtų jas įsisavinti.",
  img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/anon.avif",
},
{
  name: "Dovydas Žilinskas",
  subject: "Matematika, IT",
  experience: "2 metai",
  description:
    "Esu kiekybinės ekonomikos alumnas ir studijavau Prancūzijoje šiuo metu dirbu rizikų analitiku.",
  img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/1701519636194.jpeg",
},
];
