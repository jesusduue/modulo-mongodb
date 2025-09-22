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

const FanPage = mongoose.model('FanPage', fanPageSchema, 'fan_page');

module.exports = FanPage;

