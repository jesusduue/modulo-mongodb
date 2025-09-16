
const fan_page = require('../models/fanPageModel');

// Obtener todas las fan pages
exports.getAllFanPages = async (req, res) => {
    try {
        const fanPages = await fan_page.find();
        res.json(fanPages);
        console.log('Fan pages obtenidas:', fanPages);
    } catch (error) {
        console.error('Error al obtener las fan pages:', error);
        res.status(500).json({ error: 'Error al obtener las fan pages' });
    }
};

// Obtener una fan page por id
exports.getFanPageById = async (req, res) => {
    try {
        console.log('ID recibido:', req.params.id);
        const fanPage = await fan_page.findOne({ _id: req.params.id });
        console.log('Fan page encontrada:', fanPage);
        if (fanPage == null) {
            return res.status(404).json({ error: 'Fan page no encontrada' });
        }
        res.json(fanPage);
    } catch (error) {
        console.error('Error al obtener la fan page:', error);
        res.status(500).json({ error: 'Error al obtener la fan page' });
    }
};

// Crear una nueva fan page
exports.createFanPage = async (req, res) => {
    const fanPage = new fan_page({
        nom_fan_pag: req.body.nom_fan_pag,
        des_fan_pag: req.body.des_fan_pag,
        per_fan_pag: req.body.per_fan_pag,
        fec_fan_pag: req.body.fec_fan_pag,
        est_fan_pag: req.body.est_fan_pag,
        categoria: req.body.categoria || [],
        publicacion: req.body.publicacion || []
    });
    try {
        const newFanPage = await fanPage.save();
        res.status(201).json(newFanPage);
    } catch (error) {
        console.error('Error al crear la fan page:', error);
        res.status(500).json({ error: 'Error al crear la fan page' });
    }
};

// Actualizar una fan page
exports.updateFanPage = async (req, res) => {
    try {
        const fanPage = await fan_page.findById(req.params.id);
        if (fanPage == null) {
            return res.status(404).json({ message: 'Fan page no encontrada' });
        }
        
        if (req.body.nom_fan_pag != null) {
            fanPage.nom_fan_pag = req.body.nom_fan_pag;
        }
        if (req.body.des_fan_pag != null) {
            fanPage.des_fan_pag = req.body.des_fan_pag;
        }
        if (req.body.per_fan_pag != null) {
            fanPage.per_fan_pag = req.body.per_fan_pag;
        }
        if (req.body.fec_fan_pag != null) {
            fanPage.fec_fan_pag = req.body.fec_fan_pag;
        }
        if (req.body.est_fan_pag != null) {
            fanPage.est_fan_pag = req.body.est_fan_pag;
        }
        if (req.body.categoria != null) {
            fanPage.categoria = req.body.categoria;
        }
        if (req.body.publicacion != null) {
            fanPage.publicacion = req.body.publicacion;
        }
        
        const updatedFanPage = await fan_page.save();
        res.json(updatedFanPage);
    } catch (error) {
        console.error('Error al actualizar la fan page:', error);
        res.status(500).json({ error: 'Error al actualizar la fan page' });
    }
};

// Eliminar una fan page
exports.deleteFanPage = async (req, res) => {
    try {
        const deletedFanPage = await fan_page.findByIdAndDelete(req.params.id);
        if (!deletedFanPage) {
            return res.status(404).json({ error: 'Fan page no encontrada' });
        }
        res.json({ message: 'Fan page eliminada con éxito' });
    } catch (error) {
        console.error('Error al eliminar la fan page:', error);
        res.status(500).json({ error: 'Error al eliminar la fan page' });
    }
};

// Controladores adicionales para las relaciones

// Agregar una categoría a una fan page
exports.addCategoryToFanPage = async (req, res) => {
    try {
        const fanPage = await fan_page.findById(req.params.id);
        if (fanPage == null) {
            return res.status(404).json({ error: 'Fan page no encontrada' });
        }
        
        fanPage.categoria.push(req.body);
        const updatedFanPage = await fanPage.save();
        res.json(updatedFanPage);
    } catch (error) {
        console.error('Error al agregar categoría:', error);
        res.status(500).json({ error: 'Error al agregar categoría' });
    }
};

// Agregar una publicación a una fan page
exports.addPublicationToFanPage = async (req, res) => {
    try {
        const fanPage = await fan_page.findById(req.params.id);
        if (fanPage == null) {
            return res.status(404).json({ error: 'Fan page no encontrada' });
        }
        
        fanPage.publicacion.push(req.body);
        const updatedFanPage = await fan_page.save();
        res.json(updatedFanPage);
    } catch (error) {
        console.error('Error al agregar publicación:', error);
        res.status(500).json({ error: 'Error al agregar publicación' });
    }
};

// Agregar multimedia a una publicación
exports.addMultimediaToPublication = async (req, res) => {
    try {
        const fanPage = await fan_page.findById(req.params.fanPageId);
        if (fanPage == null) {
            return res.status(404).json({ error: 'Fan page no encontrada' });
        }
        
        const publication = fanPage.publicacion.id(req.params.publicationId);
        if (publication == null) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }
        
        publication.multimedia.push(req.body);
        const updatedFanPage = await fan_page.save();
        res.json(updatedFanPage);
    } catch (error) {
        console.error('Error al agregar multimedia:', error);
        res.status(500).json({ error: 'Error al agregar multimedia' });
    }
};