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
