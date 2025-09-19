const express = require('express');
const dotenv = require('dotenv'); // para manejar la variables de entorno que tiene la conexion a la base de datos
const cors = require('cors');
const morgan = require('morgan'); // para ver las peticiones que se hacen al servidor
const connectDB = require('./config/db')

const fanPageRoutes = require('./routes/fanPageRoutes');


//se carga la variable con la conexion a la base de datos
dotenv.config();

//función para conectar a la base de datos
connectDB();

const app = express();


app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// ruta de la api
app.use('/api/fanpage', fanPageRoutes);

// configuracion del puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`El servidor está corriendo en el puerto http://127.0.0.1:${PORT}`);
});