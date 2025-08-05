const path = require('path')

const motifRoutes = require(path.join(__dirname, "../routes/motifRoutes"))
const passageRoutes = require(path.join(__dirname, "../routes/passageRoutes"))
const auth = require(path.join(__dirname, "../routes/auth"))


module.exports = (app) => {
    app.use("/api/auth", auth)
    app.use("/api/motif", motifRoutes)
    app.use("/api/passage", passageRoutes)
}