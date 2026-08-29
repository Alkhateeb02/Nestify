import { User } from './User.js';

export class Student extends User {
  constructor(userData, { university, major, gender, smokingStatus }) {
    super(userData);
    this.university = university;
    this.major = major;
    this.gender = gender;
    this.smokingStatus = smokingStatus;
  }

  searchProperty(criteria) {
    // Logic to search properties
  }

  requestBooking(property, unit) {
    // Logic to request a booking
  }

  writeReview(property, reviewData) {
    // Logic to write a review
  }

  reportMaintenance(unit, issueDescription) {
    // Logic to report maintenance
  }
}
