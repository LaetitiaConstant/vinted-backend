const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
	// If user is authenticated
	if (req.headers.authorization) {
		const token = req.headers.authorization.replace("Bearer ", "");
		// Search if user has a token
		const user = await User.findOne({ token: token });

		if (user) {
			req.user = user;
			next();
		} else {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}
	} else {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}
};

module.exports = isAuthenticated;
