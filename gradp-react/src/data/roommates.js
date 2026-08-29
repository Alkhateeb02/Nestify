/* 
 * بيانات وهمية لشركاء السكن المقترحين
 * Mock data for suggested roommates
 */

export const MOCK_SUGGESTIONS = [
  { 
    id: 1, 
    name: "Ahmad Al-Rashid", 
    phone: "+962 79 123 4567", 
    major: "Computer Science", 
    year: "3rd Year", 
    hasReservation: true 
  },
  { 
    id: 2, 
    name: "Sara Al-Mansouri", 
    phone: "+962 77 234 5678", 
    major: "Civil Engineering", 
    year: "2nd Year", 
    hasReservation: false 
  },
  { 
    id: 3, 
    name: "Omar Khalil", 
    phone: "+962 78 345 6789", 
    major: "Business Admin", 
    year: "4th Year", 
    hasReservation: true 
  },
  { 
    id: 4, 
    name: "Lina Haddad", 
    phone: "+962 79 456 7890", 
    major: "Architecture", 
    year: "1st Year", 
    hasReservation: false 
  },
  { 
    id: 5, 
    name: "Yousef Al-Sayed", 
    phone: "+962 77 567 8901", 
    major: "Electrical Engineering", 
    year: "3rd Year", 
    hasReservation: true 
  },
];

export const STATUS = { 
  PENDING: "pending", 
  ACCEPTED: "accepted", 
  REJECTED: "rejected" 
};
