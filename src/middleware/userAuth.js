const jwt = require("jsonwebtoken");
 const { default: mongoose } = require("mongoose");
 const userModel = require('../models/userModel');
 
 const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)}

//----------------------------------------authentication----------------------------------------------------*/
const authentication = async function (req, res, next) {
    try {
        let token = req.header('Authorization', 'Bearer Token');
        if (!token) return res.status(400).send({ status: false, message: "login is required" })

        let splitToken = token.split(" ")

        let verifiedtoken = jwt.verify(splitToken[1], "securedprivatekey")
        if (!verifiedtoken) return res.status(400).send({ status: false, message: "token is invalid" })

            let exp = verifiedtoken.exp
            let iatNow = Math.floor(Date.now() / 1000)
            if (exp < iatNow) {
                return res.status(401).send({ status: false, message: 'session expired, please login again' })
            }

        next();
    }
    catch (error) {
        return res.status(500).send({status: false, msg: error.message })
    }
}
   
   // //----------------------------------------authorization----------------------------------------------------*/

let authorization = async function (req, res, next) {
    try {
        let token = req.header('Authorization', 'Bearer Token');
        let splitToken = token.split(" ")
        let decodedtoken = jwt.verify(splitToken[1], "securedprivatekey")
        let userId = req.params.userId;
        if (!isValidObjectId(userId))
        return res.status(400).send({ status: false, msg: "Please enter valid userId" })

        let user = await userModel.findOne({ _id: userId })
        if (!user) { return res.status(404).send({ status: false, msg: "user does not exist with this userId" }) }
        if (decodedtoken.userId != user._id){
         return res.status(403).send({ status: false, msg: " unauthorised access" }) }
        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = {  authentication, authorization}
   
  
