const express = require('express')
const conn = require('./src/db/conn');
require('./src/models'); 
const carRoutes = require('./src/routes/carRoutes');

const app = express()
const port = 3000;

app.use(express.json());

console.log("Rotas carregadas!");
app.use("/api/v1", carRoutes);

app.get('/', (req, res) => {
  res.send('Olá Mundo!')
})

app.listen(port, () => {
  console.log(`App de exemplo esta rodando na porta ${port}`)
})

conn.authenticate()
  .then(() => console.log("Conectado ao banco de dados!"))
  .catch(err => console.error("Erro ao conectar:", err));
