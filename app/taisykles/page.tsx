import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Naudojimosi taisyklės",
  description: "Tiksliukai.lt pamokų užsakymo, apmokėjimo, atšaukimo ir perkėlimo taisyklės.",
  path: "/taisykles",
});

export default function Terms() {
  return (
    <LegalPage title="Naudojimosi taisyklės" updated="2026 m. lapkričio 7 d.">
      <p>
        Šios taisyklės taikomos naudojantis svetaine Tiksliukai.lt ir užsakant individualias pamokas. Pateikdami
        pamokos užklausą patvirtinate, kad su jomis susipažinote ir sutinkate. Kaip tvarkome asmens duomenis, rasite{" "}
        <Link href="/privatumo-politika">privatumo politikoje</Link>.
      </p>

      <h2>1. Paslaugos</h2>
      <ul>
        <li>Individualios nuotolinės pamokos 1–12 klasių mokiniams per „Google Meet“.</li>
        <li>Vienos pamokos trukmė – 45 minutės, kaina – 25 €, jei nesusitarta kitaip.</li>
        <li>Grupinės pamokos ir karjeros testas teikiami pagal atitinkamuose puslapiuose nurodytas sąlygas ir kainas.</li>
      </ul>

      <h2>2. Kaip užsakoma pamoka</h2>
      <ul>
        <li>Pamokos puslapyje pasirenkate dalyką, pažymite bent 5 jums tinkamus laikus ir pateikiate užklausą. Užklausa nemokama ir neįpareigoja.</li>
        <li>Pamoka laikoma užsakyta, kai mokytojas pasirenka vieną iš jūsų laikų ir jūs gaunate patvirtinimo laišką.</li>
        <li>Mokytojas el. paštu atsiunčia pamokos nuorodą ir susitaria dėl detalių.</li>
        <li>Jei mokiniui nėra 14 metų, užklausą turi pateikti vienas iš tėvų arba globėjas.</li>
      </ul>

      <h2>3. Apmokėjimas</h2>
      <ul>
        <li>Už pamokas mokama bankiniu pavedimu pagal rekvizitus, nurodytus svetainėje arba gautus iš mūsų el. paštu.</li>
        <li>Pastovūs klientai gali iš anksto apmokėti susitartą pamokų skaičių.</li>
        <li>Karjeros testas apmokamas kortele per „Stripe“.</li>
      </ul>

      <h2>4. Atšaukimas ir perkėlimas</h2>
      <ul>
        <li><b>Jei pamokos negalite jūs:</b> praneškite mokytojui ne vėliau kaip prieš 24 valandas. Tuomet pamoką galima nemokamai perkelti.</li>
        <li><b>Vėlavimas:</b> mokytojas laukia iki 10 minučių. Jei vėluojate ilgiau ir iš anksto nepranešėte, pamoka atšaukiama, o už ją sumokėti pinigai negrąžinami.</li>
        <li><b>Jei pamokos negali mokytojas:</b> jis praneša el. paštu ir pasiūlo naujų laikų. Jei tinkamo laiko nerandama, pamoką perduodame kitam mokytojui, o jei ir tai nepavyksta – grąžiname už pamoką sumokėtus pinigus.</li>
      </ul>

      <h2>5. Elgesys pamokose</h2>
      <ul>
        <li>Prisijunkite laiku, turėkite veikiantį mikrofoną ir, jei reikia, kamerą.</li>
        <li>Pamokos neįrašinėjamos be abiejų šalių sutikimo.</li>
        <li>Mokymo medžiaga, kurią gaunate iš mokytojo, skirta tik jūsų mokymuisi.</li>
      </ul>

      <h2>6. Atsakomybė</h2>
      <p>
        Mokytojai stengiasi, kad kiekviena pamoka būtų naudinga, tačiau konkretūs pažymiai ar egzaminų rezultatai priklauso
        ir nuo paties mokinio, todėl jų negarantuojame. Neatsakome už trikdžius, kilusius dėl interneto ryšio ar trečiųjų
        šalių paslaugų („Google Meet“ ir kt.) sutrikimų. Tokiu atveju pamoką perkeliame.
      </p>
      <p>Svetainėje esantys žaidimai ir testai skirti mokymuisi ir pramogai. Jų rezultatai nėra profesinė rekomendacija.</p>

      <h2>7. Ginčai</h2>
      <p>
        Jei kyla klausimų ar nesutarimų, pirmiausia rašykite <a href="mailto:info.tiksliukai@gmail.com">info.tiksliukai@gmail.com</a>,
        stengsimės juos išspręsti per 14 dienų. Jei nepavyksta, vartotojai gali kreiptis į{" "}
        <a href="https://vvtat.lrv.lt" target="_blank" rel="noopener noreferrer">Valstybinę vartotojų teisių apsaugos tarnybą</a>.
        Taikoma Lietuvos Respublikos teisė.
      </p>

      <h2>8. Taisyklių pakeitimai</h2>
      <p>Taisykles galime atnaujinti. Užsakytoms pamokoms taikomos tuo metu galiojusios taisyklės.</p>
    </LegalPage>
  );
}
