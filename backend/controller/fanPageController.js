const FanPage = require('../models/fanPageModel');

//  Obtener todas las páginas de fans
const getAllFanPages = async (req, res) => {
  try {
    const fanPages = await FanPage.find({});
    res.status(200).json(fanPages);
  } catch (error) {
    console.error('Error al obtener las páginas:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener las páginas.' });
  }
};

//Crear una nueva página de fan

const createFanPage = async (req, res) => {
  try {
    const { nom_fan_pag, des_fan_pag, per_fan_pag, est_fan_pag } = req.body;

    // Validación  para campos obligatorios
    if (!nom_fan_pag || !des_fan_pag) {
      return res
        .status(400)
        .json({ message: 'Los campos nom_fan_pag y des_fan_pag son obligatorios.' });
    }

    // Se crea la nueva instancia del modelo
    const newFanPage = new FanPage({
      nom_fan_pag,
      des_fan_pag,
      per_fan_pag,
      est_fan_pag,
    });

    // Se guarda en la base de datos
    const createdFanPage = await newFanPage.save();
    res.status(201).json(createdFanPage);
  } catch (error) {
    console.error('Error al crear la página:', error);
    res.status(500).json({ message: 'Error en el servidor al crear la página.' });
  }
};

//Obtener una página de fan por su ID
const getFanPageById = async (req, res) => {
  try {
    const fanPage = await FanPage.findById(req.params.id);

    if (fanPage) {
      res.status(200).json(fanPage);
    } else {
      // Si el ID es válido pero no se encuentra, devuelve 404
      res.status(404).json({ message: 'Página no encontrada.' });
    }
  } catch (error) {
    console.error('Error al obtener la página por ID:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener la página.' });
  }
};

//Actualizar una página de fan
const updateFanPage = async (req, res) => {
  try {
    const {
      nom_fan_pag,
      des_fan_pag,
      per_fan_pag,
      est_fan_pag,
      fec_fan_pag,
      categoria,
      publicacion
    } = req.body;

    const fanPage = await FanPage.findById(req.params.id);

    if (fanPage) {
      // Se actualizan los campos del documento
      fanPage.nom_fan_pag = nom_fan_pag || fanPage.nom_fan_pag;
      fanPage.des_fan_pag = des_fan_pag || fanPage.des_fan_pag;
      fanPage.per_fan_pag = per_fan_pag || fanPage.per_fan_pag;
      fanPage.est_fan_pag = est_fan_pag || fanPage.est_fan_pag;

      if (typeof fec_fan_pag !== 'undefined') {
        fanPage.fec_fan_pag = fec_fan_pag ? new Date(fec_fan_pag) : fanPage.fec_fan_pag;
      }

      // Si llegan arrays (aunque sean vacíos), se asignan
      if (typeof categoria !== 'undefined') {
        fanPage.categoria = Array.isArray(categoria) ? categoria : fanPage.categoria;
      }
      if (typeof publicacion !== 'undefined') {
        fanPage.publicacion = Array.isArray(publicacion) ? publicacion : fanPage.publicacion;
      }

      const updatedFanPage = await fanPage.save();
      res.status(200).json(updatedFanPage);
    } else {
      res.status(404).json({ message: 'Página no encontrada.' });
    }
  } catch (error) {
    console.error('Error al actualizar la página:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar la página.' });
  }
};

//Eliminar una página de fan
const deleteFanPage = async (req, res) => {
  try {
    const fanPage = await FanPage.findById(req.params.id);

    if (fanPage) {
      await fanPage.deleteOne();
      res.status(200).json({ message: 'Página eliminada correctamente.' });
    } else {
      res.status(404).json({ message: 'Página no encontrada.' });
    }
  } catch (error) {
    console.error('Error al eliminar la página:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar la página.' });
  }
};

module.exports = {
  getAllFanPages,
  createFanPage,
  getFanPageById,
  updateFanPage,
  deleteFanPage,
};

