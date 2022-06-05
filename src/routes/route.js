const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")

const cartController=require("../controllers/cartController")
const orderController=require("../controllers/orderController")
const { authentication, authorization } = require("../middleWare/userAuth")


// User routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile', authentication,authorization,userController.getUserProfile)
router.put('/user/:userId/profile', authentication, authorization, userController.updateUserProfile)


//Product routes
router.post('/products', productController.createProduct);
router.get('/products/:productId', productController. getProductById);
router.put('/products/:productId', productController.updateByProductId);
router.get('/products', productController.getProduct)
router.delete('/products/:productId', productController.deleteproductsById);

//cart routes
router.post('/users/:userId/cart',authentication,authorization,cartController.createCart)
router.put('/users/:userId/cart',authentication,authorization,cartController.updateCart)
router.get('/users/:userId/cart',authentication,authorization,cartController.getCart)
router.delete('/users/:userId/cart',authentication,authorization,cartController.deleteCart)

//order routes
router.post('/users/:userId/orders',authentication,authorization,orderController.createOrder)
router.put('/users/:userId/orders',authentication,authorization,orderController.updateOrder)


module.exports = router;