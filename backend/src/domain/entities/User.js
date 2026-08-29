export class User {
  constructor({ userID, fullName, email, password, phoneNumber, isVerified = false, profileImage = null }) {
    this.userID = userID;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.isVerified = isVerified;
    this.profileImage = profileImage;
  }

  updateProfile(newData) {
    // Validate email format if provided
    if (newData.email && !newData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    Object.assign(this, newData);
  }

  verify() {
    this.isVerified = true;
  }

  login() {
    console.log(`User ${this.email} logged in at ${new Date().toISOString()}`);
  }

  logout() {
    console.log(`User ${this.email} logged out at ${new Date().toISOString()}`);
  }
}


