const path = require('path')
const Motif = require(path.join(__dirname, "../models/Motif"));
exports.motifs = async () => {
    const motifs = await Motif.find();
    return motifs;
};
exports.motifById = async id => {
    const motif = await Motif.findById(id);
    return motif;
}

exports.listById = async idList=> {
    let motifsDetails=[]
    for (const id of idList){
        let motifDetails = await Motif.findById(id);
        if(motifDetails)
            motifsDetails.push( motifDetails )
    }
    return motifsDetails
}
exports.createMotif = async payload => {
    const newMotif = await Motif.create(payload);
    return newMotif;
}
exports.removeMotif = async id => {
    const motif = await Motif.findByIdAndRemove(id);
    return motif;
}

exports.updateMotif = async (id, payload) => {
    const motif = await Motif.findByIdAndUpdate(id, {$set: payload}, {new: true});
    return motif;
}
