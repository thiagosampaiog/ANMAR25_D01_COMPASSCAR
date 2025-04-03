var express = require("express");
var router = express.Router();

const { Op } = require("sequelize");
const { Car, CarItem } = require("../models/index");

function isValidPlate(plate) {
  if (plate.length !== 8) {
    return false;
  }
  for (let i = 0; i < 3; i++) {
    if (plate[i] < "A" || plate[i] > "Z") {
      return false;
    }
  }
  if (plate[3] !== "-") {
    return false;
  }
  if (isNaN(plate[4])) {
    return false;
  }
  if (
    (plate[5] < "A" || plate[5] > "J") &&
    (plate[5] < "0" || plate[5] > "9")
  ) {
    return false;
  }
  for (let i = 5; i < 7; i++) {
    if (plate[i] < "0" || plate[i] > "9") {
      return false;
    }
  }
  return true;
}

router.post("/cars", async (req, res) => {
  try {
    const { brand, model, year, plate } = req.body;
    const errors = [];

    const maxYear = new Date().getFullYear() + 1;
    const minYear = maxYear - 10;

    if (!brand) {
      errors.push("brand is required");
    }
    if (!model) {
      errors.push("model is required");
    }
    if (!year) {
      errors.push("year is required");
    } else if (year < minYear || year > maxYear) {
      errors.push(`year must be between ${minYear} and ${maxYear}`);
    }
    if (!plate) {
      errors.push("plate is required");
    } else if (!isValidPlate(plate)) {
      errors.push("plate must be in the correct format ABC-1C34");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existingCar = await Car.findOne({ where: { plate } });
    if (existingCar) {
      return res.status(409).json({ errors: ["car already registered"] });
    }

    const newCar = await Car.create({ brand, model, year, plate });
    return res.status(201).json(newCar);
  } catch (error) {
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

router.put("/cars/:id/items", async (req, res) => {
  try {
    const carId = req.params.id;
    const items = req.body;
    const errors = [];

    if (!items || !Array.isArray(items)) {
      errors.push("items is required");
    }
    if (items && items.length > 5) {
      errors.push("items must be a maximum of 5");
    }

    const seen = new Set();

    for (const item of items) {
      if (seen.has(item)) {
        errors.push("items cannot be repeated");
        break;
      }
      seen.add(item);
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existingCar = await Car.findByPk(carId);
    if (!existingCar) {
      return res.status(404).json({ errors: ["car not found"] });
    }

    await CarItem.destroy({ where: { car_id: carId } });

    const newItems = items.map((item) => ({
      name: item,
      car_id: carId,
    }));

    await CarItem.bulkCreate(newItems);

    return res.status(204).send();
  } catch (error) {
    console.error("Erro interno:", error);
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

router.get("/cars/:id", async (req, res) => {
  try {
    const carId = req.params.id;

    const car = await Car.findByPk(carId, {
 
      include: {
        model: CarItem, 
        attributes: ["name"],
      },
    });

    if (!car) {
      return res.status(404).json({ errors: ['car not found'] });
    }

    const items = car.CarItems.map((item) => item.name);
  

    return res.status(200).json({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      plate: car.plate,
      created_at: car.createdAt,
      items: items,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

router.get("/cars", async (req, res) => {
  try {
    const { year, final_plate, brand, page = 1, limit = 5 } = req.query;

    const filters = {};

    if (year) {
      filters.year = { [Op.gte]: year };
    }

    if (final_plate) {
      filters.plate = { [Op.like]: `%${final_plate}` };
    }

    if (brand) {
      filters.brand = { [Op.like]: `%${brand}%` };
    }

    const pageNumber = Math.max(parseInt(page), 1);
    const pageLimit = Math.min(Math.max(parseInt(limit), 1), 10);
    const offset = (pageNumber - 1) * pageLimit;

    const cars = await Car.findAndCountAll({
      where: filters,
      limit: pageLimit,
      offset: offset,
    });

    const totalPages = Math.ceil(cars.count / pageLimit);

    return res.status(200).json({
      count: cars.count,
      pages: totalPages,
      data: cars.rows,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

router.delete("/cars/:id", async (req, res) => {
  try {
    const carId = req.params.id;

    const deletedCount = await Car.destroy({ where: { id: carId } });

    if (deletedCount === 0) {
      return res.status(404).json({ errors: ['car not found'] });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Erro interno:", error);
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

router.patch("/cars/:id", async (req, res) => {
  try {
    const { brand, model, year, plate } = req.body;
    const carId = req.params.id;
    const errors = [];

    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ errors: ["car not found"] });
    }

    const updates = {};
    if (brand) updates.brand = brand;
    if (model) updates.model = model;
    if (year) updates.year = year;
    if (plate) updates.plate = plate;

    if (brand && !model) {
      errors.push("models must also be informed");
    }

    if (year && (year < 2015 || year > 2025)) {
      errors.push("year must be between 2015 and 2025");
    }

    if (plate && !isValidPlate(plate)) {
      errors.push("plate must be in the correct format ABC-1C34");
    }

    if (plate) {
      const existingCar = await Car.findOne({
        where: { plate, id: { [Op.ne]: carId } },
      });
      if (existingCar) {
        return res.status(409).json({ errors: ["car already registred"] });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await Car.update(updates, { where: { id: carId }});

    return res.status(204).send();
  } catch (error) {
    console.error("Erro interno:", error);
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

console.log("Arquivo carRoutes.js carregado!");
module.exports = router;
