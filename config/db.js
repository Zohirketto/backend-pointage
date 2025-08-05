const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');



const uri = "mongodb://127.0.0.1:27017/digigolf";
module.exports = (app, session) => {
    //"mongodb+srv://milscorndog:modepasse@cluster0.1n8iw.mongodb.net/milscorndog?retryWrites=true&w=majority"
    //"mongodb://localhost:27017/milscorndog"
    mongoose.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
    }).then(res => console.log("connected")).catch(err => console.log(err))
    mongoose.Promise = global.Promise;
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("SIGHUP", cleanup);
    if (app) {
        app.set("mongoose", mongoose);
    }

    const db = mongoose.connection;
    autoIncrement.initialize(db);

};

function cleanup() {
    mongoose.connection.close(function () {
        process.exit(0);
    });
}