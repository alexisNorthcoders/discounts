const fs = require("fs").promises;

class DiscountDatabase {
  constructor(discountsFilePath) {
    this.discountsFilePath = discountsFilePath;
    this.discounts = this.loadDiscounts();
  }

  async loadDiscounts() {
    try {
      const discountData = await fs.readFile(this.discountsFilePath, "utf8");
      this.discounts = JSON.parse(discountData);
    } catch (error) {
      console.error("Error reading discounts data:", error);
    }
  }

  async saveDiscounts() {
    try {
      await fs.writeFile(
        this.discountsFilePath,
        JSON.stringify( this.users, null, 2)
      );
      console.log("Discounts data saved successfully");
    } catch (error) {
      console.error("Error saving discounts data:", error);
    }
  }

  getDiscounts() {
    return this.discounts;
  }

  async updateDiscountsByBrand(brand, updatedDiscount) {
    if (this.discounts.hasOwnProperty(brand)) {
      this.discounts[brand] = { ...this.discounts[brand], ...updatedDiscount };
      await this.saveDiscounts();
      return true;
    }
    return false;
  }
  async addDiscount(newBrand) {
    const { cards, apps, discount,code } = newBrand;
    
    this.discounts[newBrand] = newBrand
    await this.saveUsers();
    return true
  }
  async getDiscountsByBrand(brand) {
    if (this.discounts.hasOwnProperty(brand)) {
      return this.discounts[brand];
    }
    return null;
  }
  async deleteBrand(brand) {
    if (this.discounts.hasOwnProperty(brand)) {
      delete this.discounts[brand];
      await this.saveDiscounts();
      return true;
    }
    return false;
  }
}

module.exports = DiscountDatabase;
