export class Unit {
  constructor({ unitID, price, type, availabilityStatus }) {
    this.unitID = unitID;
    this.price = price;
    this.type = type;
    this.availabilityStatus = availabilityStatus;
  }

  updateAvailability(newStatus) {
    this.availabilityStatus = newStatus;
  }
}
