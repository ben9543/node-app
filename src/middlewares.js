require('dotenv').config();

export const authUser = (req, res, next) => {
    const { userId } = req.session;
    userId ? res.redirect("/") : next();
};

export const authAdmin = (req, res, next) => {
    const { userId, isAdmin } = req.session;
    if(userId && isAdmin){
        next();
    }else{
        req.session.destroy((err => console.log(err)));
        res.clearCookie(process.env.SESSION_ID);
        res.redirect("/errors/403");
    }
};

export const setLocals = (req, res, next) => {
    const { userId, isAdmin } = req.session;
    res.locals.siteName = process.env.SITE_NAME || "Sample";
    res.locals.userId = userId;
    res.locals.isAdmin = isAdmin;
    next();
};

export const setLocalsAdmin = (req, res, next) => {
    res.locals.siteName = "Admin";
    next();
};

export const setQueryString = (req, res, next) => {
    const { loginFailed } = req.query;
    res.locals.loginFailed = loginFailed;
    next();
};