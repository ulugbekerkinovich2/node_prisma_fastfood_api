const { Router } = require("express");
const { createProduct, getProducts, updateProduct, deleteProduct } = require("../controllers/products.controller");
const isAuth = require("../middleware/is-auth.middleware");
const router = Router();

router.post("/", isAuth, createProduct);
router.get("/", getProducts);
router.patch("/:id", isAuth, updateProduct);
router.delete("/:id", isAuth, deleteProduct);

module.exports = router;