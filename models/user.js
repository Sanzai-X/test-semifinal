const mongoose = require('mongoose');
const databaseURL = "mongodb+srv://dbAdmin:dbAdmin12345@cluster0.e2ayszw.mongodb.net/ReviewWebsite?retryWrites=true&w=majority&appName=Cluster0";

const options = {useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false };

mongoose.connect(databaseURL, options);

const userSchema = new mongoose.Schema({
		username: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		description: String, 
		userphoto: {
			type: String,
		},
		isOwner: {
			type: Boolean,
		}
}, {timestamps: true});

exports.registerUser = async function(param){
	console.log("check");
	try{
		const user = userModel.create(param);
		return user;
	}
	catch (err){
		console.error(err);
	}
}

const userModel = mongoose.model("User", userSchema, "users");
module.exports = userModel;
// removed these for now because it seems that there's a delay when using the exports below
/*
exports.getCurrent = async function(id){
	try{
		const result = userModel.findById(id).exec();
		return result;
	}
	catch (err){
		console.error(err);
	}
}


exports.loginUser = async function(param){
	try{
		const user = userModel.findOne(param);
		return user;
	}
	catch (err){
		console.error(err);
	}
}

exports.registerUser = async function(param){
	try{
		const user = userModel.create(param);
		return user;
	}
	catch (err){
		console.error(err);
	}
}
*/