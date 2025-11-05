const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');

router.post('/auth/inscription', upload.single('photoProfil'), utilisateurController.inscriptionUser);
router.post('/auth/login', utilisateurController.login);
router.put('/modifier/:id', utilisateurController.modifierProfil);
router.put('/modifier-password/:id', utilisateurController.modifierPassword);
router.get('/xassidas/liste_Xassida', auth, utilisateurController.listeXassida);
router.get('/xassidas/liste_Xassida_Favorie', auth, utilisateurController.listeXassidaFavoris);
router.get('/xassidas/telecharger/:xassidaId', auth, utilisateurController.telechargerXassida);
router.post('/xassidas/mettre_favorie_xassida/:xassidaId', auth, utilisateurController.ajouterFavori);
router.post('/xassidas/supprimer_favorie_xassida/:xassidaId', auth, utilisateurController.ajouterFavori);

module.exports = router;
