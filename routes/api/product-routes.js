const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  const productId = await Product.findOne({
    where: { id: req.params.id },
    include: [
      { model: Category, attributes: ["category_name"] },
      { model: Tag, attributes: ["tag_name"] },
    ],
  });
  return res.json(productId);
});

// create new product
router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagId = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagId);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((tagIdProducts) => res.status(200).json(tagIdProducts))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
     
      const tagIdProducts = productTags.map(({ tag_id }) => tag_id);
     
      const createProductTags = req.body.tagIds
        .filter((tag_id) => !tagIdProducts.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
     
      const productRemoveTag = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      
      return Promise.all([
        ProductTag.destroy({ where: { id: productRemoveTag } }),
        ProductTag.bulkCreate(createProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
   
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbProductData) => {
      if (!dbProductData) {
        res.status(404).json({ message: "Product is Deleted" });
        return;
      }
      res.json(dbProductData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
