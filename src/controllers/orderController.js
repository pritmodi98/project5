const { default: mongoose } = require('mongoose');
const cartModel=require('../models/cartModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

//validation Part
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

//---------------------------------------Create Order-------------------------------------------------------------------//


const createOrder = async(req, res) => {
    try {
        let userId = req.params.userId
        let data = req.body
        let { cartId, cancellable, status } = data

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid!" })
        }

        const isUserExists = await userModel.findById(userId)
        if (!isUserExists) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please provide cartId, Cancellable, Status" })
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please enter CartId" })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cartId is invalid!" })
        }

        const findCart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!findCart) {
            return res.status(404).send({ status: false, message: "No Cart found" })
        }

        let itemsArr = findCart.items
        if (itemsArr.length == 0) {
            return res.status(400).send({ status: false, message: "Cart is Empty" })
        }

        let sum = 0
        for (let i of itemsArr) {
            sum += i.quantity
        }

        let newData = {
            userId: userId,
            items: findCart.items,
            totalItems:findCart.totalItems,
            totalPrice: findCart.totalPrice,
            totalQuantity: sum,
        }

        //is Cancellable key available?
        if ("cancellable" in data) {
            if (!isValid(cancellable)) {
                return res.status(400).send({ status: false, message: "Please enter cancellable" });
            }
              //cancellable must be boolean
            if (!['true', 'false'].includes(cancellable)) {
                return res.status(400).send({ status: false, message: "Cancellable must be a Boolean Value" });
            }
            newData.cancellable = cancellable
        }

        
        if ("status" in data) {
            if (!isValid(status)) {
                return res.status(400).send({ status: false, message: "Please enter status" });
            }
            if (!["pending", "completed", "cancelled"].includes(status)) {
                return res.status(400).send({ status: false, message: "Status must be a pending, completed, cancelled" });
            }
            newData.status = status
        }
      
        const orderCreated = await orderModel.create(newData)
        await cartModel.findOneAndUpdate({_id:cartId},{items:[],totalItems:0,totalPrice:0})

        // findCart.items = []
        // findCart.totalItems = 0
        // findCart.totalPrice = 0
        // findCart.save()
        return res.status(201).send({ status: false, message: "Order Placed!!", data: orderCreated });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



const updateOrder=async function (req,res) {
    try {
        const userId=req.params.userId
        const {orderId}=req.body
        
        if (!isValidObjectId(userId)) {
            return res.status(400).send({status:false,message:'invalid userid!!'})
        }
        const user =await userModel.findOne({_id:userId})
        if (!user) {
            return res.status(404).send({status:false,message:'user not found'})
        }
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({status:false,message:'provide appropriate orderId in request body'})
        }
        if (!isValid(orderId)) {
            return res.status(400).send({status:false,message:'enter orderId'})
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({status:false,message:'invalid orderId'})
        }
        const order=await orderModel.findOne({_id:orderId,userId:userId,isDeleted:false})
        if (!order) {
            return res.status(404).send({status:false,message:'order not found'})
        }
        // if (order._id!=userId) {
        //     return res.status(400).send({status:false,Message:'this order does not belong to you,enter appropriate order id'})
        // }
        if (order.cancellable==true) {
            const filterData={}
            filterData['isDeleted']=true
            filterData['deletedAt']= Date.now()
            filterData['status']='cancelled'
            const updatedStatus=await orderModel.findOneAndUpdate({_id:orderId},filterData,{new:true})
            return res.status(200).send({status:true,message:'successfully updated the order status',data:updatedStatus})
        }
        else{
            return res.status(200).send({status:true,message:'this order can not be cancelled'})
        }

        
        // if (order.status=='pending' && status.toLowerCase()=='cancelled' && order.cancellable==true) {
        //     const filterData={}
        //     filterData['isDeleted']=true
        //     filterData['DeletedAt']=Date.now()
        //     filterData['status']=status.toLowerCase()
        //     const updatedStatus=await orderModel.findOneAndUpdate({_id:orderId},filterData,{new:true})
        //     return res.status(200).send({status:true,message:'successfully updated the order status',data:updatedStatus})
        // }
        // if (order.status=='pending' && status.toLowerCase()=='cancelled' && order.cancellable==false) {
        //     return res.status(400).send({status:false,message:'order is not allowed to cancel'})
        // }
        // if (order.status=='pending' && status.toLowerCase()=='pending') {
        //     return res.status(400).send({status:false,message:'unable to update or change the status,because it is already pending'})
        // }
        // if (order.status=='pending' && status.toLowerCase()=='completed') {
        //     const updatedStatus=await orderModel.findOneAndUpdate({_id:orderId},{status:status.toLowerCase()},{new:true})
        //     return res.status(400).send({status:false,message:'successfully updated the order status',data:updatedStatus})
        // }
        // if ((order.status=='completed') && (status.toLowerCase()=='pending' || status.toLowerCase()=='completed' || status.toLowerCase()=='cancelled')) {
        //     return res.status(400).send({status:false,message:'order is already completed'})
        // }
        // if ((order.status=='cancelled') && (status.toLowerCase()=='cancelled' || status.toLowerCase()=='pending' || status.toLowerCase()=='completed')) {
        //     return res.status(400).send({status:false,message:'order is already cancelled'})
        // }
   
    
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }

   
}


module.exports={createOrder,updateOrder}