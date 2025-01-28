const express = require("express");
const app = express();
app.use(express.json());

const masterRoute = require("./routes/master.routes")
app.use(masterRoute)


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
