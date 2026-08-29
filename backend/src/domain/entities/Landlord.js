import { User } from './User.js';

export class Landlord extends User {
  constructor(userData, { nationalID, verificationStatus, rating }) {
    super(userData);
    this.nationalID = nationalID;
    this.verificationStatus = verificationStatus || 'PENDING';
    this.rating = rating || 0;
  }

  // Domain Rule: Only verified landlords can add properties (Diagram 4.0.29)
  canAddProperty() {
    return this.verificationStatus === 'APPROVED';
  }

  approve() {
    this.verificationStatus = 'APPROVED';
    this.verify(); // Also set base user to verified
  }

  reject() {
    this.verificationStatus = 'REJECTED';
  }

  updateRating(newScore) {
    // Logic to calculate moving average could go here
    this.rating = newScore;
  }
}

