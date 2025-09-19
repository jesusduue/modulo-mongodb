// Importamos mongoose para conectarnos a la base de datos
const mongoose = require('mongoose');

// Definimos una función asíncrona para conectar a la base de datos
const connectDB = async () => {
  try {
    // Intentamos conectarnos a la base de datos con la URI de conexión
    // process.env.MONGO_URI hace referencia a una variable de entorno para no exponer datos sensibles.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Si la conexión es exitosa, lo mostramos en la consola.
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    // Si hay un error, lo mostramos en la consola y terminamos el proceso del servidor.
    console.error(`Error: ${error.message}`);
    process.exit(1); // El 1 indica que la salida fue por un error.
  }
};

// Exportamos la función para poder usarla en otros archivos
module.exports = connectDB;
