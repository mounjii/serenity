import type { Goal, Pressure } from "@/lib/service-details";
import type { ErrorCode } from "@/server/errors";

export type ServiceText = { name: string; description: string };
export type ServiceDetailsText = {
  summary: string;
  expectSummary: string;
  benefits: [string, string, string];
  intro: string;
  highlights: string[];
  idealFor: string;
  why: string;
  helpsWith: string[];
};
export type PrivacyBlock = { p: string; link?: { text: string; href: string } } | { ul: string[] };

const en = {
  meta: {
    title: "Touch Sense — Thai Massage",
    description: "Escape the everyday and give your body and mind the care they deserve. Professional massage and wellness treatments.",
    reservationTitle: "Book a massage — Touch Sense",
    reservationDescription: "Choose your treatment, pick a time and confirm your reservation in a minute.",
    confirmationTitle: "Your reservation — Touch Sense",
    privacyTitle: "Privacy Policy — Touch Sense",
    privacyDescription: "How Touch Sense Thai Massage collects, uses and protects your personal data.",
  },
  nav: {
    home: "Home",
    about: "About",
    services: "Services",
    gallery: "Gallery",
    contact: "Contact",
    login: "Login",
    bookNow: "Book Now",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    hours: "Open every day · 10:00 – 22:00",
    language: "Language",
  },
  hero: {
    relax: "Relax",
    recharge: "Recharge",
    reconnect: "Reconnect",
    title1: "More Than a Massage,",
    title2: "It’s a Reset",
    text: "Escape the everyday and give your body and mind the care they deserve.",
    cta: "Book Your Session",
    treatments: "Our treatments",
    scroll: "Scroll",
    scrollAria: "Scroll to discover",
    imageAlt: "Spa treatment room with a massage table, rolled towels and candles",
  },
  features: [
    { title: "Professional Therapists", text: "Skilled and certified therapists for your well-being." },
    { title: "Natural & Safe Products", text: "We use only the best essential oils and natural products." },
    { title: "Personalized Care", text: "Every session is tailored to your needs." },
    { title: "A Peaceful Environment", text: "Designed for your total relaxation." },
  ],
  about: {
    eyebrow: "About Us",
    title1: "Your Wellness",
    title2: "Is Our Priority",
    text: "At Touch Sense, we believe that true well-being comes from balance. Our mission is to provide a peaceful space where you can relax, recharge and reconnect with yourself through the power of touch.",
    cta: "Book Now",
    imageAlt: "Rolled towels and candles",
  },
  treatments: {
    eyebrow: "Our Services",
    title: "Massage & Wellness Treatments",
    text: "Choose from our range of professional treatments designed to relax your body, calm your mind and restore your energy.",
    count: "{n} treatments",
    swipe: "Swipe",
    details: "Details & prices",
    durations: "Durations",
    detailsAria: "{name}: details and prices",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "What Our Clients Say",
    items: [
      {
        quote:
          "Very good massage. Everyone speaks English and is very kind, easy to make appointment through WhatsApp. Very clean and professional.",
        name: "Deniz Narli",
      },
      {
        quote:
          "I had massage from them before and appreciate the knowledge and proficiency. Did have some back issues but became better after a few visits.",
        name: "Jonathan GDM",
      },
      {
        quote: "Wonderful experience",
        name: "YassineKz",
      },
      {
        quote: "I love it",
        name: "Naima Imam",
      },
    ],
    source: "Google review",
    prev: "Previous testimonial",
    next: "Next testimonial",
    show: "Show testimonial {n}",
    imageAlt: "Zen stones, candle and orchid",
  },
  cta: {
    eyebrow: "Ready to Feel Better?",
    title: "Book Your Massage Today",
    text: "Take the first step towards a healthier, happier you.",
    button: "Book Now",
  },
  gallery: {
    eyebrow: "Our Space",
    title: "A Place for Peace",
    text: "Step into a serene environment designed to help you unwind and feel at ease.",
    swipe: "Swipe →",
    fallbackAlt: "Touch Sense salon",
    alts: [
      "Massage room with a Thai silk table cover and candles",
      "Treatment room with a massage table and a lounge sofa",
      "Traditional Thai massage mat lit by lanterns",
      "Candle-lit massage room with lotus flowers",
      "Waiting area with an elephant painting",
      "Reception desk in the warm-lit hallway",
      "Wooden shelf with lanterns and candles",
      "Reception counter with Thai balms and herbal products",
    ],
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "Contact Us",
    text: "A question about a treatment, a gift, or a special request? Message us on WhatsApp or give us a call. We reply quickly.",
    whatsapp: "Chat on WhatsApp",
    call: "Call now",
    callUs: "Call us",
    visitUs: "Visit us",
    email: "Email",
    hours: "Opening hours",
    hoursValue: "Monday – Sunday · 10:00 – 22:00",
    greeting: "Hello Touch Sense, I would like some information.",
    address: "2nd floor, 42 Ave Al Haouz, Rabat 10140",
    mapTitle: "Map showing Touch Sense",
  },
  footer: {
    rights: "© {year} Touch Sense Thai Massage. All rights reserved.",
    privacy: "Privacy Policy",
    bookings: "Bookings",
    backToTop: "Back to top",
  },
  bookBar: { hours: "Every day · 10:00 – 22:00" },
  reservation: {
    eyebrow: "Reservation",
    title: "Book Your Massage",
    text: "Choose your treatment, pick a time that suits you and confirm in a minute.",
    start: "Start booking",
  },
  booking: {
    steps: ["Service", "Date", "Time", "Details", "Confirm"],
    stepsAria: "Reservation steps",
    stepAria: "Step {n}: {label}",
    booked: "Booked",
    rest: "Rest",
    tooShort: "Too short",
    chooseTitle: "Choose your treatment",
    chooseSubtitle: "Tap a treatment to see the details and prices.",
    wellness1: "Your wellness",
    wellness2: "matters ♡",
    finderAgain: "Want to try again?",
    finderPrompt: "Not sure which one to choose?",
    finderText: "Answer 3 quick questions and we’ll suggest the best treatment for you.",
    helpMe: "Help me choose",
    noServices: "No treatments are available for booking right now.",
    recommended: "Recommended for you",
    from: "From {price}",
    min: "min",
    pickDate: "Pick a date",
    closed: "closed",
    openNote: "We are open every day, Monday to Sunday, 10:00 to 22:00.",
    chooseTime: "Choose a time",
    loadingTimes: "Loading available times…",
    tryAgain: "Try again",
    noTimes: "No available times on this day.",
    anotherDate: "Choose another date",
    fullyBooked: "This day is fully booked for a {duration} treatment.",
    legendBooked: "Booked: a session is in progress",
    legendRest: "Rest: {n}-minute pause after each session",
    legendShort: "Too short: not enough time before the next guest",
    detailsTitle: "Your details",
    detailsSubtitle: "After booking, you confirm your time on WhatsApp in one tap.",
    fullName: "Full name",
    phone: "Phone number",
    phoneHint: "Moroccan numbers can start with +212 or 0. International numbers are welcome.",
    note: "Note (optional)",
    back: "Back",
    continue: "Continue",
    review: "Review your reservation",
    service: "Service",
    date: "Date",
    time: "Time",
    name: "Name",
    phoneLabel: "Phone",
    noteLabel: "Note",
    price: "Price",
    payAtSalon: "Payment is made at the salon.",
    privacyBefore: "Your name and phone number are only used to manage this booking. See our",
    privacyLink: "Privacy Policy",
    privacyAfter: ".",
    confirming: "Confirming…",
    confirm: "Confirm reservation",
    allTreatments: "All treatments",
    treatment: "Treatment",
    duration: "Duration",
    restNote: "A {n}-minute rest is kept after every session.",
    bookDuration: "Book Now · {duration}",
    treatmentDetails: "Treatment details",
    overview: "Overview",
    pressure: "Pressure",
    idealFor: "Ideal for",
    whatToExpect: "What to expect",
    helpsWith: "Helps with",
    listSeparator: ", ",
  },
  finder: {
    back: "Back",
    questionOf: "Question {n} of 3",
    q1: "What would you like help with?",
    q2: "What pressure do you enjoy?",
    q3: "How much time do you have?",
    goals: {
      relax: { label: "Stress & relaxation", hint: "Switch off and unwind" },
      pain: { label: "Muscle pain & knots", hint: "Back, tight or aching muscles" },
      neck: { label: "Neck, shoulders & headaches", hint: "Desk and phone tension" },
      sport: { label: "Recovery after sport", hint: "Sore or overworked muscles" },
      feet: { label: "Tired legs & feet", hint: "Long days standing or walking" },
      flexibility: { label: "Stiffness & flexibility", hint: "Feel lighter and move better" },
    } as Record<Goal, { label: string; hint: string }>,
    pressures: [
      { label: "Light", hint: "Soft and soothing" },
      { label: "Medium", hint: "Relaxing but present" },
      { label: "Firm", hint: "Deep and intense" },
      { label: "Not sure", hint: "Let the therapist adapt" },
    ],
    times: ["30 min", "1 hour", "1 h 30", "2 hours"],
    yourMatch: "Your match",
    weRecommend: "We recommend",
    bestForYou: "Best for you",
    seeDetails: "See details · {duration}",
    alsoGood: "Also a good fit",
    medicalNote: "Pregnant, injured or have a medical condition? Mention it in the note at the next step.",
    startAgain: "Start again",
    madeFor: "Made for {goal}",
    pressureMatch: "{pressure} pressure, as you like it",
    availableIn: "Available in {duration}",
  },
  pressure: {
    Light: "Light",
    "Light to medium": "Light to medium",
    Medium: "Medium",
    "Medium to firm": "Medium to firm",
    Firm: "Firm",
  } as Record<Pressure, string>,
  /** Overrides for the names and texts stored in the database (English). */
  serviceNames: {} as Partial<Record<string, ServiceText>>,
  serviceDetails: {} as Partial<Record<string, ServiceDetailsText>>,
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "We couldn't reach the server. Please check your connection and try again.",
    slotTaken: "This time was just booked by someone else. Please choose another time.",
    loadTimes: "Could not load available times.",
    /** Used instead of the server's English message in the other languages. */
    codes: {
      TOO_SOON: "This time is too soon to book online. Please choose a later time.",
      TOO_FAR: "This date is too far ahead. Please choose an earlier date.",
      CLOSED: "The salon is closed on this day. Please choose another date.",
      OUTSIDE_OPENING_HOURS: "This time is outside our opening hours. Please choose another time.",
      INVALID_SLOT: "This time is no longer available. Please choose another time.",
      SLOT_TAKEN: "This time was just booked by someone else. Please choose another time.",
      SERVICE_UNAVAILABLE: "This treatment is not available for booking right now.",
      NO_THERAPIST: "No therapist is available at this time. Please choose another time.",
      NOT_FOUND: "This page or reservation could not be found.",
      SERVER_BUSY: "We are receiving many requests. Please try again in a moment.",
      INVALID_INPUT: "Some fields are invalid. Please check them and try again.",
    } as Partial<Record<ErrorCode, string>>,
  },
  fields: {
    nameRequired: "Please enter your name.",
    nameShort: "Name must be at least {n} characters.",
    nameLong: "Name must be at most {n} characters.",
    phoneInvalid: "Please enter a valid phone number.",
    noteLong: "Note must be at most {n} characters.",
  },
  confirmation: {
    eyebrow: "Reservation",
    pendingTitle: "Confirm your reservation on WhatsApp",
    pendingNote: "We sent you a WhatsApp message. Tap “Confirm” to secure your time.",
    confirmedTitle: "Your reservation is confirmed",
    confirmedNote: "Your confirmation has been sent to you on WhatsApp.",
    completedTitle: "Thank you for your visit",
    completedNote: "We hope to see you again soon.",
    cancelledTitle: "This reservation was cancelled",
    cancelledNote: "Feel free to book another time that suits you.",
    selfTitle: "One last step: confirm on WhatsApp",
    selfNote: "Tap the button, then press send in WhatsApp. We confirm your time as soon as we see your message.",
    thanks: "Thank you, {name}. We look forward to welcoming you.",
    heldBefore: "Your time is held until",
    heldAfter: ". Without confirmation, the reservation is cancelled automatically.",
    reserved: "Your time is reserved. Send us your confirmation on WhatsApp and we will confirm your booking.",
    confirmWa: "Confirm on WhatsApp",
    cancelWa: "Cancel on WhatsApp",
    backHome: "Back to home",
    bookAnother: "Book another massage",
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    updated: "Last updated: {date}",
    intro:
      "Your privacy matters to us as much as your comfort. This page explains, in plain words, what information we collect when you book with Touch Sense, why we need it, and how you stay in control of it.",
    sections: [
      {
        title: "Who we are",
        blocks: [
          {
            p: "Touch Sense Thai Massage (“Touch Sense”, “we”) is a massage salon located at 2nd floor, 42 Ave Al Haouz, Rabat 10140, Morocco. We are responsible for the personal data collected through this website.",
          },
        ],
      },
      {
        title: "What we collect",
        blocks: [
          { p: "When you book a treatment, we only ask for what we need to take care of your appointment:" },
          {
            ul: [
              "your name;",
              "your phone number;",
              "the treatment, date and time you choose;",
              "any note you decide to add (for example, a preference or a health detail you want the therapist to know).",
            ],
          },
          {
            p: "We do not ask for your email, address, date of birth or payment details. Payment is made at the salon. Please only share health information in the note if you want us to take it into account during your session.",
          },
        ],
      },
      {
        title: "Why we use it",
        blocks: [
          {
            ul: [
              "to book, confirm, change or cancel your appointment;",
              "to contact you about your booking by phone or WhatsApp;",
              "to prepare your session and respect the preferences you shared;",
              "to keep basic records of past bookings for the running of the salon.",
            ],
          },
        ],
      },
      {
        title: "Legal basis",
        blocks: [
          {
            p: "We process your data because it is necessary to provide the booking you request, and with your consent when you send us your details. This policy follows Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data.",
          },
        ],
      },
      {
        title: "Who can see it",
        blocks: [
          { p: "Only the Touch Sense team can see your booking details. We never sell or rent your data, and we do not use it for advertising." },
          { p: "Your data may pass through a few service providers that help us run the website, only for that purpose:" },
          {
            ul: [
              "our hosting provider, which stores the website and its database;",
              "WhatsApp (Meta), if you choose to message us or we confirm your booking there;",
              "Google Maps, which displays the map in the Contact section.",
            ],
          },
        ],
      },
      {
        title: "How long we keep it",
        blocks: [
          {
            p: "We keep booking details for as long as needed to manage your appointments and for a maximum of 3 years after your last visit, unless the law requires us to keep them longer. After that, they are deleted.",
          },
        ],
      },
      {
        title: "Cookies",
        blocks: [
          {
            p: "This website does not use advertising or tracking cookies. We use one essential cookie to remember the language you chose, and one for the salon’s private admin area, which visitors who book online do not receive.",
          },
          {
            p: "The map in the Contact section is provided by Google Maps, which may set its own cookies when it loads. You can read {link} for details.",
            link: { text: "Google’s privacy policy", href: "https://policies.google.com/privacy" },
          },
        ],
      },
      {
        title: "How we protect it",
        blocks: [
          {
            p: "Your data is stored on a secured server. Access to bookings is limited to the salon’s password-protected admin area, and we only keep the information described above.",
          },
        ],
      },
      {
        title: "Your rights",
        blocks: [
          {
            p: "You can ask us at any time to see the data we hold about you, to correct it, or to delete it. You can also object to its use. Just contact us using the details below; we will reply as quickly as possible.",
          },
          {
            p: "If you believe your rights are not respected, you can file a complaint with the CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) at {link}.",
            link: { text: "www.cndp.ma", href: "https://www.cndp.ma" },
          },
        ],
      },
      {
        title: "Changes to this policy",
        blocks: [{ p: "We may update this policy from time to time. The date at the top of this page shows when it was last changed." }],
      },
    ] as { title: string; blocks: PrivacyBlock[] }[],
    contactTitle: "Contact us",
    contactIntro: "For any question about your data or this policy:",
    contactPhone: "Phone / WhatsApp:",
    contactEmail: "Email:",
    contactSalon: "At the salon:",
    book: "Book a massage",
    backHome: "Back to home",
  },
};

type Widen<T> = T extends string
  ? string
  : T extends readonly [string, string, string]
    ? [string, string, string]
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Dictionary = Widen<typeof en>;

export default en satisfies Dictionary;
