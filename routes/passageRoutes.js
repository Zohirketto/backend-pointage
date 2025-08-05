const router = require("express").Router();
const path = require('path');
const passageController = require(path.join(__dirname, "../controllers/passageController"));
const authController = require(path.join(__dirname, "../controllers/authController"));
const fileHandler = require(path.join(__dirname, '../service/FileHandler'));
const passageRepository = require(path.join(__dirname, '../repositories/passageRepository'));

//CREATION
router.post("/create",authController.securedPointer,passageController.createPassage)

//GET
router.get("/getAll",authController.securedPointer, passageController.getPassages)
router.get("/get/:id",authController.securedPointer, passageController.getPassageById)
router.get("/list/:id", authController.securedPointer, passageController.listByUser)

//RECHERCHE
router.get("/search/date",authController.securedPointer, passageController.getPassageByDateRange)

//SUPPRESSION
router.delete("/delete/:id",authController.securedPointer, passageController.removePassage)

//UPDATE
router.put('/update/:id',authController.securedPointer, passageController.updatePassage);


router.get('/count',authController.securedAdmin,passageController.countPax);

router.get('/countVehicle',authController.securedAdmin,passageController.countVehicle);

router.get('/withoutVehicle',authController.securedAdmin, passageController.countPaxWithoutVehicle);

router.get('/countPerDayAndHour',authController.securedAdmin, passageController.countPerDayAndHour);
router.get('/countCars',authController.securedAdmin,passageController.countCars);

router.get('/dashboard-summary', authController.securedAdmin,async (req, res) => {
    try {
        const dynamicData = await passageRepository.getAllDynamicDashboardData();

        res.json({
            success: true,
            data: dynamicData
        });
    } catch (error) {
        console.error('Error fetching all dynamic dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dynamic dashboard data',
            error: error.message
        });
    }
});


module.exports = router