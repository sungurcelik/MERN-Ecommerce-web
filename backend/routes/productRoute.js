const express = require("express");
const {
  allProducts,
  detailProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  createReview,
  adminProducts,
} = require("../controllers/productController.js");
const {
  authenticationMid,
  roleChecked,
} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/products", allProducts);
router.get(
  "/admin/products",
  authenticationMid,
  roleChecked("admin"),
  adminProducts
);
router.get("/products/:id", detailProduct);
router.post(
  "/product/new",
  authenticationMid,
  roleChecked("admin"),
  createProduct
);
router.post("/product/newReview", authenticationMid, createReview);
router.delete(
  "/products/:id",
  authenticationMid,
  roleChecked("admin"),
  deleteProduct
);
router.put(
  "/products/:id",
  authenticationMid,
  roleChecked("admin"),
  updateProduct
);

module.exports = router;
