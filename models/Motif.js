// models/Motif.js
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');



const motifSchema = mongoose.Schema({
  libelle: {
    type: String,
    required: [true, "Libellé requis"]
  },
  description: {
    type: String,
    default: ""
  },
  couleur: { type: String, default: "white" },
  ordreAffichage: { type: Number, default: 0 },
  icon: { type: String, default: "BlockIcon" },
});

motifSchema.plugin(autoIncrement.plugin, { model: 'Motif', startAt: 1 });

module.exports = mongoose.model("Motif", motifSchema);
