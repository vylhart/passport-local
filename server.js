if (process.env.NODE_ENV !== 'prduction'){
    require('dotenv').config()
}

const express            = require('express')
const app                = express()
const bcrypt             = require('bcrypt')
const passport           = require('passport')
const flash              = require('express-flash')
const session            = require('express-session')
const localStrategy      = require('passport-local').Strategy
const initializePassport = require('./passport-config')
const users = []


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id    => users.find(user => user.id    === id)    
)

app
    .set('view-engine', 'ejs')
    .use(express.urlencoded({extended:false}))
    .use(flash())
    .use(session({
        secret: process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false
    }))
    .use(passport.initialize())
    .use(passport.session())

app
    .get('/', (req,res)=>{
        let name = 'Guest'
        if(req.user)    name = req.user.name
        res.render('index.ejs', {name: name})
    })

    .get('/login', (req,res)=> res.render('login.ejs'))
    
    .post('/login', passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }))

    .get('/register', (req,res)=>res.render('register.ejs'))
    
    .post('/register', async (req,res)=>{
        try{
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            })
            res.redirect('/login')
        }
        catch{
            res.redirect('/register')
        } 
    })

app.listen(3000)
