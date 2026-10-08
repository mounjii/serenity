import type { Locale } from "./config";

/**
 * Customer-facing WhatsApp wording in each language. Placeholders: {name} full name, {first} first name,
 * {service}, {date}, {time}, {ref}, {deadline}. Messages to the salon owner stay in English.
 */
export type WhatsAppWording = {
  /** Customer → salon, pre-filled wa.me text on the confirmation page. */
  customerConfirm: string;
  customerCancel: string;
  /** Salon → customer, pre-filled wa.me text from the admin. */
  ownerRequest: string;
  ownerConfirmed: string;
  ownerCancelled: string;
  /** Automatic messages (Meta provider). */
  request: string;
  confirmed: string;
  cancelled: string;
  expired: string;
  confirmButton: string;
  cancelButton: string;
};

export const WHATSAPP_WORDING: Record<Locale, WhatsAppWording> = {
  en: {
    customerConfirm: "Hello Touch Sense, I confirm my reservation.\nName: {name}\nService: {service}\nDate: {date}\nTime: {time}\nRef: {ref}",
    customerCancel: "Hello Touch Sense, I would like to cancel my reservation.\nName: {name}\nService: {service}\nDate: {date}\nTime: {time}\nRef: {ref}",
    ownerRequest:
      "Hello {first}, this is Touch Sense. Please confirm your reservation: {service} on {date} at {time}. Reply YES to confirm or NO to cancel. Thank you!",
    ownerConfirmed: "Hello {first}, your reservation at Touch Sense is confirmed: {service} on {date} at {time}. Payment is made at the salon. See you soon!",
    ownerCancelled:
      "Hello {first}, your reservation at Touch Sense for {service} on {date} at {time} has been cancelled. You are welcome to book another time.",
    request:
      'Please confirm your reservation. Service: {service} / Date: {date} / Time: {time}. Tap "Confirm" before {deadline}, otherwise the reservation is cancelled automatically.',
    confirmed: "Your reservation is confirmed. Service: {service} / Date: {date} / Time: {time}. Thank you for your reservation.",
    cancelled: "Your reservation for {service} on {date} at {time} has been cancelled.",
    expired: "Your reservation for {service} on {date} at {time} was not confirmed in time and has been cancelled. You are welcome to book again.",
    confirmButton: "Confirm",
    cancelButton: "Cancel",
  },
  fr: {
    customerConfirm: "Bonjour Touch Sense, je confirme ma réservation.\nNom : {name}\nSoin : {service}\nDate : {date}\nHeure : {time}\nRéf : {ref}",
    customerCancel: "Bonjour Touch Sense, je souhaite annuler ma réservation.\nNom : {name}\nSoin : {service}\nDate : {date}\nHeure : {time}\nRéf : {ref}",
    ownerRequest:
      "Bonjour {first}, ici Touch Sense. Merci de confirmer votre réservation : {service} le {date} à {time}. Répondez OUI pour confirmer ou NON pour annuler. Merci !",
    ownerConfirmed:
      "Bonjour {first}, votre réservation chez Touch Sense est confirmée : {service} le {date} à {time}. Le paiement se fait au salon. À bientôt !",
    ownerCancelled:
      "Bonjour {first}, votre réservation chez Touch Sense pour {service} le {date} à {time} a été annulée. N’hésitez pas à réserver un autre créneau.",
    request:
      "Merci de confirmer votre réservation. Soin : {service} / Date : {date} / Heure : {time}. Appuyez sur « Confirmer » avant {deadline}, sinon la réservation sera annulée automatiquement.",
    confirmed: "Votre réservation est confirmée. Soin : {service} / Date : {date} / Heure : {time}. Merci pour votre réservation.",
    cancelled: "Votre réservation pour {service} le {date} à {time} a été annulée.",
    expired: "Votre réservation pour {service} le {date} à {time} n’a pas été confirmée à temps et a été annulée. N’hésitez pas à réserver de nouveau.",
    confirmButton: "Confirmer",
    cancelButton: "Annuler",
  },
  ar: {
    customerConfirm: "مرحبًا Touch Sense، أؤكد حجزي.\nالاسم: {name}\nالخدمة: {service}\nالتاريخ: {date}\nالوقت: {time}\nالمرجع: {ref}",
    customerCancel: "مرحبًا Touch Sense، أرغب في إلغاء حجزي.\nالاسم: {name}\nالخدمة: {service}\nالتاريخ: {date}\nالوقت: {time}\nالمرجع: {ref}",
    ownerRequest:
      "مرحبًا {first}، معك Touch Sense. يرجى تأكيد حجزك: {service} يوم {date} على الساعة {time}. أجب بـ «نعم» للتأكيد أو «لا» للإلغاء. شكرًا لك!",
    ownerConfirmed: "مرحبًا {first}، تم تأكيد حجزك لدى Touch Sense: {service} يوم {date} على الساعة {time}. يتم الدفع في المركز. نراك قريبًا!",
    ownerCancelled: "مرحبًا {first}، تم إلغاء حجزك لدى Touch Sense: {service} يوم {date} على الساعة {time}. يسعدنا استقبالك في موعد آخر.",
    request:
      "يرجى تأكيد حجزك. الخدمة: {service} / التاريخ: {date} / الوقت: {time}. اضغط على «تأكيد» قبل {deadline}، وإلا سيُلغى الحجز تلقائيًا.",
    confirmed: "تم تأكيد حجزك. الخدمة: {service} / التاريخ: {date} / الوقت: {time}. شكرًا لحجزك.",
    cancelled: "تم إلغاء حجزك: {service} يوم {date} على الساعة {time}.",
    expired: "لم يتم تأكيد حجزك ({service} يوم {date} على الساعة {time}) في الوقت المحدد، لذلك تم إلغاؤه. يسعدنا أن تحجز من جديد.",
    confirmButton: "تأكيد",
    cancelButton: "إلغاء",
  },
};
