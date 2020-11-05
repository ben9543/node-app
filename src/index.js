require('dotenv').config();
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import path from 'path';

const app = express();
const {
    PORT,
    SESSION_SECRET,
    SESSION_ID,
    NODE_ENV = 'development'
} = process.env;

const IS_PROD = (NODE_ENV === 'production');

// Needs to replaced by Redis or Mongo
const DB = [
    { id: 1, name: "Ben", email:"ben@gmail.com", password: "1234"},
    { id: 2, name: "Bennie", email:"bennie@gmail.com", password: "1234"},
    { id: 3, name: "master", email:"master@gmail.com", password: "1234"},
]

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    name: SESSION_ID,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: IS_PROD,
        maxAge: 1000 * 60 * 60 * 2, // 2hours
        sameSite: true
    }
}));

app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(helmet());
app.use('/static', express.static(path.join(__dirname, 'static')));

// Custom Middleware
const redirectHome = (req, res, next) => {
    const { userId } = req.session;
    userId ? res.redirect("/") : next();
};

// GET
app.get("/", (req, res) => {
    const { userId } = req.session;
    console.log(userId)
    if(!userId)res.sendFile(path.join(__dirname, "views/index.html"));
    else res.sendFile(path.join(__dirname, "views/authenticated.html"));
});

// POST
app.post("/login", redirectHome, (req, res) => {
    const { email, password } = req.body;
    if(email && password){
        const user = DB.find(user => user.email === email && user.password === password)
        if (user) req.session.userId = user.id;
        res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "views/loginError.html"));
});

app.post("/register", redirectHome, (req, res) => {
    // Check if the user already exists
});

app.listen(PORT, () => console.log(`\nListening On: http://localhost:${PORT}\n\nMode: ${NODE_ENV}`));