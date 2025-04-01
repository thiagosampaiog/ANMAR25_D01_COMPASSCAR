var express = require("express");
var router = express.Router();

const { Car, CarItem } = require('../models/index')

router.post("/cars", async (req, res) => {
    const { brand, model, year, plate } = req.body;
    const errors = [];

    function isValidPlate(plate) {
      // Verifica se o comprimento é exatamente 8 caracteres
      if (plate.length !== 8) {
        return false;
      }
      // Verifica se os 3 primeiros caracteres são letras maiúsculas
      for (let i = 0; i < 3; i++) {
        if (plate[i] < "A" || plate[i] > "Z") {
          return false;
        }
      }
      // Verifica se o quarto caractere é um hífen
      if (plate[3] !== "-") {
        return false;
      }
      // Verifica se o quinto caractere é um número
      if (isNaN(plate[4])) {
        return false;
      }
      // Verifica se o sexto caractere é uma letra maiúscula ou um número
      if (
        (plate[5] < "A" || plate[5] > "Z") && 
        (plate[5] < "0" || plate[5] > "9")    
      ) {
        return false;
      }
      // Verifica se os dois últimos caracteres são números array 6 e 7
      for (let i = 6; i < 8; i++) {
        if (plate[i] < "0" || plate[i] > "9") {
          return false;
        }
      }
      // se tudo passar a placa é válida
      return true;
    }

    if (!brand) errors.push("brand is required");
    if (!model) errors.push("model is required");
    if (!year) {
      errors.push("year is required");
    } else if (year < 2015 || year > 2025) {
      errors.push("year must be between 2015 and 2025");
    }
    if (!plate) {
      errors.push("plate is required");
    } else if (!isValidPlate(plate)) {
      errors.push("plate must be in the correct format ABC-1C34");
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

    const newCar = await Car.create({ brand, model, year, plate });
    return res.status(201).json(newCar);
});

router.put("/cars/:id/items", async (req, res) => {
  const carId = req.params.id; 
  const items = req.body;
  const errors = [];

  if(!items || !Array.isArray(items)){
    errors.push("items is required")
  }
  if(items && items.length > 5) {
    errors.push("items must be a maximum of 5")
  }

    const seen = new Set();

    for(const item of items){
      if(seen.has(item)) {
        errors.push("items cannot be repeated");
        break;
      }
      seen.add(item);
    }

    const existingCar = await Car.findByPk(carId);
    if(!existingCar){
      return res.status(404).json({ errors: ["car not found"] });
    }

    await CarItem.destroy({ where: { car_id: carId }});

    const newItems = items.map((item) => ({ 
      name: item,
      car_id: carId,
    }))

    await CarItem.bulkCreate(newItems);

    return res.status(204).send();

});

router.get('/cars/:id', async (req, res) => {
  const carId = req.params.id; 
  const errors = [];

  const car = await Car.findByPk(carId, { // pega os dados do banco
    include: {
      model: CarItem, // gera array car.CarItems do objeto retornado
      attributes: ["name"],
    },
  }); 

  if(!car){ 
    errors.push('car not found');
    return res.status(404).json({ errors: errors });
  }

  const items = car.CarItems.map((item) => item.name);
  // transforma array de objetos em array com os nomes

  return res.status(200).json({
    id: car.id,
    brand:car.brand,
    model: car.model,
    year: car.year,
    plate: car.plate,
    created_at: car.createdAt,
    items: items,
  });



})




console.log("Arquivo carRoutes.js carregado!");
module.exports = router;
