// eslint-disable-next-line import/order

const express = require("express");

const app = express();
const https = require("https");
// const path = require("path");
const fs = require("fs");

const key = fs.readFileSync("./server.key");
const cert = fs.readFileSync("./server.cert");
// const http = require("http");
const websocket = require("ws");

const gameHandler = require("./game");
const statisticHandler = require("./statistic");

const httpsSeverPort = process.env.PORT || 3000;
const webSockedPort = 8000;

//= ==========================================================================
// HTTPS
//= ==========================================================================

const webServer = https.createServer(
  {
    key,
    cert,
  },
  app
);

webServer.listen(httpsSeverPort, () => {
  console.log(`LaserTag Server is listening on port ${httpsSeverPort}`);
  console.log(`[INFO] Podaj IP maszyny w pliku game_javascript.js`);
});

const routerGame = require("./routes/routerGame");
const routerScan = require("./routes/routerScan");
const routerMap = require("./routes/routerMap");
const routerStatistic = require("./routes/routerStatistic");
const routerPortal = require("./routes/routerPortal");

// Set header to no-cache
function setHeaders(res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
}

app.use("/game", routerGame, setHeaders);
app.use("/scan", routerScan, setHeaders);
app.use("/map", routerMap, setHeaders);
app.use("/statistic", routerStatistic, setHeaders);
app.use("/portal", routerPortal, setHeaders);

// app.use(express.static(path.join(__dirname, "/public"))); //Każdy plik z katalogu `public` jest teraz dostępny pod adresem URL z dołączoną na końcu nazwą tego pliku.

//= ==========================================================================
// WebSocket
//= ==========================================================================

// creating a http server for web socket
const httpsServer = https.createServer(
  {
    key,
    cert,
  },

  (req, res) => {
    res.end("I am connected");
    console.log(`httpsServer for webSocket created`);
  }
);

// making it listen to port 8000
httpsServer.listen(webSockedPort, () => {
  console.log(
    `[START SERVER] https Server for webSocket is listening on port ${webSockedPort}, start at ${new Date()}`
  );
});

// creating websocket server
const wss = new websocket.Server({ server: httpsServer });

// calling a method 'on' which is available on websocket object
wss.on("headers", (headers /* req */) => {
  // logging the header
  console.log(headers);
});

// Event: 'connection'
wss.on("connection", (ws /*  req */) => {
  //! Owieczka - Po co ta wiadomość jest wysyłana do klienta??
  /* const openJSON = { type: "This is a message from server" };
  ws.send(openJSON.type); */

  // receive the message from client on Event: 'message'
  ws.on("message", (msg) => {
    gameHandler.messageHandler(ws, msg);
    statisticHandler.messageHandler(ws, msg);
  });

  ws.on("close", (event) => {
    console.log(
      `[CLOSE SERVER] The connection has been closed successfully at ${new Date()}, with code ${event}`
    );
  });
});

// Event: 'close'
wss.on("close", (event) => {
  console.log(
    `[CLOSE SERVER] The connection has been closed successfully at ${new Date()}, with code ${event}`
  );
});
