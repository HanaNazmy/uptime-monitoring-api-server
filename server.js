require('dotenv').config({ path: '.env' });
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
// const axios = require("axios");
// const superagent = require('superagent');

const mongoose = require('mongoose')
const User = require('./model/user')
const Check = require('./model/check')
const Report = require('./model/report')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const swaggerUI = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const { URL } = require('url');

// to generate a token
// require('crypto').randomBytes(64).toString('hex')

const { isUrlUp, stringIsAValidUrl } = require("./utils");
const { authenticateRegistration, authenticateLogin } = require("./auth");
const req = require('express/lib/request');

mongoose.connect(process.env.DB_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
}).then((res) => { console.log('Database is connected successfully'); })
	.catch((err) => { console.log(err); })

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.set("view engine", "ejs")

// app.get('/token', verifyToken, async (req, res) => {
// })

/* LOGIN & REGISTRATION*/

app.get('/login', (req, res) => {
	res.json({ status: 'ok', data: "Login Page" })
})

app.get('/register', (req, res) => {
	res.json({ status: 'ok', data: "Registration Page" })
})

app.post('/login', async (req, res) => {
	authenticateLogin(req, res)
})

app.post('/register', async (req, res) => {
	authenticateRegistration(req, res)
})

/* CHECKS */
//Get a check
app.get('/check/:name', verifyToken, async (req, res) => {
	var checkName = req.params.name;
	try {
		Check.findOne({ name: checkName, username: req.user.username }, (err, obj) => {
			if (err) {
				console.log(err);
			} else {
				if (obj != null)
					res.json({ status: 'ok', data: obj });
				else
					res.json({ status: 'ok', data: "No Checks available" });
			}
		});
	} catch (error) {
		res.json({ status: 'ok', data: "No Checks available" });
	}
})

//Get all user checks
app.get('/checks', verifyToken, async (req, res) => {
	try {
		Check.find({ username: req.user.username }, (err, obj) => {
			if (err) {
				console.log(err);
			} else {
				if (obj != null && obj.length > 0)
					res.json({ status: 'ok', data: obj });
				else
					res.json({ status: 'ok', data: "No Checks available" });
			}
		});
	} catch (error) {
		res.json({ status: 'error', data: "No Checks available" });
	}
	
})

//Create a check
app.post('/check', verifyToken, async (req, res) => {
	req.body.username = req.user.username;
	const check = new Check(req.body);
	// console.log("check ",check);
	try {
		check.save((err, result) => {
			if (err) {
				console.log(err);
			} else {
				return getURL(req.body.url, res)
			}
		})
	} catch (error) {
		res.json({ status: 'error', data: "Couldn't add check" });
	}
});

//Update a check
app.put('/check/:name', verifyToken, async (req, res) => {
	let filter = { name: req.params.name, user: req.user.username }
	let update = { url: req.body.url }
	try {
		Check.updateOne(filter, update,
			function (err, docs) {
				if (docs.n == 0) {
					return res.json({ status: 'error', data: "Check doesn't exist" });
				}
				if (err) {
					console.log(err)
					res.json({ status: 'error', data: "Check doesn't exist" });
				}
				else {
					getURL(req.body.url, res);
				}
			});
	} catch (error) {
		res.json({ status: 'error', data: "Check doesn't exist" });
	}

});

//Delete a check
app.delete('/check', verifyToken, async (req, res) => {
	let filter = { name: req.body.name, user: req.user.username }
	try {
		Check.findOneAndDelete(filter, function (err, docs) {
			if (docs == null) {
				return res.json({ status: 'error', data: "Check doesn't exist" });
			}
			if (err) {
				console.log(err)
				res.json({ status: 'error', data: "Check doesn't exist" });
			}
			else {
				// console.log("Deleted User : ", docs);
				res.json({ status: 'ok', data: docs.name + " is deleted" });
			}
		});
	} catch (error) {
		 res.json({ status: 'error', data: "Check doesn't exist" });
	}

});

/* REPORTS */
//Get all reports
app.get('/reports', verifyToken, async (req, res) => {
	try {
		Report.find({ username: req.user.username }, (err, obj) => {
			if (err) {
				console.log(err);
			} else {
				// console.log(obj);
				if (obj != null && obj.length > 0)
					res.json({ status: 'ok', data: obj });
				else
					res.json({ status: 'ok', data: "No Reports available" });
			}
		});
	} catch (error) {
		res.json({ status: 'ok', data: "No Reports available" });
	}
	
})

//Post a new report
app.post('/report', verifyToken, async (req, res) => {
	const report = new Report(req.body);
	try {
		report.save((err, result) => {
			if (err) {
				console.log(err);
			} else {
				res.json({ status: 'ok', data: result });
			}
		})
	} catch (error) {
		console.log(error);
	}
})

// Filter Checks by Tags and Get their Reports
app.get('/reports/:tag', verifyToken, async (req, res) => {
	var tag = req.params.tag
	try {
	Check.find({ tags: tag, username: req.user.username }, (err, obj) => {
		if (err) {
			console.log(err);
		} else {
			if (obj != null) {
				var names = obj.map(check => check.name);
				try {
					Report.find({ username: req.user.username, name: {$in:names}}, (err, obj) => {
						if (err) {
							console.log(err);
						} else {
							if (obj != null && obj.length > 0) {
								// console.log(obj);
								return res.json({ status: 'ok', data: obj });
							}
							else{
								return res.json({ status: 'ok', data: "No Reports available" });
							}	
						}
					});
				} catch (error) {
					return res.json({ status: 'error', data: "No Reports available" });
				}
			}
		}
	});
} catch (error) {
	 res.json({ status: 'error', data: "No Reports available" });
}
})

//Check url is up or down
async function getURL(inputURL, res) {
	try {
		var url = new URL(inputURL);
		// console.log(url);
		if (stringIsAValidUrl(url.href)) {
			var startTime = new Date();
			const statusResult = await isUrlUp(url);
			var endTime = statusResult.endTime;
			var responseTime = endTime - startTime;
			var status = statusResult;
			var reportDetails = {
				status:status,
				responseTime:responseTime,
				uptime: status?responseTime:0,
				downtime: status?0:responseTime,
				history:startTime,
				availability:90,
				outages:1,
				name:req.body.username
			}
			// console.log('report details ', reportDetails);
			const report = new Report(reportDetails);
			try {
				report.save((err, result) => {
					if (err) {
						console.log(err);
					}
				})
			} catch (error) {
				console.log(error);
			}
			if (statusResult.statusCode) {
				res.json({ status: 'ok', data: "The site is running" });
			}
			else {
				res.json({ status: 'error', error: "The site might be down" });
			}
		} else {
			res.json({ status: 'error', error: "The site might be down" });
		}
	} catch (error) {
		res.json({ status: 'error', error: "The site might be down" });
	}
}

//Verify JWToken
async function verifyToken(req, res, next) {
	try {
		const token = req.headers.authorization.split(" ")[1];
		if (token == null)
			return res.json({ status: 'error', error: "Unauthorized" });
		await jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
			if (err) return res.sendStatus(403)
			req.user = user
			next()
		})
	} catch {
		res.json({ status: 'error', error: "Invalid user ID" });
	}
}


//TODO
//Authentication Check for login/register apis
//Emails
//Notifications

app.listen(5000, () => {
	console.log('Server up at 5000')
})
