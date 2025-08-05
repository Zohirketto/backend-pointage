const path = require('path');

const passageRepository = require(path.join(__dirname, '../repositories/passageRepository'));

const functions = require(path.join(__dirname, '../service/functions'))
const GLOBAL = require(path.join(__dirname,'../service/Global'))
exports.createPassage = async (req, res) => {
    
    try {
        let payload = {
            carType:req.body.carType,
            persons:req.body.persons,
            quantite: req.body.quantite
        };
        // HISTORIQUE
        

        let passage = await passageRepository.createPassage({
            ...payload //décomposition
        });
        let request = {
            
            body: {isCalled: true},
         }
        res.status(200).json({
            status: true,
            data: passage,
        });
    // ERREUR
    } catch (err) {
        
        console.log(err)
        res.status(500).json({
            error: err,
            status: false,
        });
    };
};


exports.getPassages = async (req, res) => {
    try {
        let passages = null
        passages = await passageRepository.list();
        res.status(200).json({
            status: true,
            data: passages,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
            status: false,
        });
    };
};
exports.getPassageById = async (req, res) => {
    try {
        let id = req.params.id
        let passageDetails = await passageRepository.passageById(id);
        res.status(200).json({
            status: true,
            data: passageDetails,
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err
        })
    }
};

exports.getPassageByDateRange = async (req, res) => {
    try{
        res.status(200).json({
            status: true,
           // data: passageDetails,
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err
        })
    }
}


exports.listByUser = async (req, res) => {
    try{
        let tmp = await passageRepository.listByUser(req.params.id)
        res.status(200).json({
            status: true,
            data: tmp,
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err
        })
    }
}


exports.removePassage = async (req, res) => {
      try {
        let id = req.params.id;
        let passage = await passageRepository.removePassage(id);
        res.status(200).json({
            status: true,
            data: passage,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err,
        });
    }
};

exports.updatePassage = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const updatedPassage = await passageRepository.updatePassage(id, payload);
        res.status(200).json({
            status: true,
            data: updatedPassage,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
            status: false,
        });
    }
};

exports.countPax = async (req, res) => {
    try {
        const count = await passageRepository.countAllPassages(); // Using the new function
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting all passages:', error);
        res.status(500).json({ message: 'Error counting all passages', error: error.message });
    }
};

// GET /api/passages/count/with-vehicle
// Count passages with a vehicle
exports.countVehicle = async (req, res) => {
    try {
        const count = await passageRepository.countPassagesWithVehicle(); // Using the new function
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting passages with vehicle:', error);
        res.status(500).json({ message: 'Error counting passages with vehicle', error: error.message });
    }
}
exports.countPaxWithoutVehicle = async (req, res) => {
    try {
        const count = await passageRepository.countPassagesWithoutVehicle();
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting passages without vehicle:', error);
        res.status(500).json({ message: 'Error counting passages without vehicle', error: error.message });
    }
};

// GET /api/passages/count/without-vehicle
// Count passages without a vehicle
exports.countPerDayAndHour = async (req, res) => {
    try {
        const { startDate, endDate, startTime, endTime, carType } = req.query;

        // Pass all the filters from req.query directly to the repository function
        const counts = await passageRepository.countPerDayAndHour({
            startDate,
            endDate,
            startTime,
            endTime,
            carType
        });
        
        res.status(200).json(counts);
    } catch (error) {
        console.error('Error counting passages per day and hour:', error);
        // Ensure you always send a response in the catch block
        res.status(500).json({ message: 'Error fetching daily and hourly counts', error: error.message });
    }
};
exports.countCars = async (req, res) => {
    try {
        // Extract filters from the request query parameters
        const filters = req.query; // e.g., { carType: "membre" }

        // Call the repository function with the extracted filters
        const data = await passageRepository.countCars(filters);

        // Send the result back to the client
        res.status(200).json(data);
    } catch (error) {
        // Handle any errors that occurred in the repository or during the request processing
        console.error("Error in passageController.countCars:", error);
        res.status(500).json({ message: "Failed to retrieve car counts", error: error.message });
    }

}
