import express from "express";
const adminRouter = express.Router();

// Get
adminRouter.get("/", (req, res) => {
    res.render("admin/adminHome.pug", {pageTitle:"Home"});
});
adminRouter.get("/upload", (req, res) => {
    res.render("admin/adminUpload.pug", {pageTitle:"Upload"});
});
adminRouter.get("/*", (req, res) => {
    res.redirect("/errors/404");
});
// Post


export default adminRouter;