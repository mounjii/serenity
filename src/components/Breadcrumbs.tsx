import Link from "next/link";
import { ChevronRight } from "@/components/Icons";
import { getI18n } from "@/i18n/server";

export default async function Breadcrumbs({ current }: { current: string }) {
  const { t, href } = await getI18n();

  return (
    <nav aria-label={t.nav.breadcrumb} className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem]">
        <li>
          <Link href={href("/")} className="text-sage transition hover:text-ink">
            {t.nav.home}
          </Link>
        </li>
        <li aria-hidden="true" className="text-sage">
          <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
        </li>
        <li className="font-medium text-ink" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
