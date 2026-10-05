type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LotusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M24 12c-4 4.5-5.5 9.5-5.5 14S20.5 35 24 37c3.5-2 5.5-6.5 5.5-11S28 16.5 24 12Z" />
      <path d="M18.6 22.5C14.5 20.6 10 20.8 7 22c1.2 6.8 6.6 13.4 17 15" />
      <path d="M29.4 22.5c4.1-1.9 8.6-1.7 11.6-.5-1.2 6.8-6.6 13.4-17 15" />
      <path d="M12 30.5C8.6 30.6 6 31.6 4.5 33c4 3.4 11 4.6 19.5 4" />
      <path d="M36 30.5c3.4.1 6 1.1 7.5 2.5-4 3.4-11 4.6-19.5 4" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M24 40V18" />
      <path d="M24 30c-7 0-12-5-12-14 7 0 12 5 12 14Z" />
      <path d="M24 26c7 0 12-5 12-14-7 0-12 5-12 14Z" />
      <path d="M24 18c-3-3-3-7 0-10 3 3 3 7 0 10Z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M24 39S8 29.5 8 18.5C8 13.8 11.6 10 16.2 10c3.4 0 6.2 2 7.8 5 1.6-3 4.4-5 7.8-5 4.6 0 8.2 3.8 8.2 8.5C40 29.5 24 39 24 39Z" />
    </svg>
  );
}

export function SparkLotusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M24 14c-3 3.5-4.2 7.4-4.2 11s1.4 7 4.2 8.6c2.8-1.6 4.2-5 4.2-8.6S27 17.5 24 14Z" />
      <path d="M19.9 23c-3.4-1.6-7-1.4-9.6-.4 1 5.8 5.6 10.6 13.7 11" />
      <path d="M28.1 23c3.4-1.6 7-1.4 9.6-.4-1 5.8-5.6 10.6-13.7 11" />
      <path d="M8 38h32" />
      <path d="M24 6v3M14 9l1.6 2.4M34 9l-1.6 2.4" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.6} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowUp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.4} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.2 3C7.3 3 4.8 6.5 4.8 9.4c0 1.8.7 3.4 2.1 4 .2.1.4 0 .5-.3l.2-.8c.1-.3 0-.4-.2-.6-.4-.5-.7-1.2-.7-2.1 0-2.7 2-5.1 5.3-5.1 2.9 0 4.4 1.8 4.4 4.1 0 3.1-1.4 5.7-3.4 5.7-1.1 0-2-.9-1.7-2.1.3-1.4 1-2.9 1-3.9 0-.9-.5-1.6-1.5-1.6-1.2 0-2.1 1.2-2.1 2.8 0 1 .3 1.7.3 1.7l-1.4 5.9c-.4 1.7-.1 3.9 0 4.1 0 .1.2.2.3.1.1-.1 1.4-1.8 1.9-3.4l.7-2.9c.4.7 1.4 1.3 2.6 1.3 3.4 0 5.7-3.1 5.7-7.2C18.9 5.9 16.2 3 12.2 3Z" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.4} {...props}>
      <path d="M5.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.4} {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.4} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.4} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}
