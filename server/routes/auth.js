const express = require("express");
const router = express.Router();
const { authLogin, authSignup, emailVerify } = require("../controllers/auth");
const { checkAuth } = require("../middleware/checkAuth");

router.post("/login", authLogin);
router.post("/signup", authSignup);
router.get("/verify", emailVerify);

router.get('/authcheck', checkAuth, function (req, res) { return res.status(200).json({ message: "Authenticated" }) });

router.get('/logout', function (req, res) {
    res.clearCookie(process.env.COOKIE_NAME);
    return res.status(200).json({ message: "logged out" });
});

module.exports = router;