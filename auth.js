const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./model/user')

async function authenticateRegistration(req, res) {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string')
        return res.json({ status: 'error', error: 'Invalid username' });
    if (!password || typeof password !== 'string')
        return res.json({ status: 'error', error: 'Invalid password' });
    if (password.length < 8)
        return res.json({ status: 'error', error: 'Password must be at least 8 characters' });
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Add to DB
    const user = new User({ username: username, password: hashedPassword });
    user.save((err, result) => {
        if (err) {
            console.log(JSON.stringify(err));
            // Check if username already exists
            if (err.code === 11000) {
                console.log('Username already exists');
                return res.json({ status: 'error', error: 'Username already exists' });
            }
        } else {
            // console.log(result);
            req.userId = result._id;
            const token = generateToken({ id: result._id, username: result.username })
            // console.log('token ',token);
            return res.json({ status: 'ok', data: token })
        }
    })
}

async function authenticateLogin(req, res) {
    const { username, password } = req.body
    const user = await User.findOne({ username }).lean()
    if (!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' })
    }
    if (await bcrypt.compare(password, user.password)) {
        // the username, password combination is successful
        req.userId = user._id;
        const token = await generateToken({ id: user._id, username: user.username })
        return res.json({ status: 'ok', data: token })
    }
    res.json({ status: 'error', error: 'Invalid username/password' })
}

async function generateToken(params) {
    const { id, username } = params
    // console.log('id ',id);
    // console.log('username ',username);
    const token = await jwt.sign(
        {
            id: id,
            username: username
        },
        process.env.JWT_SECRET
    )
    // console.log('token ',token);
    return token;
}

module.exports = { authenticateRegistration, authenticateLogin }