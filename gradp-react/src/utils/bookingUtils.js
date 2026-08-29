import api from "./api";

/**
 * bookingUtils.js
 * دوال مساعدة لحفظ بيانات الحجوزات وتنسيق أرقام البطاقات.
 */

/** حساب تاريخ النهاية بناءً على فترة الإيجار */
export function calculateEndDate(startDate, rentalPeriod, days = 1) {
  if (!startDate) return null;
  const start = new Date(startDate);
  switch (rentalPeriod) {
    case "seasonal":
      // فصلي = 4 أشهر
      start.setMonth(start.getMonth() + 4);
      return start.toISOString();
    case "monthly": {
      const year = start.getFullYear();
      const month = start.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      return lastDay.toISOString();
    }
    case "daily":
      start.setDate(start.getDate() + parseInt(days));
      return start.toISOString();
    default:
      start.setMonth(start.getMonth() + 1);
      return start.toISOString();
  }
}

/** بناء كائن الحجز */
export function createBookingObject(property, method, extras = {}) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};

  const rentalPeriod = extras.rentalPeriod || property.rentalPeriod || "monthly";
  const startDate = extras.startDate || null;
  const numberOfDays = extras.numberOfDays || 1;
  const endDate = startDate ? calculateEndDate(startDate, rentalPeriod, numberOfDays) : null;

  return {
    id: Date.now(),
    studentName: user.name || "Ahmad Student",
    studentPhone: user.phone_number || "0791234567",
    propertyTitle: property.title,
    propertyId: property.id,
    ownerName: property.ownerName ?? "Property Owner",
    ownerPhone: property.ownerPhone ?? "0791234567",
    location: property.location || property.locationText,
    payMethod: method,
    rentalPeriod,
    startDate,
    endDate,
    status: "pending",
    requestDate: new Date().toISOString(),
  };
}

/** حفظ الحجز في السيرفر */
export async function saveBooking(booking, extraPaymentData = {}) {
  try {
    const res = await api.post("/bookings", {
      propertyId: booking.propertyId.toString(),
      checkinDate: booking.startDate,
      numberOfDays: booking.numberOfDays,
      paymentData: { 
        method: booking.payMethod,
        ...extraPaymentData
      }
    });
    return res;
  } catch (err) {
    console.error("Booking Error:", err);
    throw err;
  }
}
/** تنسيق رقم البطاقة (كل 4 أرقام مسافة) */
export const formatCardNumber = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();

/** تنسيق تاريخ البطاقة MM/YY */
export const formatExpiry = (v) =>
  v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");
