export class Review {
  constructor({ reviewID, ratingValue, comment, date }) {
    this.reviewID = reviewID;
    this.ratingValue = ratingValue;
    this.comment = comment;
    this.date = date || new Date();
    
    this.validate();
  }

  validate() {
    // Sequence Diagram 4.0.13: Invalid Rating Score (Failure Case)
    if (this.ratingValue < 1 || this.ratingValue > 5) {
      throw new Error('Invalid rating score: Must be between 1 and 5 stars');
    }
    if (!this.comment || this.comment.trim().length === 0) {
      throw new Error('Review must include a comment');
    }
  }

  getReviewSummary() {
    return {
      reviewID: this.reviewID,
      rating: this.ratingValue,
      comment: this.comment,
      date: this.date
    };
  }
}

