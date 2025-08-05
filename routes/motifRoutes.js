const router = require("express").Router();
const path = require('path');
const motifController = require(path.join(__dirname, "../controllers/motifController"));
const authController = require(path.join(__dirname, "../controllers/authController"))



router.post("/create",authController.securedAdmin,motifController.createMotif);
router.get("/getAll",authController.securedPointer,motifController.getMotifs);
router.get("/list", authController.securedAdmin, motifController.listMotifsById);
router.get("/get/:id", authController.securedAdmin, motifController.getMotifById);
router.delete("/delete/:id",authController.securedAdmin, motifController.removeMotif);
router.put("/put/:id",authController.securedAdmin, motifController.updateMotif);


module.exports = router;