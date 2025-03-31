const express = require('express')

const conn = require('./src/db/conn');
const app = express()
const port = 3000;


app.get('/', (req, res) => {
  res.send('Olá Mundo!')
})

app.listen(port, () => {
  console.log(`App de exemplo esta rodando na porta ${port}`)
})


conn.authenticate()
  .then(() => console.log("Conectado ao banco de dados!"))
  .catch(err => console.error("Erro ao conectar:", err));