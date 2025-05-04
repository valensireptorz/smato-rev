var express = require("express");
const Model_Users = require("../model/Model_Users");
var router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    if (Data.length > 0) {
       if (Data[0].level_users != "admin") {
        res.redirect("/logout");
      } else {
        res.render("users/super", {
          title: "Users Home",
          username: Data[0].username,
          foto_users: Data[0].foto_users,
          level: level_users, // Tambahkan foto_users ke dalam objek
        });
      }
    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    res.status(501).json("Butuh akses login");
  }
});

module.exports = router;
