export class Property {
  constructor({ propertyID, title, address, description, aiTags, status = 'PENDING', location = null, propertiesImage = null }) {
    this.propertyID = propertyID;
    this.title = title;
    this.address = address;
    this.description = description;
    this.aiTags = aiTags || [];
    this.status = status;
    this.location = location;
    this.propertiesImage = propertiesImage;
    this.units = [];
    this.reviews = [];
  }


  // Domain Rule: Must have at least one unit and AI tags to be published (Diagram 4.0.29)
  publish() {
    if (this.units.length === 0) {
      throw new Error('Cannot publish a property without units');
    }
    if (!this.aiTags || this.aiTags.length === 0) {
      throw new Error('Property must have AI tags before publishing');
    }
    this.status = 'PUBLISHED';
  }

  addUnit(unitData) {
    this.units.push(unitData);
  }

  // Sequence Diagram 4.0.13: Update property overall rating
  calculateAverageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating_value, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  getPropertyDetails() {
    return {
      propertyID: this.propertyID,
      title: this.title,
      address: this.address,
      description: this.description,
      aiTags: this.aiTags,
      status: this.status,
      propertiesImage: this.propertiesImage,
      units: this.units,
      averageRating: this.calculateAverageRating(),
      reviews: this.reviews
    };
  }
}

