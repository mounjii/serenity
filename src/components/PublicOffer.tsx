import { LimitedOffer } from "@/components/account/LoyaltyAlerts";
import { getPublicOffer } from "@/server/loyalty/engine";
import Reveal from "./Reveal";

export default async function PublicOffer() {
  const offer = await getPublicOffer();
  if (!offer) return null;
  return (
    <section className="w-full px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <Reveal variant="fade">
        <LimitedOffer percent={offer.percent} message={offer.message} expiresAt={offer.expiresAt} />
      </Reveal>
    </section>
  );
}
