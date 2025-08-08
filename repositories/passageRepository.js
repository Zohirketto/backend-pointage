const path = require('path')
const Passage = require(path.join(__dirname, "../models/Passage"));
const functions = require(path.join(__dirname, '../service/functions'));
const express = require('express');
const app = express();
const Motif = require("../models/Motif");

// 🟢 Ajoute ceci :
app.use(express.json());

// ... tes autres middlewares ou routes ici

// Helper function to get start and end of the current day
const getTodayStartAndEnd = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startOfDay, endOfDay };
};


exports.passages = async () => {
    const passages = await Passage.find().populate('motifId')
    .sort({ createdAt: -1})
    return passages;
};
exports.passageById = async (id, populate = true) => {
    if(populate)
      return await Passage.findById(id)
        .populate('motifId')
    return await Passage.findById(id);
}

exports.count = async () => {
  return Passage.countDocuments()
}
exports.listById = async idList=> {
    let passagesDetails=[]
    for (const id of idList){
        let passageDetails = await Passage.findById(id).populate('BLs');
        if(passageDetails)
            passagesDetails.push( passageDetails )
    }
    return passagesDetails
}

exports.list = async (criteria = {}) => {
  if (criteria.client){
    const passages = await Passage.find(criteria).populate('motifId')
    .sort({ createdAt: -1})
    return passages;
  }
  const passages = await Passage.find().populate('motifId')
    .sort({ createdAt: -1})
  return passages;
}

exports.listByUser = async idUser=> {
  return await Passage.find({
    madeBy: idUser
    }).populate('motifId')
    .sort({ createdAt: -1})
}

exports.listBy = async (recherche, regex) => {
  return await functions.listBy(Passage, recherche, regex)
}


exports.createPassage = async (data) => {
  try {
    const { carType, persons, motifId, quantite } = data;
    const passage = await Passage.create({ carType, persons, motifId, quantite });
    return passage;
  } catch (err) {
    // You can throw the error to be caught by the controller
    throw err;
  }
};


exports.removePassage = async (id) => {
    const passage = await Passage.findByIdAndRemove(id);
    return passage;
}

exports.updatePassage = async (id, payload) => {
    const passage = await Passage.findByIdAndUpdate(id, {$set: payload}, {new: true});
    return passage;
}
//count cars
exports.countCars = async (filters) => {
    try {
        const { carType } = filters;

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const matchStage = {
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            carType: { $ne: "" } // <--- ADDED THIS LINE: Exclude documents where carType is an empty string
        };

        // Existing carType filter logic (if it targets specific car types or "Sans Voiture")
        if (carType) {
            if (carType === 'Sans Voiture') {
                
                matchStage.carType = { $exists: false }; 
            } else {
                matchStage.carType = carType;
            }
        } else {
           
        }

        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    hour: { $hour: "$date" },
                    carType: {
                        $ifNull: ["$carType", "Sans Voiture"]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        hour: "$hour",
                        carType: "$carType"
                    },
                    totalCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    hour: "$_id.hour",
                    carType: "$_id.carType",
                    totalCount: 1
                }
            },
            { $sort: { hour: 1, carType: 1 } }
        ];

        const result = await Passage.aggregate(pipeline);
        return result;
    } catch (error) {
        console.error("Error in countCars aggregation:", error);
        throw error;
    }
};

exports.countPerDayAndHour = async (filters) => {
    try {
        const { startDate, endDate, startTime, endTime, carType } = filters; 

        const matchStage = {};
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        const currentDayFormatted = `${year}-${month}-${day}`;

        let effectiveStartDate = startDate;
        let effectiveEndDate = endDate;

        if (!startDate && !endDate) {
            effectiveStartDate = currentDayFormatted;
            effectiveEndDate = currentDayFormatted;
        }

        if (effectiveStartDate && effectiveEndDate) {
            matchStage.date = {
                $gte: new Date(effectiveStartDate),
                $lte: new Date(effectiveEndDate + 'T23:59:59.999Z') 
            };
        } else if (effectiveStartDate) {
            matchStage.date = {
                $gte: new Date(effectiveStartDate),
                $lte: new Date(effectiveStartDate + 'T23:59:59.999Z')
            };
        } else if (effectiveEndDate) {
             matchStage.date = {
                $gte: new Date(effectiveEndDate + 'T00:00:00.000Z'),
                $lte: new Date(effectiveEndDate + 'T23:59:59.999Z')
            };
        }

        if (startTime !== undefined && endTime !== undefined) {
            const startHour = parseInt(startTime);
            const endHour = parseInt(endTime);
            matchStage.$expr = {
                $and: [
                    { $gte: [{ $hour: "$date" }, startHour] },
                    { $lte: [{ $hour: "$date" }, endHour] }
                ]
            };
        } else if (startTime !== undefined) {
            const startHour = parseInt(startTime);
            matchStage.$expr = { $gte: [{ $hour: "$date" }, startHour] };
        } else if (endTime !== undefined) {
            const endHour = parseInt(endTime);
            matchStage.$expr = { $lte: [{ $hour: "$date" }, endHour] };
        }

        if (carType) {
            if (carType === 'Sans Voiture') {
                matchStage.carType = { $exists: false };
            } else {
                matchStage.carType = carType;
            }
        }
        
        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        pipeline.push(
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" },
                        hour: { $hour: "$date" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1
                }
            }
        );

        const result = await Passage.aggregate(pipeline);
        return result;
    } catch (error) {
        throw error; 
    }
};

