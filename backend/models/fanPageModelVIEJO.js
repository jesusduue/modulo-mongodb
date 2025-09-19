const mongoose = require('mongoose');

const fan_pageSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
    nom_fan_pag: {type: String, required: true},
    des_fan_pag: {type: String, required: true},
    per_fan_pag: {type: String, required: true},
    fec_fan_pag: {type: Date, required: true},
    est_fan_pag: {type: String, required: true},
    categoria: [{
        _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
        nom_cat: {type: String, required: true},
        des_cat: {type: String, required: true},
        est_cat: {type: String, required: true}
    }],
    publicacion: [{
        _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
        tit_pub: {type: String, required: true},
        des_pub: {type: String, required: true},
        fec_pub: {type: Date, required: true},
        est_pub: {type: String, required: true},
        multimedia: [{
            _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
            tip_mul: {type: String, required: true},
            url_mul: {type: String, required: true}
        }]
    }]
}, {
    collection: 'fan_page'
});

// Omitir el campo __v de la salida json y formatear fechas
fan_pageSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('fan_page', fan_pageSchema);