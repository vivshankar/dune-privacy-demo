// import dependencies and initialize the express router
const express = require('express');
const bodyParser = require('body-parser');
const UserController = require('../controllers/users-controller');
const CartController = require('../controllers/cart-controller');
const userController = new UserController();
const cartController = new CartController();

const router = express.Router();
const jsonParser = bodyParser.json();

// define routes
router.get('/', userController.getUsersIndex);
router.get('/profile', userController.getProfile);
router.get('/consents', userController.getConsents);
router.post('/consents', jsonParser, cartController.storeConsents);
router.get('/cart', cartController.assess);

module.exports = router;