const { DataTypes } = require("sequelize");
const sequelize = require("../db/conn");
const Car = require("./car");

const CarItem = sequelize.define("CarItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Car,
      key: "id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "cars_items",
  timestamps: false,
});

module.exports = CarItem;