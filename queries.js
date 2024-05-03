function findBrandWithCard(db,cardName) {
    const brandsWithCard = [];
    for (const brand in db) {
      if (db[brand].cards.includes(cardName)) {
        brandsWithCard.push({
          brand: brand,
          discount: db[brand].discount,
          code:db[brand].code
        });
      }
    }
    return brandsWithCard;
  }
  function findBrandWithApp(db,appName) {
    const brandsWithCard = [];
    for (const brand in db) {
      if (db[brand].apps.includes(appName)) {
        brandsWithCard.push({
          brand: brand,
          discount: db[brand].discount,
          code:db[brand].code
        });
      }
    }
    return brandsWithCard;
  }
function findBrand(db,brand){
    
    return db[brand] || "Not found"
}

module.exports = {findBrandWithApp,findBrand,findBrandWithCard}