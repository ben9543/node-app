export const authUser = (req, res, next) => {
    const { userId } = req.session;
    userId ? res.redirect("/") : next();
};

export const authAdmin = (req, res, next) => {
    const { isAdmin } = req.session;
    isAdmin ? next() : res.redirect("/errors/403");
};

export const setLocals = (req, res, next) => {
    const { userId, isAdmin } = req.session;
    res.locals.userId = userId;
    res.locals.isAdmin = isAdmin;
    next();
};

export const setQueryString = (req, res, next) => {
    const { loginFailed } = req.query;
    res.locals.loginFailed = loginFailed;
    next();
};