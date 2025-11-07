require('dotenv').config();
const sequelize = require('./config/db');
const Xassida = require('./models/Xassida');

(async () => {
  try {
    // Synchroniser la base
    await sequelize.sync();

    // Vérifier si un Xassida avec le même titre existe déjà
    const xassidaExist = await Xassida.findOne({ where: { titre: process.env.XASSIDA_TITRE } });
    if (xassidaExist) {
      console.log('✅ Ce Xassida existe déjà');
      process.exit(0);
    }

    // Créer le Xassida
    const xassida = await Xassida.create({
      titre: process.env.XASSIDA_TITRE || 'Titre par défaut',
      description: process.env.XASSIDA_DESCRIPTION || 'Description par défaut',
      audioUrl: process.env.XASSIDA_AUDIO || null,
      videoUrl: process.env.XASSIDA_VIDEO || null,
      pdfUrl: process.env.XASSIDA_PDF || 'pdf/default.pdf',
      statut: process.env.XASSIDA_STATUT || 'actif',
      nombre_telechargements: 0,
    });

    console.log('✅ Xassida créé avec succès :', xassida.titre);
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur lors de la création du Xassida :', err);
    process.exit(1);
  }
})();