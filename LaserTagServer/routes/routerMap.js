const express = require("express");

const router = express.Router();
const path = require("path");
const serveIndex = require("serve-index");

const basePath = "../public/map";
// tutaj jutro zmienimy wszystko na route.use(static etc)

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  // console.log(`Start this middleware`);
  next();
});

//*
router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, basePath, "map.html"));
  //   res.send("asdas");
  //   console.log(`Server start at ${Date()}`);
}); //* /
router.use("/", express.static(path.join(__dirname, basePath))); // Każdy plik z katalogu `public` jest teraz dostępny pod adresem URL z dołączoną na końcu nazwą tego pliku.
// router.use("/all", serveIndex("public"));
//* /
module.exports = router;
