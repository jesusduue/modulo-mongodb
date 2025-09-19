const FanPage = require('../models/fanPageModel');

// @desc    Obtener todas las páginas de fans
// @route   GET /api/fanpage
// @access  Public
const getAllFanPages = async (req, res) => {
  try {
    const fanPages = await FanPage.find({});
    res.status(200).json(fanPages);
  } catch (error) {
    console.error('Error al obtener las páginas:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener las páginas.' });
  }
};

// @desc    Crear una nueva página de fan
// @route   POST /api/fanpage
// @access  Public
const createFanPage = async (req, res) => {
  try {
    // Se desestructuran los campos del body con los nombres correctos del Schema
    const { nom_fan_pag, des_fan_pag, per_fan_pag, est_fan_pag } = req.body;

    // Validación básica para campos obligatorios
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

// @desc    Obtener una página de fan por su ID
// @route   GET /api/fanpage/:id
// @access  Public
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

// @desc    Actualizar una página de fan
// @route   PUT /api/fanpage/:id
// @access  Public
const updateFanPage = async (req, res) => {
  try {
    const { nom_fan_pag, des_fan_pag, per_fan_pag, est_fan_pag } = req.body;
    const fanPage = await FanPage.findById(req.params.id);

    if (fanPage) {
      // Se actualizan los campos del documento encontrado
      fanPage.nom_fan_pag = nom_fan_pag || fanPage.nom_fan_pag;
      fanPage.des_fan_pag = des_fan_pag || fanPage.des_fan_pag;
      fanPage.per_fan_pag = per_fan_pag || fanPage.per_fan_pag;
      fanPage.est_fan_pag = est_fan_pag || fanPage.est_fan_pag;

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

// @desc    Eliminar una página de fan
// @route   DELETE /api/fanpage/:id
// @access  Public
const deleteFanPage = async (req, res) => {
  try {
    const fanPage = await FanPage.findById(req.params.id);

    if (fanPage) {
      // El método correcto es `deleteOne()` sobre la instancia del documento
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

