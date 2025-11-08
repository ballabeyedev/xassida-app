const path = require('path');
const fs = require('fs');
const { Xassida } = require('../models');
const sequelize = require('../config/db');

// -------------------- AJOUT XASSIDA --------------------
exports.ajoutXassida = async (req, res) => {
  const { titre, description } = req.body;

  // Vérifie s’il y a un fichier PDF
  const pdfUrl = req.file ? '/uploads/xassida_pdf/' + req.file.filename : null;

  const t = await sequelize.transaction();
  try {
    // Vérifie les champs obligatoires
    if (!titre || !description || !pdfUrl) {
      await t.rollback();
      return res.status(400).json({ message: 'Veuillez renseigner tous les champs requis.' });
    }

    // Vérifie si le titre existe déjà (pour éviter les doublons)
    const exist = await Xassida.findOne({ where: { titre }, transaction: t });
    if (exist) {
      await t.rollback();
      return res.status(400).json({ message: 'Ce Xassida existe déjà.' });
    }

    // Création du Xassida
    const nouveauXassida = await Xassida.create(
      {
        titre,
        description,
        pdfUrl,
        statut: 'actif',
        nombre_telechargements: 0,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      message: '✅ Xassida ajouté avec succès',
      xassida: {
        id: nouveauXassida.id,
        titre: nouveauXassida.titre,
        description: nouveauXassida.description,
        pdfUrl: nouveauXassida.pdfUrl,
        statut: nouveauXassida.statut,
        date_enregistrement: nouveauXassida.date_enregistrement,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error('❌ Erreur lors de l’ajout du Xassida :', err);

    // Supprime le fichier si erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: 'Erreur serveur lors de l’ajout du Xassida',
      erreur: err.message,
    });
  }
};
