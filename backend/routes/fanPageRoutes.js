const express = require('express');
const router = express.Router();
// ...existing // ...existing code...
const fanPageController = require('../controller/fanpageController.js');
// ...existing code...

router.get('/', fanPageController.getAllFanPages);
router.get('/:_id', fanPageController.getFanPageById);
router.post('/', fanPageController.createFanPage);
router.put('/:_id', fanPageController.updateFanPage);
router.delete('/:_id', fanPageController.deleteFanPage);

// Rutas para relaciones
router.post('/:_id/categorias', fanPageController.addCategoryToFanPage);
router.post('/:_id/publicaciones', fanPageController.addPublicationToFanPage);
router.post('/:_id/publicaciones/:publicationId/multimedia', fanPageController.addMultimediaToPublication);

module.exports = router;