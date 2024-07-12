const { Router } = require("express");
const { createCategory, getCategories, updateCategory, deleteCategory } = require("../controllers/category.controller");
const isAuth = require("../middleware/is-auth.middleware");
const router = Router();

router.post("/", isAuth, createCategory);
router.get("/", getCategories);
router.patch("/:id", isAuth, updateCategory);
router.delete("/:id", isAuth, deleteCategory);

module.exports = router;