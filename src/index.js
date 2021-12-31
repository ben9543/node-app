require('dotenv').config();
import path from 'path';
import express from "express";
import session, { MemoryStore } from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import redis from "redis";
import adminRouter from "./routers/adminRouter";
import { authAdmin, authUser, setLocals, setQueryString, setLocalsAdmin } from "./middlewares";


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

const port = PORT || 3000;
const IS_PROD = (NODE_ENV === 'production');

// Make this true if you have redis server ready in-serve
const REDIS_ON = false;

// Needs to replaced by Redis or Mongo
const DB = [
    { id: 1, name: "Ben", email:"ben@gmail.com", password: "1234", isAdmin: false},
    { id: 2, name: "Bennie", email:"bennie@gmail.com", password: "1234", isAdmin: false},
    { id: 3, name: "master", email:"master@gmail.com", password: "1234", isAdmin: true},
]
let redisClient = REDIS_ON ? redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
}) : null;

const SessionStore = REDIS_ON ? ( new RedisStore({ client: redisClient }) ) : ( new MemoryStore({}) );

/* Pug setup */
app.set('views', './src/views')
app.set('view engine', 'pug');
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

/* Middlewares */
app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(helmet());
app.use('/static', express.static(path.join(__dirname, 'static')));

/* GET */
app.get("/", setLocals, setQueryString, (req, res) => {
    res.render("pages/home.pug");
});
app.get("/chat", setLocals, (req, res) => {
    res.render("pages/chat.pug");
});

/* Errors */
app.get("/errors/403", (req, res) => {
    res.render("403.pug");
});
app.get("/errors/404", (req, res) => {
    res.render("404.pug");
});

/* POST */
app.post("/login", authUser, (req, res) => {
    const { email, password } = req.body;
    if(email && password){
        const user = DB.find(user => (user.email === email) && (user.password === password))
        if (user) {
            req.session.userId = user.id;
            req.session.isAdmin = user.isAdmin;
            res.redirect("/");
        }
        else {
            res.redirect("/?loginFailed=true");
        }
    }
    else res.redirect("/errors/404");
});
app.post("/register", authUser, (req, res) => {
    // Check if the user already exists
});
app.post("/logout", (req, res) => {
    req.session.destroy((err => console.log(err)));
    res.clearCookie(SESSION_ID);
    res.redirect("/");
});

/* Admin Router */
app.use("/admin", authAdmin, setLocalsAdmin, adminRouter);

/* Server */
app.listen(port, () => console.log(`\nListening On: http://localhost:${port}\n\nMode: ${NODE_ENV}`));
