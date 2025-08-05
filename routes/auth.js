var passport = require('passport');
const router = require("express").Router();
const authController = require("../controllers/authController")
const path = require('path');


router.get("/",authController.isloggedin)

router.post("/login", authController.login)
    // handle logout
router.post("/logout", authController.logout)

    // loggedin

router.get("/loggedin",authController.isloggedin)

router.post('/signup',authController.securedAdmin, authController.signup);

    // signup


module.exports = router;
//};