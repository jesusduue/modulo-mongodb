const express = require('express');
const router = express.Router();

// Importamos todas las funciones del controlador
const {
  getAllFanPages,
  createFanPage,
  getFanPageById,
  updateFanPage,
  deleteFanPage,
} = require('../controller/fanPageController');


router.route('/').get(getAllFanPages);
router.route('/').post(createFanPage);

// Usamos .route('/:id') para agrupar las operaciones GET, PUT y DELETE para un mismo ID.
router
  .route('/:id')
  .get(getFanPageById)
  .put(updateFanPage)
  .delete(deleteFanPage);

module.exports = router;
