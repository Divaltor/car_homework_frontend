export default class Discount {
  private readonly rentDays: number;
  constructor(rentDays: number) {
    this.rentDays = rentDays;
  }

  getDiscount(): number {
    if (this.rentDays > 10) {
      return 10;
    } else if (this.rentDays > 5) {
      return 7;
    } else if (this.rentDays > 3) {
      return 5;
    }

    return 0;
  }
}
