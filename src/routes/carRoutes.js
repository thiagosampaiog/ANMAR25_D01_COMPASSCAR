var express = require("express");
var router = express.Router();

const Car = require("../models/car");

router.post("/cars", async (req, res) => {
  try {
    const { brand, model, year, plate } = req.body;
    const errors = [];

    // Validações
    if (!brand) errors.push("brand is required");
    if (!model) errors.push("model is required");
    if (!year) {
      errors.push("year is required");
    } else if (year < 2016 || year > 2026) {
      errors.push("year must be between 2016 and 2026");
    }
    if (!plate) {
      errors.push("plate is required");
    } else {
      const plateRegex = /^[A-Z]{3}-\d[A-J0-9]\d{2}$/;
      if (!plateRegex.test(plate)) {
        errors.push("plate must be in the correct format ABC-1D23");
      }
    }

    // Retorna erros de validação
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verifica duplicidade de placa
    const existingCar = await Car.findOne({ where: { plate } });
    if (existingCar) {
      return res.status(409).json({ errors: ["car already registered"] });
    }

    // Cria o carro
    const newCar = await Car.create({ brand, model, year, plate });
    return res.status(201).json(newCar);
  } catch (error) {
    console.error("Erro no endpoint POST /api/v1/cars:", error);
    return res.status(500).json({ errors: ["an internal server error occurred"] });
  }
});


router.get("/test", (req, res) => {
  res.send("Rota de teste funcionando!");
});

console.log("Arquivo carRoutes.js carregado!");
module.exports = router;
