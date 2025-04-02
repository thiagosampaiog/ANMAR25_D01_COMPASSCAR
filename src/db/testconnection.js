const conn = require("./conn");

(async () => {
  try {
    await conn.authenticate();
    console.log("Conexão com o banco de dados bem-sucedida!");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
})();
