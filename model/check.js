const mongoose = require('mongoose')
require('mongoose-type-url');

const CheckSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true},
        username: { type: String, required: true, ref: 'User'},
        url: { type: mongoose.SchemaTypes.Url, required: true},
		protocol: { type: String, required: true },
        path: { type: String, required: false },
        port: { type: Number, required: false },
        webhook: { type: mongoose.SchemaTypes.Url, required: false },
        timeout: { type: Number, required: false, default:5 },
        interval: { type: Number, required: false, default:10 },
        threshold: { type: Number, required: false, default:1 },
        authentication: { type: String, required: false, username:{type:String},password:{type:String}},
        httpHeaders: { type: Map, required: false },
        assert: { type: String, required: false, statusCode:{type:Number}},
        tags: { type: [String], required: false },
        ignoreSSL: { type: Boolean, required: true },
	},
	{ collection: 'checks' }
)

const checkModel = mongoose.model('CheckSchema', CheckSchema)

module.exports = checkModel
