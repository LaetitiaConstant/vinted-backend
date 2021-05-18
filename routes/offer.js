// Import package
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

// Import model User, Offer and middleware isAuthenticated
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
	// Publish new offer
	try {
		// Create new offer
		const newOffer = new Offer({
			product_name: req.fields.title,
			product_description: req.fields.description,
			product_price: req.fields.price,
			product_details: [
				{ MARQUE: req.fields.brand },
				{ TAILLE: req.fields.size },
				{ ÉTAT: req.fields.condition },
				{ COULEUR: req.fields.color },
				{ EMPLACEMENT: req.fields.city },
			],
			owner: req.user,
		});

		// Send picture in cloudinary
		const result = await cloudinary.uploader.upload(req.files.picture.path, {
			folder: `/vinted/offers/${newOffer._id}`,
		});

		// add picture in newOffer
		newOffer.product_image = result;

		// Save newOffer
		await newOffer.save();

		res.json({
			_id: newOffer._id,
			product_name: newOffer.product_name,
			product_description: newOffer.product_description,
			product_price: newOffer.product_price,
			product_details: newOffer.product_details,
			owner: {
				account: newOffer.owner.account,
				_id: newOffer.owner._id,
			},
			product_image: newOffer.product_image,
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/offers", async (req, res) => {
	// Get all offers
	try {
		// creation of an object in which we will sotcker our different filters
		const filters = {};

		// Select filters for user
		if (req.query.title) {
			filters.title = new RegExp(req.query.title, "i");
		}
		if (req.query.priceMin) {
			filters.price = {
				$gte: req.query.priceMin,
			};
		}
		if (req.query.priceMax) {
			if (filters.price) {
				filters.price.$lte = req.query.priceMax;
			} else {
				filters.price = {
					$lte: req.query.priceMax,
				};
			}
		}

		// creation of an object in which we will store the ranking of ads, chosen by the user
		let sort = {};

		if (req.query.sort === "date-asc") {
			sort = { created: "asc" };
		} else if (req.query.sort === "date-desc") {
			sort = { created: "desc" };
		} else if (req.query.sort === "price-asc") {
			sort = { price: "asc" };
		} else if (req.query.sort === "price-desc") {
			sort = { price: "desc" };
		}

		let page = Number(req.query.page);
		let limit = Number(req.query.limit);

		// Search for ads that match with queries sent
		const offers = await Offer.find(filters)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(limit)
			.populate({
				path: "owner",
				select: "account.username account.phone account.avatar",
			});

		// number of ads found based on filters
		const count = await Offer.countDocuments(filters);

		res.json({
			count: count,
			offers: offers,
		});
	} catch (error) {
		console.log(error.message);
		res.status(400).json({ message: error.message });
	}
});

// Get informations of an offer according to its id
router.get("/offer/:id", async (req, res) => {
	try {
		const offer = await Offer.findById(req.params.id).populate({
			path: "owner",
			select: "account.username account.phone account.avatar",
		});
		res.json(offer);
	} catch (error) {
		console.log(error.message);
		res.status(400).json({ message: error.message });
	}
});

module.exports = router;
