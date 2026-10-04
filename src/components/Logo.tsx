import Link from "next/link";
import { LotusIcon } from "./Icons";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="#home" className={`flex items-center gap-2.5 ${className}`}>
      <LotusIcon className="h-8 w-8 text-ink" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.55rem] tracking-wide text-ink">
          Serenity
        </span>
        <span className="mt-0.5 text-[0.55rem] tracking-[0.2em] text-muted">
          Massage & Wellness Spa
        </span>
      </span>
    </Link>
  );
}
