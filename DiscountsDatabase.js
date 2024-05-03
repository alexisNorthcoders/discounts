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
        JSON.stringify(this.discounts, null, 2)
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
  async addDiscount(brand, cards=[], apps=[], discount, code="") {
    
    if (this.discounts[brand]) {
      console.log(
        `Brand "${brand}" already exists in the database. Updating discount information.`
      );
    }

    this.discounts[brand] = {
      cards,
      apps,
      discount,
      code
    };

    await this.saveDiscounts();
    return true;
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
  async findBrandWithCard(cardName) {
    const brandsWithCard = [];
    for (const brand in this.discounts) {
      if (this.discounts[brand].cards.includes(cardName)) {
        brandsWithCard.push({
          brand: brand,
          discount: this.discounts[brand].discount,
          code: this.discounts[brand].code,
        });
      }
    }
    return brandsWithCard;
  }
  async findBrandWithApp(appName) {
    const brandsWithApp = [];
    for (const brand in this.discounts) {
      if (this.discounts[brand].apps.includes(appName)) {
        brandsWithApp.push({
          brand: brand,
          discount: this.discounts[brand].discount,
          code: this.discounts[brand].code,
        });
      }
    }
    return brandsWithApp;
  }
}

module.exports = DiscountDatabase;
