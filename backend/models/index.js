const User = require('./User');
const Xassida = require('./Xassida');
const Favori = require('./Favori');

// Associations User ↔ Xassida (Favoris)
User.belongsToMany(Xassida, { through: Favori, as: 'favoris', foreignKey: 'user_id' });
Xassida.belongsToMany(User, { through: Favori, as: 'fans', foreignKey: 'xassida_id' });

module.exports = { User, Xassida, Favori };
