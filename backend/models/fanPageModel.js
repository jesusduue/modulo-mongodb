const mongoose = require('mongoose');

const fanPageSchema = new mongoose.Schema(
  {
    nom_fan_pag: {
      type: String,
      required: [true, 'Por favor, introduce el nombre de la página.'],
    },
    des_fan_pag: {
      type: String,
      required: [true, 'Por favor, introduce la descripción.'],
    },
    per_fan_pag: {
      type: String,
      required: false,
    },
    fec_fan_pag: {
      type: Date,
      default: Date.now,
    },
    est_fan_pag: {
      type: String,
      required: true,
      default: 'A',
    },
    categoria: {
      type: Array,
      required: false,
    },
    publicacion: {
      type: Array,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// --- EXPLICACIÓN DE LA CORRECCIÓN CLAVE ---
// El tercer argumento en mongoose.model() es el nombre EXACTO de la colección
// en tu base de datos de MongoDB.
//
// Mongoose por defecto intenta adivinar el nombre. Si tu modelo se llama 'FanPage',
// Mongoose buscará una colección llamada 'fanpages' (plural y minúsculas).
//
// Es muy probable que tu colección se llame 'fan_page' (tal como tu archivo .json).
// Al especificar 'fan_page' aquí, le decimos a Mongoose que no adivine y que use
// ese nombre exacto, solucionando el problema de no encontrar los datos.
const FanPage = mongoose.model('FanPage', fanPageSchema, 'fan_page');

module.exports = FanPage;

