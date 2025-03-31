const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("compasscar", "root", "", {
  host: "localhost",
  dialect: "mysql",
});


module.exports = sequelize;