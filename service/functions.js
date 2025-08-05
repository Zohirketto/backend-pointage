exports.matchFields = async (req, payload, array) => {
    try{
        //let payload = {}
        for(var field in req.body) {
            if(array.includes(field))
                payload[field] = req.body[field]
        }
    } catch(err) {
        res.status(500).json({
            status: false,
            error: err
        })
    }
}

exports.listBy = async (db, recherche, regex, populate = true) => {
    let queryParam = {};
    queryParam[recherche] = regex;
    if(populate)
        return await db.find(queryParam).populate(recherche)
    else
        return await db.find(queryParam)
}




