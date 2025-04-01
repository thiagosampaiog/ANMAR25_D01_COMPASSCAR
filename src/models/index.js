const Car = require("./car");
const CarItem = require("./carItem");

Car.hasMany(CarItem, { foreignKey: "car_id" });
CarItem.belongsTo(Car, { foreignKey: "car_id" });

module.exports = { Car, CarItem };
