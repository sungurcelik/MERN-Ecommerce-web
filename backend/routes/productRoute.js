const express = require("express");
const {
  allProducts,
  detailProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  createReview,
} = require("../controllers/productController.js");

const router = express.Router();

router.get("/products", allProducts);
router.get("/products/:id", detailProduct);
router.post("/product/new", createProduct);
router.post("/product/newReview", createReview);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

module.exports = router;
