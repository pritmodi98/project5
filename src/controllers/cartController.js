const mongoose = require('mongoose');
const userModel = require('../models/userModel');
const productModel=require('../models/productModel')
const cartModel=require('../models/cartModel');


//validation part
const isValid = function(value) {

    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
}

const isValidRequestBody=function (requestBody) {
    return Object.keys(requestBody).length>0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createCart=async function(req,res){
    try {
        const userId=req.params.userId
        const {productId,cartId}=req.body
        if (Object.keys(userId)==0) {
            return res.status(400).send({status:false,message:'kindly provide userid in path params'})
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:'Invalid userid'})
        }
        const user=await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({status:false,message:'this user not found'})
        }
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({status:false,message:'kindly provide productid in request body'})
        }
        if (!isValid(productId)) {
            return res.status(400).send({status:false,message:'please enter productId'})
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({status:false,message:'Invalid productid'})
        }
        const product=await productModel.findOne({_id:productId,isDeleted:false})
        if (!product) {
            return res.status(404).send({status:false,message:'this product not found'})
        }
        const cart=await cartModel.findOne({userId:userId})
        if ("cartId" in req.body) {
            if (!isValid(cartId)) {
                return res.status(400).send({status:false,message:'please enter cartId'})
            }
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({status:false,message:'Invalid cartId'})
            }
            if (!cart) {
                return res.status(400).send({status:false,message:'cart not created yet.'})
            }
            if (cart._id!=cartId) {
                return res.status(400).send({status:false,message:'please enter appropriate cartId.'})
            }
        }
        
        const filterData={userId:userId,items:[],totalPrice:0,totalItems:0}
        
        if (!cart) {               
           const productObj={}
           productObj['productId']=productId
           productObj['quantity']=1
           filterData.items.push(productObj)
           filterData['totalItems']=1
           filterData['totalPrice']=product.price
           const cartData= await cartModel.create(filterData)
           return res.status(201).send({status:true,message:'cart created & product has been added in the cart',data:cartData})
        }
        const item=cart.items
        for (let i = 0; i < item.length; i++) {
            if (item[i].productId==productId) {
                item[i].quantity+=1
                cart.totalPrice+=product.price
                const updatedData=await cartModel.findOneAndUpdate({_id:cart._id},{items:item,totalPrice:cart.totalPrice},{new:true})
                return res.status(200).send({status:true,message:'quantity has been changed',data:updatedData})
            }
        }
        const productObj={}
        productObj['productId']=productId
        productObj['quantity']=1
        item.push(productObj)
        cart.totalPrice+=product.price
        cart.totalItems+=1
        const updatedData=await cartModel.findOneAndUpdate({_id:cart._id},{items:item,totalPrice:cart.totalPrice,totalItems:cart.totalItems},{new:true})
        return res.status(200).send({status:true,message:'product has been added in the cart',data:updatedData})
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}

const updateCart=async function (req,res) {
    try {
        const data=req.body
        const userId=req.params.userId
        const {cartId,productId,removeProduct}=data
        if (Object.keys(userId)==0) {
            return res.status(400).send({status:false,message:'kindly provide userid in path params'})
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:'Invalid userid'})
        }
        const checkUserId=await userModel.findById(userId)
        if (!checkUserId) {
            return res.status(404).send({status:false,message:'this user not found'})
        }
        if (!isValid(cartId)) {
            return res.status(400).send({status:false,message:'please provide cartid in request body'})
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({status:false,message:'invalid cartId'})
        }
        const cart=await cartModel.findById(cartId)

        if (cart.userId!=userId) {
            return res.status(400).send({status:false,message:'this cart does not belong to you! Enter appropriate cartId'})
        }
        if (!isValid(productId)) {
            return res.status(400).send({status:false,message:'please provide productid in request body'})
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({status:false,message:'invalid productId'})
        }
        const checkProductId=await productModel.findOne({_id:productId,isDeleted:false})
        if (!checkProductId) {
            return res.status(404).send({status:false,message:'product not found'})
        }
        if(!(removeProduct==0 || removeProduct==1)){
            return res.status(400).send({status:false,message:'it should be 0 or 1'})
        }
        if(cart.totalPrice==0 && cart.totalItems==0){
            return res.status(400).send({status:false,message:'Cart is empty'})
        }
        
        if (removeProduct==0) {  //[{},{},{},{}]
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId==productId) {
                    const quantityPrice=cart.items[i].quantity* checkProductId.price  
                    const updatedPrice=cart.totalPrice-quantityPrice
                    cart.items.splice(i,1)
                    const updatedItems=cart.totalItems-1
                    const updatedItemsAndPrice=await cartModel.findOneAndUpdate({_id:cartId},{items:cart.items,totalPrice:updatedPrice,totalItems:updatedItems},{new:true})
                    return res.status(200).send({status:true,message:'product has been removed successfully from the cart',data:updatedItemsAndPrice})
                }         
            }
            return res.status(404).send({status:false,message:'product not found in the cart'})
        }
        if (removeProduct==1) {
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId==productId) {
                    let productQuantity=cart.items[i].quantity
                    if (productQuantity==1) {
                        const quantityPrice=cart.items[i].quantity* checkProductId.price  
                        const updatedPrice=cart.totalPrice-quantityPrice
                        cart.items.splice(i,1)
                        const updatedItems=cart.totalItems-1
                        const updatedItemsAndPrice=await cartModel.findOneAndUpdate({_id:cartId},{items:cart.items,totalPrice:updatedPrice,totalItems:updatedItems},{new:true})
                        return res.status(200).send({status:true,message:'product has been removed successfully from the cart',data:updatedItemsAndPrice})
                    }
                    else{
                        cart.items[i].quantity=productQuantity-1
                        const quantityPrice=1*checkProductId.price
                        const updatedPrice=cart.totalPrice-quantityPrice
                        const updatedItemsAndPrice=await cartModel.findOneAndUpdate({_id:cartId},{items:cart.items,totalPrice:updatedPrice},{new:true})
                        return res.status(200).send({status:true,message:'Quantity has been updated in the cart successfully',data:updatedItemsAndPrice})
                    }  
                }
        
            }
            return res.status(404).send({status:false,message:'product not found in the cart'})
        }
        
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
   
}

const getCart=async function (req,res) {
    try {
        const userId=req.params.userId
        if (!isValidRequestBody(userId)) {
            return res.status(400).send({status:false,message:'kindly provide userId in path params'})
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:'invalid userId!!'})
        }
        const cart=await cartModel.findOne({userId:userId})
        if (!cart) {
            return res.status(404).send({status:false,message:'cart not found'})
        }
        return res.status(200).send({status:true,data:cart})
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}

const deleteCart=async function (req,res) {
    try {
        const userId=req.params.userId
        if (!isValidRequestBody(userId)) {
            return res.status(400).send({status:false,message:'kindly provide userId in path params'})
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:'invalid userId!!'})
        }
        const cart=await cartModel.findOne({userId:userId})
        if (!cart) {
            return res.status(404).send({status:false,message:'cart not found'})
        }
        if (cart.items.length==0) {
            return res.status(400).send({status:true,message:'cart is empty'})
        }
        const cartData=await cartModel.findOneAndUpdate({userId:userId},{items:[],totalPrice:0,totalItems:0},{new:true})
        return res.status(200).send({status:true,message:'cart items removed',data:cartData})
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
        
    }
}
module.exports={updateCart,createCart,getCart,deleteCart}
