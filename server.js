require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path')
const db = require("./config/db")

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({
    extended: true
}))

app.use(require("./routes/app.routes"));



app.listen(process.env.PORT, async () => {
    await db.connectDb()
    console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`);

});

