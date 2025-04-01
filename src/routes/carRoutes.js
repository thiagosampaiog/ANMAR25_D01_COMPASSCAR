var express = require("express");
var router = express.Router();

const { Car, CarItem } = require('../models/index')

router.post("/cars", async (req, res) => {
  try {
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

    // Validações
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

    // Cria o carro
    const newCar = await Car.create({ brand, model, year, plate });
    return res.status(201).json(newCar);
  } catch (error) {
    console.error("Erro no endpoint POST /api/v1/cars:", error);
    return res
      .status(500)
      .json({ errors: ["an internal server error occurred"] });
  }
});

router.put("/cars/:id/items", async (req, res) => {
  const carId = req.params.id; // pega o id do cars gerado
  const { items } = req.body; // cria um objeto com os items do body

  if(!items || !Array.isArray(items)){
    return res
    .status(400)
    .json({ errors: ["items is required"]})
  }
  if(items.length > 5) {
    return res
    .status(400)
    .json({ errors: ["items must be a maximum of 5"]})
  }


    const seen = new Set();

    for(const item of items){
      if(seen.has(item)) {
        return res.status(400).json({ errors: ["items cannot be repeated"]})
      }
      seen.add(item);
    }

    const existingCar = await Car.findByPk(carId);
    if(!existingCar){
      return res.status(404).json({ errors: ["car not found"] });
    }

    await CarItem.destroy({ where: { car_id: carId }});

    const newItems = items.map((item) => ({ // utilizado para transformar array de itens em um novo array de objetos
      name: item,
      car_id: carId,
    }))

    const createdItems = await CarItem.bulkCreate(newItems);

    return res.status(200).json({ 
      message: 'Items updated successfully',
      items: createdItems,
    });



});






console.log("Arquivo carRoutes.js carregado!");
module.exports = router;