exports.countAllPassages = async () => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    return Passage.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } });
};

exports.countPassagesWithVehicle = async () => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    return Passage.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        carType: { $exists: true, $ne: "" }
    });
};

exports.countPassagesWithoutVehicle = async () => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    return Passage.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        $or: [
            { carType: { $exists: false } },
            { carType: "" }
        ]
    });
};

exports.countTotalPersons = async () => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    const result = await Passage.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $unwind: "$persons" }, 
        { $count: "totalPersons" }
    ]);
    return result.length > 0 ? result[0].totalPersons : 0;
};

exports.countPersonsByType = async (type) => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    const result = await Passage.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $unwind: "$persons" },
        { $match: { "persons.type": type } },
        { $count: "count" }
    ]);
    return result.length > 0 ? result[0].count : 0;
};

exports.countTotalQuantity = async () => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    const result = await Passage.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$quantite" } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

exports.countQuantityByType = async (type) => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    const result = await Passage.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $unwind: "$persons" },
        { $match: { "persons.type": type } },
        { $group: { _id: null, total: { $sum: "$quantite" } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

exports.countQuantityByDestination = async (libelle) => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    const result = await Passage.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $unwind: "$persons" },
        {
            $lookup: {
                from: "motifs",
                localField: "persons.destination",
                foreignField: "_id",
                as: "motifInfo"
            }
        },
        { $unwind: "$motifInfo" },
        { $match: { "motifInfo.libelle": libelle } },
        {
            $group: {
                _id: "$_id",
                quantite: { $first: "$quantite" } 
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$quantite" }
            }
        }
    ]);

    return result.length > 0 ? result[0].total : 0;
};
exports.countNonMemberPlayersByDestination = async (libelle) => {
    const { startOfDay, endOfDay } = getTodayStartAndEnd();
    const result = await Passage.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $unwind: "$persons" },
        { $match: { "persons.type": "Joueur non membre" } }, 
        {
            $lookup: {
                from: "motifs",
                localField: "persons.destination",
                foreignField: "_id",
                as: "motifInfo"
            }
        },
        { $unwind: "$motifInfo" },
        { $match: { "motifInfo.libelle": libelle } }, 
        { $count: "count" } // Count matching persons
    ]);
    return result.length > 0 ? result[0].count : 0;
};


// This function attempts to replicate your "car counts" based on carType and date - ALREADY FILTERS FOR TODAY
exports.countCarsByTimeOfDay = async (timeOfDay) => {
    const now = new Date();
    let startOfPeriod, endOfPeriod;

    // Get today's start and end to ensure we only count for the current day
    const { startOfDay, endOfDay } = getTodayStartAndEnd();

    if (timeOfDay === 'morning') {
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // Start of day
        endOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // Noon
    } else if (timeOfDay === 'afternoon') {
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 1); // Just after noon
        endOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of day
    } else {
        return 0; // Or throw an error for invalid timeOfDay
    }

    return Passage.countDocuments({
        date: { $gte: startOfPeriod, $lte: endOfPeriod },
        carType: { $exists: true, $ne: "" } // Assuming any carType counts for these specific queries
    });
};



exports.getAllDynamicDashboardData = async () => {
    const data = {};

    // Get today's passages data
    data.totalPassages = await exports.countAllPassages();
    data.passagesWithVehicle = await exports.countPassagesWithVehicle();
    data.passagesWithoutVehicle = await exports.countPassagesWithoutVehicle();

    // Get today's pax counts
    data.paxMembers = await exports.countPersonsByType("Membre");
    data.paxVisiteur = await exports.countPersonsByType("Visiteur");
    data.paxInvite = await exports.countPersonsByType("Invité");
    data.paxCaddies = await exports.countPersonsByType("Caddie");
    data.paxNonMembre = await exports.countPersonsByType("Joueur non membre"); // Total non-member players today

    data.totalPersonsEntered = await exports.countTotalPersons();
    data.totalQuantity = await exports.countTotalQuantity();

    // Get today's car counts
    data.carsMorning = await exports.countCarsByTimeOfDay('morning');
    data.carsAfternoon = await exports.countCarsByTimeOfDay('afternoon');


    const motifs = await Motif.find({}, 'libelle');

    const nameMap = {
        "Marche": "Walking",
        // Add more mappings if needed for display names
    };

    for (const motif of motifs) {
        const libelle = motif.libelle;
        const cleaned = nameMap[libelle] || libelle;
        
        // Add total quantity by destination (already filtered for today)
        const quantityKey = `pax${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
        try {
            const countQuantity = await exports.countQuantityByDestination(libelle);
            data[quantityKey] = countQuantity;
        } catch (err) {
            console.error(`Error getting pax for ${libelle}:`, err);
            data[quantityKey] = 0;
        }

        // Add non-member players by destination
        const paxNonMembreKey = `paxJoueurNonMembre${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
        try {
            const countNonMembre = await exports.countNonMemberPlayersByDestination(libelle);
            data[paxNonMembreKey] = countNonMembre;
        } catch (err) {
            console.error(`Error getting non-member players for ${libelle}:`, err);
            data[paxNonMembreKey] = 0;
        }
    }

    return data;
};