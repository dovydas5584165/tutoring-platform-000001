-- Run once in the Supabase SQL editor.
-- Tutor cards shown on the home page and lesson pages.
-- Edited on /admin_tutors (admin) and in the tutor dashboard ("Mano profilis").

create table if not exists public.teacher_profiles (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  user_id      uuid unique references public.users(id) on delete set null, -- tutor account allowed to edit this card
  name         text not null,
  subject      text not null default '',
  experience   text not null default '',
  description  text not null default '',
  img          text,                       -- public URL in the "teacher photos" storage bucket
  sort_order   integer not null default 0, -- lower = shown first
  visible      boolean not null default true
);

-- Everything goes through the API routes with the service role key
alter table public.teacher_profiles enable row level security;

-- Copy of the cards that used to be hardcoded in lib/teachers.ts (only if the table is empty)
insert into public.teacher_profiles (name, subject, experience, description, img, sort_order)
select * from (values
  ($q$Karolina Kuncevičiūtė$q$, $q$Chemija ir Biologija$q$, $q$5 metai$q$, $q$Studijuoju biologiją VU Gyvybės mokslų centre. Lengvai randu kalbą su jaunimu ir padedu mokiniams užpildyti chemijos bei biologijos spragas, žinau būdų, kaip teisingai motyvuoti ir užtikrinti, kad klysti nėra taip baisu:)$q$, $q$https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/884478047_2087940021906681_146320583796691306_n.webp$q$, 1),
  ($q$Katia$q$, $q$Prancūzų$q$, $q$3 metai$q$, $q$Currently pursuing a Master’s degree in Didactics of French as a Foreign Language (FLE) and holding a Bachelor’s degree in Language Sciences and French Literature, I offer tailored French lessons for all learning levels. Backed by a full year of classroom teaching experience alongside hands-on work with international university students and adult learners, my teaching focus is built on communicative and practical methods. Through custom-designed, interactive learning materials, I provide personalized instruction aimed at building your speaking confidence, improving reading and writing skills, and achieving your language goals at your own pace$q$, $q$https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/katia.jpg$q$, 2),
  ($q$Aleksandras Šileika$q$, $q$Matematika$q$, $q$1 metai$q$, $q$Esu matematikos korepetitorius, studijuojantis matematiką Bonos universitete (Vokietijoje). Iš matematikos VBE gavau 100 balų. Puikiai suprantu atnaujintą bendrąją ugdymo programą ir žinau, kokie iššūkiai laukia mokinių ruošiantis kontroliniams, NMPP, PUPP ar VBE.$q$, $q$https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/E0Tsj4D9OTOfOSOhS6zfFxwscH4sVtb8INL9xPp4.jpg$q$, 3),
  ($q$Kajus Tutor$q$, $q$Matematika, fizika$q$, $q$2 metai$q$, $q$Esu Kajus, mokau matematiką ir fiziką. Mėgstu paaiškinti sudėtingas temas paprastai ir suprantamai, kad kiekvienas mokinys galėtų jas įsisavinti.$q$, $q$https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/anon.avif$q$, 4),
  ($q$Dovydas Žilinskas$q$, $q$Matematika, IT$q$, $q$2 metai$q$, $q$Esu kiekybinės ekonomikos alumnas ir studijavau Prancūzijoje šiuo metu dirbu rizikų analitiku.$q$, $q$https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/1701519636194.jpeg$q$, 5)
) as v(name, subject, experience, description, img, sort_order)
where not exists (select 1 from public.teacher_profiles);
