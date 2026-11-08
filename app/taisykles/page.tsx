/**
 * Terms of service.
 */

import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { pageMeta, SELLER } from "@/lib/site";

export const metadata = pageMeta({
  title: "Naudojimosi taisyklės",
  description: "Tiksliukai.lt pamokų ir karjeros testo užsakymo, apmokėjimo, atsisakymo, atšaukimo ir perkėlimo taisyklės.",
  path: "/taisykles",
});

/** Terms of service text. */
export default function Terms() {
  return (
    <LegalPage title="Naudojimosi taisyklės" updated="2026 m. lapkričio 8 d.">
      <p>
        Šios taisyklės taikomos naudojantis svetaine Tiksliukai.lt, užsakant individualias ar grupines pamokas ir
        karjeros testą. Užsakydami patvirtinate, kad su jomis susipažinote ir sutinkate. Kaip tvarkome asmens duomenis,
        rasite <Link href="/privatumo-politika">privatumo politikoje</Link>.
      </p>

      <h2>1. Paslaugų teikėjas</h2>
      <ul>
        <li><b>Teikėjas:</b> {SELLER.name}, {SELLER.legalForm}</li>
        {SELLER.code && <li><b>Individualios veiklos pažymos nr.:</b> {SELLER.code}</li>}
        {SELLER.vatCode && <li><b>PVM mokėtojo kodas:</b> {SELLER.vatCode}</li>}
        <li><b>Adresas:</b> {SELLER.address}</li>
        <li><b>El. paštas:</b> <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a></li>
      </ul>
      <p>Sutartys sudaromos lietuvių kalba.</p>

      <h2>2. Paslaugos ir kainos</h2>
      <ul>
        <li>Individualios nuotolinės pamokos 1–12 klasių mokiniams per „Google Meet“. Vienos pamokos trukmė – 45 minutės, kaina – 25 €, jei nesusitarta kitaip.</li>
        <li>Grupinės pamokos – kainos nurodytos grupinių pamokų puslapyje (nuo 22 € už pamoką).</li>
        <li>Karjeros testas „Pašaukimas“ su konsultacija – 119 €, vienkartinis mokėjimas. Prenumeratų ir automatinio pratęsimo nėra.</li>
        <li>Visos kainos nurodytos eurais, galutinės, su visais mokesčiais.</li>
      </ul>

      <h2>3. Nepilnamečiai</h2>
      <p>
        Paslaugas užsakyti gali pilnamečiai asmenys. Jei mokiniui dar nėra 18 metų, užsakymą pateikia vienas iš tėvų
        arba globėjas, arba 14–17 metų mokinys su jų sutikimu. Jei mokiniui nėra 14 metų, užklausą ar registraciją
        visada pildo vienas iš tėvų arba globėjas.
      </p>

      <h2>4. Kaip sudaroma sutartis ir mokama</h2>
      <ul>
        <li><b>Individualios pamokos:</b> pamokos puslapyje pasirenkate dalyką, pažymite bent 5 jums tinkamus laikus ir pateikiate užklausą. Užklausa nemokama ir neįpareigoja. Sutartis sudaroma, kai mokytojas pasirenka vieną iš jūsų laikų ir jūs gaunate patvirtinimo laišką.</li>
        <li>Už pamokas mokama bankiniu pavedimu pagal rekvizitus, nurodytus svetainėje arba gautus iš mūsų el. paštu. Pastovūs klientai gali iš anksto apmokėti susitartą pamokų skaičių.</li>
        <li><b>Karjeros testas:</b> sutartis sudaroma, kai apmokate kortele ar kitu būdu per „Stripe“. Po apmokėjimo iškart pateksite į testą, o konsultacijos laiką suderiname el. paštu. Konsultacija galioja 3 mėnesius nuo apmokėjimo.</li>
      </ul>

      <h2 id="atsisakymas">5. Teisė atsisakyti sutarties (14 dienų)</h2>
      <p>
        Vartotojas gali atsisakyti sutarties per 14 dienų nuo jos sudarymo nenurodydamas priežasties. Tai paprasčiausia
        padaryti <Link href="/sutarties-atsisakymas">sutarties atsisakymo formoje</Link> arba parašius{" "}
        <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>. Sumokėtus pinigus grąžiname ne vėliau kaip per 14 dienų
        nuo pranešimo gavimo tuo pačiu būdu, kuriuo mokėjote.
      </p>
      <ul>
        <li>
          <b>Pamokos:</b> jei prašote, kad pamokos vyktų dar per 14 dienų terminą (tai patvirtinate pateikdami
          užklausą), įvykusios pamokos atsisakyti nebegalima. Atsisakant sutarties, grąžiname pinigus už dar neįvykusias
          pamokas.
        </li>
        <li>
          <b>Karjeros testas:</b> testas yra skaitmeninis turinys. Jei prieš mokėdami aiškiai sutinkate, kad prieiga
          prie testo būtų suteikta iškart, ir patvirtinate, kad žinote, jog tada prarandate atsisakymo teisę dėl testo,
          testo dalies atsisakyti nebegalima. Jei konsultacija dar neįvyko, per 14 dienų galite atsisakyti
          konsultacijos ir susigrąžinti už ją tenkančią sumos dalį.
        </li>
      </ul>

      <h2>6. Pamokų atšaukimas ir perkėlimas</h2>
      <ul>
        <li><b>Jei pamokos negalite jūs:</b> praneškite mokytojui ne vėliau kaip prieš 24 valandas. Tuomet pamoką galima nemokamai perkelti.</li>
        <li><b>Vėlavimas:</b> mokytojas laukia iki 10 minučių. Jei vėluojate ilgiau ir iš anksto nepranešėte, pamoka atšaukiama, o už ją sumokėti pinigai negrąžinami.</li>
        <li><b>Jei pamokos negali mokytojas:</b> jis praneša el. paštu ir pasiūlo naujų laikų. Jei tinkamo laiko nerandama, pamoką perduodame kitam mokytojui, o jei ir tai nepavyksta – grąžiname už pamoką sumokėtus pinigus.</li>
      </ul>

      <h2>7. Elgesys pamokose</h2>
      <ul>
        <li>Prisijunkite laiku, turėkite veikiantį mikrofoną ir, jei reikia, kamerą.</li>
        <li>Pamokos neįrašinėjamos be abiejų šalių (o nepilnamečio mokinio – ir tėvų) sutikimo.</li>
        <li>Mokymo medžiaga, kurią gaunate iš mokytojo, skirta tik jūsų mokymuisi.</li>
      </ul>

      <h2>8. Atsakomybė</h2>
      <p>
        Mokytojai stengiasi, kad kiekviena pamoka būtų naudinga, tačiau konkretūs pažymiai ar egzaminų rezultatai priklauso
        ir nuo paties mokinio, todėl jų negarantuojame. Neatsakome už trikdžius, kilusius dėl interneto ryšio ar trečiųjų
        šalių paslaugų („Google Meet“ ir kt.) sutrikimų. Tokiu atveju pamoką perkeliame. Šios taisyklės neriboja
        vartotojų teisių, kurias suteikia Lietuvos Respublikos įstatymai.
      </p>
      <p>Svetainėje esantys žaidimai ir testai skirti mokymuisi ir pramogai. Jų rezultatai nėra profesinė rekomendacija.</p>

      <h2>9. Pretenzijos ir ginčai</h2>
      <p>
        Jei paslauga suteikta netinkamai, rašykite <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>. Atsakysime
        per 14 dienų. Jei ginčo nepavyksta išspręsti, vartotojas gali nemokamai kreiptis į{" "}
        <a href="https://vvtat.lrv.lt" target="_blank" rel="noopener noreferrer">Valstybinę vartotojų teisių apsaugos tarnybą</a>{" "}
        arba į teismą. Taikoma Lietuvos Respublikos teisė.
      </p>

      <h2>10. Taisyklių pakeitimai</h2>
      <p>Taisykles galime atnaujinti. Užsakytoms paslaugoms taikomos užsakymo metu galiojusios taisyklės.</p>
    </LegalPage>
  );
}
