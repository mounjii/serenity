/** Public address of the site, used for canonical links, the sitemap and share previews. */
export const SITE_URL = (process.env.SITE_URL?.trim() || "https://touchsensespa.com").replace(/\/+$/, "");

export const SITE_NAME = "Touch Sense Thai Massage";

/** Share preview for WhatsApp, Facebook, Instagram…: 1200×630. */
export const OG_IMAGE = { url: "/images/og.jpg", width: 1200, height: 630 } as const;

export const BUSINESS_ADDRESS = {
  streetAddress: "42 Ave Al Haouz, 2nd floor",
  addressLocality: "Rabat",
  postalCode: "10140",
  addressCountry: "MA",
} as const;

export const OPENING_HOURS = { opens: "10:00", closes: "22:00" } as const;
