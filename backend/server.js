const express = require('express');
const mongoose = require('mongoose'); // para conectar a mongodb
const bodyParser = require('body-parser'); // hace la conversion de los archivos binarios a formato json
const cors = require('cors');
const morgan = require('morgan'); // para ver las peticiones que se hacen al servidor
const fanPageRoutes = require('./routes/fanPageRoutes');

const app = express();
const port = 3000;

// middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev')); // para ver las peticiones HTTP en consola

// rutas
app.use('/api/fanpages', fanPageRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Fan Pages funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/perfil_empresarial', {
    serverSelectionTimeoutMS: 5000, // tiempo de espera para la conexion
    socketTimeoutMS: 45000 // tiempo de espera para la respuesta
}).then(() => {
    console.log('Conexión a la base de datos exitosa');
    app.listen(port, () => {
        console.log(`Servidor escuchando en http://127.0.0.1:${port}`);
    });
}).catch((error) => {
    console.error('Error de conexión a la base de datos:', error);
});