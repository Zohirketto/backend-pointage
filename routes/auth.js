var passport = require('passport');
const router = require("express").Router();
const authController = require("../controllers/authController")
const path = require('path');



    // handle login
router.post("/login", authController.login)
    // handle logout
router.post("/logout", authController.logout)

    // loggedin

router.get("/loggedin",authController.isloggedin)
     // signup
router.post('/signup', authController.signup);
router.get('/getUsers', authController.getUsers); 

// delete
router.delete('/delete/:id', authController.deleteUser);
// update
router.put('/update/:id', authController.updateUser);





module.exports = router;
//};