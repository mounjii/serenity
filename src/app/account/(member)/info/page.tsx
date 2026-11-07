import type { ReactNode } from "react";
import Link from "next/link";
import { saveAvatarAction } from "@/app/account/actions";
import PasswordForm from "@/components/account/PasswordForm";
import ProfilePhotoForm from "@/components/account/ProfilePhotoForm";
import { CalendarIcon, EyeOffIcon, HeartIcon, LeafIcon, LotusIcon, MailIcon, PhoneIcon, UserIcon } from "@/components/Icons";
import { formatDayIn } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { isDiscoverySource, isVisitFrequency, isWellnessGoal } from "@/lib/customer-preferences";
import { formatPhone } from "@/lib/phone";
import { toLocalDateString } from "@/lib/time";
import { getCustomerBookings } from "@/server/customer/bookings";
import { getCustomerProfile, preferredMassageName } from "@/server/customer/preferences";
import { requireCustomerPage } from "@/server/customer/session";

export default async function InfoPage() {
  const session = await requireCustomerPage();
  const { t, locale, href } = await getI18n();
  const [bookings, profile] = await Promise.all([getCustomerBookings(session.phone, locale), getCustomerProfile(session.id)]);
  const savedMassage = await preferredMassageName(profile?.preferredMassage ?? null, locale);
  const massages = savedMassage ? [savedMassage] : [...new Set(bookings.map((booking) => booking.serviceName))];
  const goal = profile?.wellnessGoal && isWellnessGoal(profile.wellnessGoal) ? t.finder.goals[profile.wellnessGoal].label : t.account.birthdayEmpty;
  const frequency = profile?.visitFrequency && isVisitFrequency(profile.visitFrequency) ? t.account.frequencies[profile.visitFrequency] : t.account.birthdayEmpty;
  const found = profile?.discovery && isDiscoverySource(profile.discovery) ? t.account.discoveries[profile.discovery] : t.account.birthdayEmpty;
  const preferencesDone = Boolean(profile?.preferredMassage && profile.wellnessGoal && profile.visitFrequency && profile.discovery);

  return (
    <div className="space-y-5">
      <h1 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">{t.account.navProfile}</h1>

      <section className="rounded-2xl border border-sand bg-white p-4 sm:p-5">
        <ProfilePhotoForm
          src={profile?.avatarType ? `/account/avatar?v=${profile.updatedAt.getTime()}` : null}
          initials={session.name}
          title={t.account.photo}
          hint={t.account.photoHint}
          changeLabel={t.account.photoChange}
          saveLabel={t.account.photoSave}
          removeLabel={t.account.photoRemove}
          savedLabel={t.account.photoSaved}
          action={saveAvatarAction}
        />
        <h2 className="mt-6 flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
          <UserIcon className="h-5 w-5" />
          {t.account.navProfile}
        </h2>
        <dl className="mt-4 divide-y divide-black/10">
          <ProfileRow icon={<UserIcon className="h-4 w-4" />} label={t.account.name} value={session.name} />
          <ProfileRow icon={<PhoneIcon className="h-4 w-4" />} label={t.account.phone} value={formatPhone(session.phone)} />
          <ProfileRow icon={<MailIcon className="h-4 w-4" />} label={t.account.email} value={profile?.email ?? t.account.birthdayEmpty} />
          <ProfileRow
            icon={<CalendarIcon className="h-4 w-4" />}
            label={t.account.dateOfBirth}
            value={profile?.birthday ? formatDayIn(locale, toLocalDateString(profile.birthday), true) : t.account.birthdayEmpty}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-sand bg-white p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
          <EyeOffIcon className="h-5 w-5" />
          {t.account.password}
        </h2>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border border-sand bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
            <HeartIcon className="h-5 w-5" />
            {t.account.wellnessTitle}
          </h2>
          {!preferencesDone && (
            <Link href={href("/account/preferences")} className="text-[0.78rem] font-medium text-sage underline-offset-4 hover:text-ink hover:underline">
              {t.account.preferencesTitle}
            </Link>
          )}
        </div>
        <dl className="mt-4 divide-y divide-black/10">
          <ProfileRow
            icon={<LeafIcon className="h-4 w-4" />}
            label={t.account.preferredMassages}
            value={massages.length > 0 ? massages.join(", ") : t.account.birthdayEmpty}
          />
          <ProfileRow icon={<LotusIcon className="h-4 w-4" />} label={t.account.mainGoal} value={goal} />
          <ProfileRow icon={<CalendarIcon className="h-4 w-4" />} label={t.account.visitFrequency} value={frequency} />
          <ProfileRow icon={<HeartIcon className="h-4 w-4" />} label={t.account.discovery} value={found} />
          <ProfileRow icon={<HeartIcon className="h-4 w-4" />} label={t.account.preferredLanguage} value={t.account.languageName} />
        </dl>
      </section>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-3">
      <dt className="flex items-center gap-2 text-[0.8rem] text-sage">
        {icon}
        {label}
      </dt>
      <dd className="text-[0.92rem] text-ink">{value}</dd>
    </div>
  );
}
