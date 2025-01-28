const express = require("express");
const app = express();
app.use(express.json());

const masterRoute = require("./routes/master.routes")
app.use(masterRoute)


module.exports.someHelperFunction = () => {
    console.log("Helper function called!");
}

module.exports.masterLRFNew = () => {
    masterRoute
}

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));


module.exports = { app }