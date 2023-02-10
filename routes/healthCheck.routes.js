const { Router } = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth.middleware");
const router = Router();

router.get("*", async (req, res) => {
  try {
    return res.json("success");
  } catch (e) {
    //Если мы тут, что-то непредвиденное случилось
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

module.exports = router;
