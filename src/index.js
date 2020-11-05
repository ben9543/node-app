require('dotenv').config();
import path from 'path';
import express from "express";
import session, { MemoryStore } from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import redis from "redis";
let RedisStore = require('connect-redis')(session)

const app = express();
const {
    PORT,
    SESSION_SECRET,
    SESSION_ID,
    REDIS_HOST,
    REDIS_PORT,
    NODE_ENV = 'development',
} = process.env;

const IS_PROD = (NODE_ENV === 'production');

// Make this true if you have redis server ready in-serve
const REDIS_ON = false;

// Needs to replaced by Redis or Mongo
const DB = [
    { id: 1, name: "Ben", email:"ben@gmail.com", password: "1234"},
    { id: 2, name: "Bennie", email:"bennie@gmail.com", password: "1234"},
    { id: 3, name: "master", email:"master@gmail.com", password: "1234"},
]
let redisClient = REDIS_ON ? redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
}) : null;

const SessionStore = REDIS_ON ? ( new RedisStore({ client: redisClient }) ) : ( new MemoryStore({}) );

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
    },
    store: SessionStore
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
    //redisClient.on('error', console.error)
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
app.post("/logout", (req, res) => {
    req.session.destroy((err => console.log(err)));
    res.clearCookie(SESSION_ID);
    res.redirect("/");
});

app.listen(PORT, () => console.log(`\nListening On: http://localhost:${PORT}\n\nMode: ${NODE_ENV}`));