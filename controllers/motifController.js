const path = require('path');
const motifRepository = require(path.join(__dirname, '../repositories/motifRepository'));
const functions = require(path.join(__dirname, '../service/functions'));

// 🟢 Create Motif
exports.createMotif = async (req, res) => {
    try {
        let payload = {
            libelle: req.body.libelle,
            description: req.body.description || "",
            couleur: req.body.couleur || "white", // Ensure the color field is included
            ordreAffichage: req.body.ordreAffichage || 0, // Ensure the display order is included
            icon: req.body.icon || "BlockIcon" // Default icon if not provided
        };

        let motif = await motifRepository.createMotif(payload);

        res.status(200).json({
            status: true,
            data: motif,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
            status: false,
        });
    }
};

// 🟢 Get all Motifs
exports.getMotifs = async (req, res) => {
    try {
        let motifs = await motifRepository.motifs();
        res.status(200).json({
            status: true,
            data: motifs,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
            status: false,
        });
    }
};

// 🟢 Get Motif by ID
exports.getMotifById = async (req, res) => {
    try {
        let id = req.params.id;
        let motifDetails = await motifRepository.motifById(id);
        res.status(200).json({
            status: true,
            data: motifDetails,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err,
        });
    }
};

// 🟢 Get Motifs by ID list
exports.listMotifsById = async (req, res) => {
    try {
        if (!req.body.idList) {
            return res.status(400).json({
                type: "Invalid",
                msg: "MotifList not found",
            });
        }

        let motifsDetails = await motifRepository.listById(req.body.idList);

        res.status(200).json({
            status: true,
            data: motifsDetails,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err,
        });
    }
};

// 🟢 Remove Motif
exports.removeMotif = async (req, res) => {
    try {
        let id = req.params.id;
        let motifDetails = await motifRepository.removeMotif(id);
        res.status(200).json({
            status: true,
            data: motifDetails,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err,
        });
    }
};

// 🟢 Update Motif
exports.updateMotif = async (req, res) => {
    try {
        let id = req.params.id;
        let payload = {};

        // Match standard fields
        functions.matchFields(req, payload, [
            'libelle',
            'description',
            'couleur',
            'ordreAffichage',
            'icon',
        ]);

        let motifDetails = await motifRepository.updateMotif(id, payload);

        res.status(200).json({
            status: true,
            data: motifDetails,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err,
        });
    }
};
