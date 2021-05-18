const express = require("express");
const mongoose = require("mongoose");
const formidable = require("express-formidable");
const cors = require("cors");
const app = express();
const cloudinary = require("cloudinary").v2;
app.use(formidable());
app.use(cors());

// Permet l'accès aux variables d'environnement
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

// Connexion à l'espace de stockage cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_PUBLIC_KEY,
	api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
app.use(userRoutes);
app.use(offerRoutes);

app.get("/", (req, res) => {
	res.json("Welcome to Vinted API");
});

const server = app.listen(process.env.PORT, () => {
	console.log("Server started");
});
