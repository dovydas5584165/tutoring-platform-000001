/**
 * Contract withdrawal page (14-day right of withdrawal) with the withdrawal form.
 */

import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import WithdrawalForm from "@/components/WithdrawalForm";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Sutarties atsisakymas",
  description: "Atsisakykite pamokų ar karjeros testo sutarties per 14 dienų nenurodydami priežasties.",
  path: "/sutarties-atsisakymas",
});

/*
 * Online withdrawal function required for distance contracts since 19 June 2026
 * (Consumer Rights Directive Art. 11a, added by Directive (EU) 2023/2673).
 * It must be easy to find, clearly labelled and end with a "confirm withdrawal" button.
 */
export default function WithdrawalPage() {
  return (
    <LegalPage title="Atsisakyti sutarties" updated="2026 m. lapkričio 8 d.">
      <p>
        Per 14 dienų nuo sutarties sudarymo galite atsisakyti pamokų ar karjeros testo sutarties nenurodydami
        priežasties. Užpildykite formą žemiau: atsakymą su užklausos turiniu, data ir laiku iškart gausite el. paštu.
        Daugiau apie atsisakymo teisę rasite{" "}
        <Link href="/taisykles#atsisakymas">taisyklių 5 skyriuje</Link>.
      </p>
      <WithdrawalForm />
    </LegalPage>
  );
}
