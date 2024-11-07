const options = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/auth/github/callback'
}

const verify = async (accessToken, refreshToken, profile, callback)  => {
    const { _json: { id, name, login, avatar_url } } = profile
    const userData = { githubId: id, username: login, avatarUrl: avatar_url, accessToken }

    try {
        const results = await pool.query('SELECT * FROM users WHERE username = $1', [userData.username])
        const user = results.rows[0]

        if (!user) {
            const results = await pool.query(
                `INSERT INTO users (githubid, username, avatarurl, accesstoken)
                VALUES($1, $2, $3, $4)
                RETURNING *`,
                [userData.githubId, userData.username, userData.avatarUrl, accessToken]
            )

            const newUser = results.rows[0]
            return callback(null, newUser)            
        }

        return callback(null, user)

     }

    catch (error) {
        return callback(error)
    }
}

router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({ success: true, user: req.user })
    }
})

router.get('/login/failed', (req, res) => {
    res.status(401).json({ success: true, message: "failure" })
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(error)
        }

        req.session.destroy((err) => {
            res.clearCookie('connect.sid')

            res.json({ status: "logout", user: {} })
        })
    })
})

router.get(
    '/github',
    passport.authenticate('github', {
        scope: [ 'read:user' ]
    })
)

router.get(
    '/github/callback',
    passport.authenticate('github', {
        successRedirect: '/',
        failureRedirect:'/destinations',
    })
    )