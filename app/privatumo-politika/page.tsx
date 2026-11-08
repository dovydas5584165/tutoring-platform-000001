/**
 * Privacy policy (GDPR).
 */

import LegalPage from "@/components/LegalPage";
import { CookieSettingsButton } from "@/components/CookieConsent";
import { pageMeta, SELLER } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privatumo politika",
  description: "Kokius asmens duomenis renka Tiksliukai.lt, kam juos naudojame, kiek laiko saugome ir kokias teises turite.",
  path: "/privatumo-politika",
});

/** Privacy policy text. */
export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privatumo politika" updated="2026 m. lapkričio 8 d.">
      <p>
        Ši politika paaiškina, kaip Tiksliukai.lt (toliau – „mes“) tvarko asmens duomenis, kai naudojatės svetaine,
        užsakote pamokas ar dalyvaujate kitose mūsų veiklose. Duomenis tvarkome pagal Bendrąjį duomenų apsaugos
        reglamentą (BDAR) ir Lietuvos Respublikos teisės aktus.
      </p>

      <h2>1. Duomenų valdytojas ir kaip su mumis susisiekti</h2>
      <p>
        Duomenų valdytojas: <b>{SELLER.name}</b>, {SELLER.legalForm}{SELLER.code ? `, pažymos nr. ${SELLER.code}` : ""}, {SELLER.address}.
      </p>
      <p>
        Visais su asmens duomenimis susijusiais klausimais rašykite{" "}
        <a href="mailto:info.tiksliukai@gmail.com">info.tiksliukai@gmail.com</a>. Atsakome per 30 dienų.
      </p>

      <h2>2. Kokius duomenis renkame</h2>
      <ul>
        <li><b>Pamokos užklausa:</b> mokinio vardas ir pavardė, klasė, dalykas, el. paštas, telefono numeris (jei nurodote), norima tema ir pasirinkti laikai.</li>
        <li><b>Paskyra:</b> el. paštas, vardas, pavardė, vaiko vardas (jei nurodote), pasirinkti dalykai ir prisijungimo duomenys (slaptažodis saugomas tik šifruotas).</li>
        <li><b>Mokytojai:</b> vardas, pavardė, nuotrauka ir aprašymas, rodomi svetainėje mokytojo sutikimu, bei sąskaitų faktūrų duomenys.</li>
        <li><b>Pamokos:</b> pamokų laikai, mokytojo įrašyti pažymiai ir pastabos, sąskaitos.</li>
        <li><b>Grupinės pamokos:</b> el. paštas, telefono numeris ir dalykas.</li>
        <li><b>Karjeros testas:</b> telefono numeris, mokėjimo būsena ir suma. Kortelės duomenis tvarko „Stripe“, mes jų nematome. Testo atsakymai lieka jūsų naršyklėje ir mūsų serveriuose nesaugomi.</li>
        <li><b>Sutarties atsisakymas:</b> vardas, pavardė, el. paštas ir užsakymo informacija, kurią nurodote formoje.</li>
        <li><b>Susirašinėjimas:</b> laiškų, kuriuos mums siunčiate, turinys.</li>
        <li><b>Svetainės naudojimas</b> (tik jei sutinkate su slapukais): aplankyti puslapiai, įrenginio ir naršyklės informacija, apytikslė vieta.</li>
      </ul>

      <h2>3. Kam naudojame duomenis ir kuo remdamiesi</h2>
      <table>
        <thead><tr><th>Tikslas</th><th>Teisinis pagrindas</th></tr></thead>
        <tbody>
          <tr><td>Suderinti ir pravesti pamokas, perduoti užklausą mokytojui, siųsti su pamoka susijusius laiškus</td><td>Sutarties sudarymas ir vykdymas (BDAR 6 str. 1 d. b p.)</td></tr>
          <tr><td>Paskyros sukūrimas, mokinio pažangos stebėjimas</td><td>Sutarties vykdymas</td></tr>
          <tr><td>Sąskaitų išrašymas ir apskaita</td><td>Teisinė prievolė (BDAR 6 str. 1 d. c p.)</td></tr>
          <tr><td>Grupinių pamokų registracija ir pranešimas, kai grupė surinkta</td><td>Sutarties sudarymas jūsų prašymu (BDAR 6 str. 1 d. b p.)</td></tr>
          <tr><td>Sutarties atsisakymo ir pretenzijų nagrinėjimas</td><td>Teisinė prievolė ir teisėtas interesas (BDAR 6 str. 1 d. c ir f p.)</td></tr>
          <tr><td>Atsakymai į jūsų klausimus</td><td>Teisėtas interesas (BDAR 6 str. 1 d. f p.)</td></tr>
          <tr><td>Lankomumo statistika ir reklamos efektyvumo matavimas</td><td>Jūsų sutikimas (BDAR 6 str. 1 d. a p.)</td></tr>
        </tbody>
      </table>
      <p>
        Duomenų neparduodame ir nenaudojame automatizuotiems sprendimams, turintiems jums teisinių pasekmių. Dirbtinio
        intelekto įrankiais jūsų asmens duomenų netvarkome. Kai kurios iliustracijos svetainėje sukurtos dirbtiniu intelektu.
        Reklaminių laiškų be jūsų atskiro sutikimo nesiunčiame – gaunate tik su užsakymu susijusius laiškus.
      </p>

      <h2>4. Vaikų duomenys</h2>
      <p>
        Pamokos skirtos 1–12 klasių mokiniams. Jei mokiniui dar nėra 14 metų, užklausą ar registraciją turi pateikti
        vienas iš tėvų arba globėjas, o 14–17 metų mokinys ją gali pateikti tik su tėvų (globėjų) sutikimu. Tai
        patvirtinama pažymint varnelę formoje. Prašome nurodyti tik tuos duomenis, kurių reikia pamokai suderinti.
        Paaiškėjus, kad duomenis be tėvų sutikimo pateikė jaunesnis nei 14 metų vaikas, juos ištriname.
      </p>

      <h2>5. Kam perduodame duomenis</h2>
      <ul>
        <li><b>Mokytojams:</b> mokinio vardą, klasę, dalyką ir temą mato dalyką dėstantys mokytojai. Kontaktus mato tik pamoką pasirinkęs mokytojas.</li>
        <li><b>Paslaugų teikėjams</b>, kurie mūsų vardu teikia infrastruktūrą: „Supabase“ (duomenų bazė ir prisijungimas), „Vercel“ (svetainės talpinimas), „Google“ (el. paštas, „Google Meet“ pamokos), „Stripe“ (mokėjimai už karjeros testą).</li>
        <li><b>„Stripe“</b> kai kuriuos mokėjimų duomenis tvarko ir kaip savarankiškas duomenų valdytojas (pvz., sukčiavimo prevencijai) pagal savo privatumo politiką.</li>
        <li><b>Tik jei sutinkate su slapukais:</b> „Google“ („Google Analytics“, „Google Tag Manager“) ir „Meta“ („Facebook Pixel“).</li>
        <li><b>Valstybės institucijoms</b>, kai to reikalauja teisės aktai.</li>
      </ul>
      <p>
        Kai kurie šių teikėjų duomenis gali tvarkyti ir už Europos ekonominės erdvės ribų (pvz., JAV). Tokiais atvejais
        taikomos Europos Komisijos patvirtintos standartinės sutarčių sąlygos arba ES ir JAV duomenų privatumo sistema.
      </p>

      <h2>6. Kiek laiko saugome</h2>
      <ul>
        <li>Pamokų užklausas ir susirašinėjimą – kol teikiame paslaugas, ir ne ilgiau kaip 2 metus po paskutinės pamokos. Senesnės užklausos ištrinamos automatiškai.</li>
        <li>Grupinių pamokų registracijas – ne ilgiau kaip 1 metus, jei grupė nesusirenka.</li>
        <li>Karjeros testo pirkimų duomenis (telefono numerį) – 1 metus po apmokėjimo, išskyrus apskaitai reikalingus duomenis.</li>
        <li>Sutarties atsisakymo pranešimus – 3 metus (galimiems ginčams).</li>
        <li>Paskyros duomenis – kol paskyra aktyvi arba kol paprašysite ją ištrinti.</li>
        <li>Apskaitos dokumentus (sąskaitas) – tiek, kiek reikalauja Lietuvos teisės aktai (paprastai 10 metų).</li>
        <li>Statistikos slapukų duomenis – pagal „Google“ ir „Meta“ nustatymus, ne ilgiau kaip 2 metus.</li>
      </ul>

      <h2>7. Jūsų teisės</h2>
      <p>Jūs turite teisę:</p>
      <ul>
        <li>sužinoti, kokius jūsų duomenis tvarkome, ir gauti jų kopiją;</li>
        <li>prašyti ištaisyti netikslius duomenis;</li>
        <li>prašyti ištrinti duomenis („teisė būti pamirštam“);</li>
        <li>prašyti apriboti duomenų tvarkymą arba nesutikti su juo;</li>
        <li>gauti savo duomenis susistemintu formatu (perkeliamumas);</li>
        <li>bet kada atšaukti sutikimą, pvz., pakeisti slapukų nustatymus.</li>
      </ul>
      <p>
        Norėdami pasinaudoti šiomis teisėmis, rašykite <a href="mailto:info.tiksliukai@gmail.com">info.tiksliukai@gmail.com</a>.
        Jei manote, kad jūsų duomenys tvarkomi neteisėtai, galite pateikti skundą{" "}
        <a href="https://vdai.lrv.lt" target="_blank" rel="noopener noreferrer">Valstybinei duomenų apsaugos inspekcijai</a>.
      </p>

      <h2 id="slapukai">8. Slapukai</h2>
      <p>
        Slapukai – tai nedideli failai, kuriuos svetainė išsaugo jūsų naršyklėje. Būtinieji veikia visada. Statistikos ir
        rinkodaros slapukus įjungiame tik jums sutikus – galite sutikti su visais arba pasirinkti kategorijas atskirai.
      </p>
      <table>
        <thead><tr><th>Rūšis</th><th>Kam naudojami</th><th>Teikėjas</th></tr></thead>
        <tbody>
          <tr><td>Būtinieji</td><td>Prisijungimo sesija, jūsų slapukų pasirinkimas</td><td>Tiksliukai.lt, „Supabase“</td></tr>
          <tr><td>Statistikos</td><td>Lankomumo matavimas (pvz., _ga)</td><td>„Google Analytics“, „Google Tag Manager“</td></tr>
          <tr><td>Rinkodaros</td><td>Reklamos efektyvumo matavimas (pvz., _fbp)</td><td>„Meta“ („Facebook Pixel“)</td></tr>
        </tbody>
      </table>
      <p>
        Savo pasirinkimą bet kada galite pakeisti:{" "}
        <CookieSettingsButton className="font-semibold text-[#3B65CE] underline" />.
      </p>

      <h2>9. Saugumas</h2>
      <p>
        Duomenis perduodame šifruotu ryšiu (HTTPS), prieigą prie jų turi tik tie, kam jos reikia darbui. Mokytojų
        paskyras sukuriame tik patvirtintiems mokytojams. Mokinių kontaktai mokytojams parodomi tik jiems pasirinkus
        pamoką. Įvykus duomenų saugumo pažeidimui, per 72 valandas pranešame Valstybinei duomenų apsaugos inspekcijai,
        o jei kyla didelė rizika – ir jums.
      </p>

      <h2>10. Politikos pakeitimai</h2>
      <p>
        Šią politiką galime atnaujinti. Naujausia versija visada skelbiama šiame puslapyje, o esminius pakeitimus
        pranešime el. paštu arba svetainėje.
      </p>
    </LegalPage>
  );
}
