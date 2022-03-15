const router = require("express").Router();
const { Category, Product } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const catagories = await Category.findAll({
      include: { model: Product },
    });
    res.status(200).json(catagories);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const categoryId = await Category.findByPk(req.params.id, {
      include: { model: Product },
    });
    res.status(200).json(categoryId);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const makeCatagory = await Category.create(req.body);
    res.status(200).json(makeCatagory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const newCatagory = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(newCatagory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(deletedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
