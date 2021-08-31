// TODO blokowanie gracza gdy nie ma amunicji: przy if(target.isAlive) && playerID.ammoPoints i wtedy wysylac puste AmmoMessage czy zrobić nadifa nad całością albo po stronie klienta blokować przycisk
const fs = require("fs");
const statistic = require("./statistic");

//= ==========================================================================
// Arrays
//= ==========================================================================
// eslint-disable-next-line prefer-const
let Markers = [
  // Owieczka - List of avaiable marker identyficators, Ta zmianne raczej nie powinna być cost bo zmienia Pan w niej wartości
  ["markerID_01", false], // ID, Avaiable
  ["markerID_02", false],
  ["markerID_03", false],
  ["markerID_04", false],
  ["markerID_05", false],
  ["markerID_06", false],
  ["markerID_07", false],
  ["markerID_08", false],
  ["markerID_09", false],
  ["markerID_10", false],
];

// eslint-disable-next-line prefer-const
let AmmoKits = [
  ["AmmoKit_01", false],
  ["AmmoKit_02", false],
  ["AmmoKit_03", false],
  ["AmmoKit_04", false],
  ["AmmoKit_05", false],
];

// eslint-disable-next-line prefer-const
let Respawns = [
  ["respawn_01", false],
  ["respawn_02", false],
  ["respawn_03", false],
  ["respawn_04", false],
  ["respawn_05", false],
  ["respawn_06", false],
  ["respawn_07", false],
  ["respawn_08", false],
  ["respawn_09", false],
  ["respawn_10", false],
];

// eslint-disable-next-line prefer-const
let HpKits = [
  ["hpKit_01", false],
  ["hpKit_02", false],
  ["hpKit_03", false],
  ["hpKit_04", false],
  ["hpKit_05", false],
];

// eslint-disable-next-line prefer-const
let ActivePlayers = {}; //! Owieczka - Ta zmienna nie powinna być typu const to zmienia się jej wartość

//= ==========================================================================
// Variables
//= ==========================================================================

const maxHP = 100;
const hpKit = 50;
const maxAmmo = 110;
const ammoKit = 30;
const oneBullet = 10;
const oneDamage = 25;
const pointForHit = 1;
const timeoutToDisconnect = 15000;

let ActivePlayersValues = null;

//= ==========================================================================
// Class
//= ==========================================================================
class Player {
  constructor(
    markerID,
    nickname,
    /*  geoLocation, */
    ws,
    timeout,
    winCount = 0,
    hpPoints = 0,
    ammoPoints = 0,
    isAlive = false,
    score = [0, 0]
  ) {
    // eslint-disable-next-line no-unused-expressions
    (this.markerID = markerID), //! Owieczka - Ciekawa składnia z przecinkami
      (this.nickname = nickname),
      /*  (this.geoLocation = geoLocation), */
      (this.ws = ws),
      (this.timeout = timeout),
      (this.winCount = winCount),
      (this.hpPoints = hpPoints),
      (this.ammoPoints = ammoPoints),
      (this.isAlive = isAlive),
      (this.score = score);
  }

  revivePlayer() {
    this.hpPoints = maxHP; //! Owieczka - te trzy linijki zamknąć w funkcji revivePlayer() które będzie metodą classy player
    this.ammoPoints = maxAmmo;
    this.isAlive = true;
  }

  // to powinny byc mmetody klasy player
  updatePlayerHpPoints() {
    if (maxHP - this.hpPoints >= hpKit) {
      this.hpPoints += hpKit;
    } else {
      this.hpPoints += maxHP - this.hpPoints;
    }
  }

  updatePlayerAmmoPoints() {
    if (maxAmmo - this.ammoPoints >= ammoKit) {
      this.ammoPoints += ammoKit;
    } else {
      this.ammoPoints += maxAmmo - this.ammoPoints;
    }
  }
}

//= ==========================================================================
// functions
//= ==========================================================================

// oblicza odleglosc euklidesowa na podstawie pozycji markera i srodka canvasu
// zwraca true/false  jezeli gracz trafił/nietrafil w cel
function getEuklides(markPosX, markPosY) {
  // pozycja markera  podzielona przez wymiary kamery( 1280/960)
  const a1 = markPosX;
  const b1 = markPosY;

  // console.log(`x1: ${a1}`);
  // console.log(`y1: ${b1}`);
  // srodek ekranu  (1280/1280)/2, (960/960)/2
  // const a2 = 0.5;
  // const b2 = 0.5;

  // console.log(`x2: ${a2}`);
  // console.log(`y2: ${b2}`);

  // odleglosc euklidesowa
  // const d = Math.sqrt(Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2));
  // console.log(`Euklides = :${d}`);

  // przeciwnprostokątna canvasa
  // const c = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));

  // jezeli odleg. euklidesowa jest wieksza od  przeciwprostokatnej wyliczonej z połowy wymiarów canvasa to MissMsg
  // ustawiona ogromną odległość, zeby trafiac sprawdzac inne funkcjonalnosci programu

  /* if (d > c) {
    // console.log(`false: ${c}`);
    return false;
    // eslint-disable-next-line no-else-return
  } else {
    // console.log(`true:  ${c}`);
    return true;
  } */
  if (a1 >= 0.2 && a1 <= 0.32 && b1 >= 0.2 && b1 <= 0.325) {
    return true;
  }
  return false;
}

function relBusyPlayerId(playerArg) {
  for (let index = 0; index < Markers.length; index++) {
    if (playerArg.markerID == Markers[index][0]) {
      Markers[index][1] = false;
      break;
    }
  }
}

function relBusyHpKits() {
  for (let index = 0; index < HpKits.length; index++) {
    HpKits[index][1] = false;
  }
}

function relBusyAmmoKits() {
  for (let index = 0; index < AmmoKits.length; index++) {
    AmmoKits[index][1] = false;
  }
}

function searchForActivePlayer(playerID) {
  // let result = null; //! Owieczka - powinno być zainicjalizowano nullem, aby w przypadku gdy niema takiego playera zwrócić null

  if (ActivePlayers[playerID] !== undefined) return ActivePlayers[playerID];
  /* for (let i = 0; i < ActivePlayers.length; i++) {
    if (ActivePlayers[i].markerID == playerID) {
      result = ActivePlayers[i]; // Owieczka - a dlaczego tu nie można zrobić returna gdy znajdzie?
      break;
    }
  } */
  return null;
}

function checkForValidRespawnID(respawnID) {
  // Owieczka - konsekwentnie funkcje z małej litery - searchForActiveRespawnId - może lepszą nazwa bo powinna byc klasa Respawner (jak player) w której była by informacja o położeniu gps tengo punktu respauna
  let result = null;
  for (let index = 0; index < Respawns.length; index++) {
    if (Respawns[index][0] == respawnID) {
      result = true;
      break;
    } else {
      result = false;
    }
  }
  return result;
}

function checkForValidHpID(hpID) {
  // Owieczka - uwaga jak do respauna
  let result = null;
  for (let index = 0; index < HpKits.length; index++) {
    if (HpKits[index][0] == hpID && !HpKits[index][1]) {
      HpKits[index][1] = true;
      // eslint-disable-next-line prefer-destructuring
      result = true;
      break;
    } else {
      result = false;
    }
  }
  return result;
}

function checkForValidAmmoID(ammoPointsID) {
  // Owieczka - uwaga jak do respauna
  let result = null;
  for (let index = 0; index < AmmoKits.length; index++) {
    if (AmmoKits[index][0] == ammoPointsID && !AmmoKits[index][1]) {
      AmmoKits[index][1] = true;
      // eslint-disable-next-line prefer-destructuring
      result = true;
      break;
    } else {
      result = false;
    }
  }
  return result;
}

function checkForLockPlayerID(markerID) {
  for (let index = 0; index < Markers.length; index++) {
    if (Markers[index][0] == markerID && !Markers[index][1]) {
      return true;
    }
  }
  return false;
}

function checkForValidMarkerAndLockPlayerID(markerID) {
  // Owieczka - uwaga jak do respauna
  let result = null;
  for (let index = 0; index < Markers.length; index++) {
    if (Markers[index][0] == markerID && !Markers[index][1]) {
      Markers[index][1] = true;
      // eslint-disable-next-line prefer-destructuring
      result = true;
      break;
    } else {
      result = false;
    }
  }
  return result;
}

//= ==========================================================================
// sendSomeMessage functions
//= ==========================================================================
function sendHpMessage(playerArg) {
  const SendMessage = {
    type: "HpMessage",
    playerID: playerArg.markerID,
    hpPoints: playerArg.hpPoints,
  };
  playerArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage); //! Wysłanie informacji do obserwatorów
  console.log(`[GAME RES]`, SendMessage);
}

function sendRiviveMessage(playerArg) {
  const SendMessage = {
    type: "RiviveMessage",
    playerID: playerArg.markerID,
    isPlayerAlive: playerArg.isAlive,
  };
  playerArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage); //! Wysłanie informacji do obserwatorów
  console.log(`[GAME RES]`, SendMessage);
}
function sendAmmoMessage(playerArg, oneBulletArg) {
  // eslint-disable-next-line no-param-reassign
  playerArg.ammoPoints -= oneBulletArg;
  const SendMessage = {
    type: "AmmoMessage",
    playerID: playerArg.markerID,
    ammoPoints: playerArg.ammoPoints,
  };
  playerArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage); //! Wysłanie informacji do obserwatorów
  console.log(`[GAME RES]`, SendMessage);
}

function sendHitMessage(playerArg, targetArg) {
  const SendMessage = {
    type: "HitMessage",
    playerID: playerArg.markerID,
    targetID: targetArg.markerID, //! Owieczka - targetPlayer.marketID
    isTargetAlive: targetArg.isAlive,
  };
  targetArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage);
  console.log(`[GAME RES]`, SendMessage);

  if (!targetArg.isAlive) {
    playerArg.ws.send(JSON.stringify(SendMessage));
  }
}
function sendScoreMessage(playerArg) {
  const SendMessage = {
    type: "ScoreMessage",
    playerID: playerArg.markerID,
    score: [playerArg.score[0], playerArg.score[1]], //! Owieczka - aktualizacja stanu gracza przez konstukcją JSON'a
  };
  playerArg.ws.send(JSON.stringify(SendMessage));
  statistic.broadcastToViewers(SendMessage);
  console.log(`[GAME RES]`, SendMessage);
}

function sendMissMessageForTarget(playerArg, targetArg) {
  const SendMessage = {
    type: "MissMessageForTarget",
    playerID: playerArg.nickname,
    targetID: targetArg.markerID,
  };
  targetArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage);
  console.log(`[GAME RES]`, SendMessage);
}

function sendCounterMessage(playerArg, targetArg) {
  let index = 5;
  const interval = setInterval(() => {
    const SendMessage = {
      type: "CounterMessage",
      playerID: playerArg.markerID,
      targetID: targetArg.markerID, //! Owieczka - targetPlayer.marketID
      counter: index,
    };

    playerArg.ws.send(JSON.stringify(SendMessage));
    targetArg.ws.send(JSON.stringify(SendMessage));
    console.log(`[GAME RES]`, SendMessage);
    index -= 1;
    if (index == -1) {
      clearInterval(interval);
    }
  }, 1000);
}

function sendEndDuelMessage(playerArg, targetArg) {
  const SendMessage = {
    type: "EndDuelMessage",
    playerID: playerArg.markerID,
    targetID: targetArg.markerID,
    playerNickname: playerArg.nickname,
    targetNickname: targetArg.nickname,
  };
  playerArg.ws.send(JSON.stringify(SendMessage));
  targetArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage);
}

function sendSurrenderMessage(playerArg) {
  const SendMessage = {
    type: "SurrenderMessage",
    playerID: playerArg.markerID,
    playerNickname: playerArg.nickname,
  };
  ActivePlayersValues = Object.values(ActivePlayers);
  for (let index = 0; index < ActivePlayersValues.length; index++) {
    ActivePlayersValues[index].ws.send(JSON.stringify(SendMessage));
  }
}

function sendEndRoundMessage(playerArg) {
  const SendMessage = {
    type: "EndRoundMessage",
    playerID: playerArg.markerID,
    isTargetAlive: playerArg.isAlive,
  };
  playerArg.ws.send(JSON.stringify(SendMessage));
  // statistic.broadcastToViewers(SendMessage);
  console.log(`[GAME RES]`, SendMessage);
}

//= ==========================================================================
// disconnectForTimeout
//= ==========================================================================
function disconnectForTimeout(playerArg) {
  console.log(`[INFO] ${playerArg.markerID} Disconnect For Timeout`);
  // DONE close connection and inform user
  clearTimeout(playerArg.timeout);
  relBusyPlayerId(playerArg);
  delete ActivePlayers[playerArg.markerID];

  // console.log(Markers);
}

//= ==========================================================================
// RespawnMessageHandler
//= ==========================================================================
function RespawnMessageHandler(ws, recivedMsgJSON) {
  //  console.log(recivedMsgJSON);
  let player = null;

  //! sprawdza czy znacznik, ktory przyszedł czy istnieje w tablicy Markers oraz czy jest wolny ? blokuj i zwróć true : zwróć false
  const lockPlayerId = checkForValidMarkerAndLockPlayerID(
    recivedMsgJSON.playerID
  );

  // podlaczenie nowego uzytkownika
  if (lockPlayerId) {
    player = new Player(
      recivedMsgJSON.playerID,
      recivedMsgJSON.nickname, //! Owieczka - skoro to jest ustawiane na zero zawsze to po co przekazywac do w parametrze?
      /*  recivedMsgJSON.gpsLocation, */ ws //! Owieczka - Dodać uchwyt do klasy komunikacji,
    );

    player.timeout = setTimeout(
      disconnectForTimeout,
      timeoutToDisconnect,
      player
    );

    ActivePlayers[recivedMsgJSON.playerID] = player;
    console.log(`[INFO] Player ${player.markerID} added to ActivePlayers`);
  } else {
    player = searchForActivePlayer(recivedMsgJSON.playerID); //! sprawdz w tablicy active player kto ma ten markerid i return go
    // DONE return data to player
    if (player) player.ws = ws;
    console.log(`[INFO] Player ${player.markerID} found in ActivePlayers`);
    // console.log(player);
  }
  /* } else {
    console.log(`[GAME INFO] marker is busy!`);
  } */

  if (player) {
    // Owieczka - If the player is no the active player list process message further
    //! Owieczka - Powinno być w stylu
    // let respawnObject = searchForActiveRespawn(recivedMsgJSON.targetID); // Owieczka - sprawdzenie czy ID jest ustawiony na serwerze jako respawn point
    //! if(respawnObject) { //Owieczka - jeśli znaleziono respawn point

    const respawnObject = checkForValidRespawnID(recivedMsgJSON.targetID); // Owieczka - sprawdzenie czy ID jest ustawiony na serwerze jako respawn point

    if (respawnObject) {
      if (!player.isAlive) {
        player.revivePlayer();

        sendRiviveMessage(player);
        sendHpMessage(player);
        sendAmmoMessage(player, oneBullet);

        ActivePlayersValues = Object.values(ActivePlayers);
        // ! jak cię naprawić? a zabiłem sobie gracza co wygrał po tym jak wygrał
        if (
          ActivePlayersValues.length == 2 &&
          ActivePlayersValues[0].isAlive &&
          ActivePlayersValues[1].isAlive
        ) {
          relBusyHpKits();
          relBusyAmmoKits();

          sendCounterMessage(ActivePlayersValues[0], ActivePlayersValues[1]);
        }
      } else {
        console.log(`[GAME INFO] user back from Cookie!!`);
        /*  player.revivePlayer(); */

        // sendRiviveMessage(player);
        sendHpMessage(player);
        sendAmmoMessage(player, 0);
        sendScoreMessage(player);
      }
    } else {
      console.log(`[GAME ERROR] undefind marker ${recivedMsgJSON.targetID}`);
    }
  } else {
    console.log(`[GAME ERROR] undefind user or all markers are busy`);
    // TODO poinformuj ze nie ma takiego gracza
  }
}

//= ==========================================================================
// ShootMessageHandler
//= ==========================================================================
function ShootMessageHandler(ws, recivedMsgJSON) {
  const checkHit = getEuklides(
    recivedMsgJSON.markerPosition[0],
    recivedMsgJSON.markerPosition[1]
    // recivedMsgJSON.resolutionX,
    // recivedMsgJSON.resolutionY
  );
  /* const playerID = searchForActivePlayer(recivedMsgJSON.playerID);
      // Owieczka - przesunąc do funkcji ShootMessageHandler
      // CheckIfTargetIdIsValid();
      // CheckIfTargetIdIsValidHpId();
      // console.log(checkForValidHpID(recivedMsgJSON.targetID));
      /*  switch (recivedMsgJSON.targetID) { */
  /*  case checkForValidHpID(recivedMsgJSON.targetID): { */

  // player = searchForActivePlayer(recivedMsgJSON.playerID); // Owieczka - sprawdz w tablicy active player kto ma ten markerid i return go
  // if(player) {

  /* Owieczka
      let hpKitObject = seachForHpKit(recivedMsgJSON.targetID); //Owieczka - sprawdzić czy na liście jest apteczka o tym IDku, jeśli nie ma to idziemy dalej, jeśli znaleźliśmy to przetwarzamy
      if(hpKitObject) {  //
      // */

  const playerID = searchForActivePlayer(recivedMsgJSON.playerID);
  //! Owieczka - przesunąc do funkcji ShootMessageHandler
  // CheckIfTargetIdIsValid();
  // CheckIfTargetIdIsValidHpId();
  // console.log(checkForValidHpID(recivedMsgJSON.targetID));
  /*  switch (recivedMsgJSON.targetID) { */
  /*  case checkForValidHpID(recivedMsgJSON.targetID): { */

  // player = searchForActivePlayer(recivedMsgJSON.playerID); // Owieczka - sprawdz w tablicy active player kto ma ten markerid i return go
  // if(player) {

  /* Owieczka
    let hpKitObject = seachForHpKit(recivedMsgJSON.targetID); //Owieczka - sprawdzić czy na liście jest apteczka o tym IDku, jeśli nie ma to idziemy dalej, jeśli znaleźliśmy to przetwarzamy
    if(hpKitObject) {  //
    // */

  //* ==========================
  //* ShootMessage -> HpMessage
  //* ==========================
  const hpKitObject = checkForValidHpID(recivedMsgJSON.targetID);
  if (hpKitObject) {
    playerID.updatePlayerHpPoints();
    sendHpMessage(playerID);
  }

  //* ==========================
  //* ShootMessage -> AmmoMessage
  //* ==========================
  const ammoObject = checkForValidAmmoID(recivedMsgJSON.targetID);
  if (ammoObject) {
    playerID.updatePlayerAmmoPoints();
    if (playerID.ammoPoints) sendAmmoMessage(playerID, oneBullet);
  }

  // Owieczka
  // targetPlayer = searchForActivePlayer(recivedMsgJSON.playerID); // Owieczka - sprawdz w tablicy active player kto ma ten markerid i zwróć go jako cel go
  // if(targetPlayer) {
  //! zrobione

  //* ==========================
  //* ShootMessage -> HitMessage | HpMessage | ScoreMessage | AmmoMessage
  //* ==========================
  const targetPlayer = searchForActivePlayer(recivedMsgJSON.targetID); //! Owieczka - sprawdz w tablicy active player kto ma ten markerid i zwróć go jako cel go
  // console.log(`[LOG] targetPlayer `, targetPlayer);
  if (targetPlayer && targetPlayer.markerID != playerID.markerID) {
    //! Owieczka trzeba sprawdzić czy po zmniejszeniu życia gracza target nadal on żyje czyli targetPlayer.isAlive

    // Owieczka - zamiast tej linijki to co wyzej
    // markerID - marker gracza 2
    if (targetPlayer.isAlive && playerID.ammoPoints) {
      // if(targetPlayer.isAlive) //! Owieczka - Jeśli użytkownik do którego strzelamy jest żywy
      // ! if( return target z ActivePlayers co by mozna bylo zobaczyc czy trafiony sobie zyje)
      // target player musi byc zywy!!!!
      if (checkHit) {
        //! Owieczka tą wiadomośc wysyłamy do targetPlayer'a
        if (targetPlayer.hpPoints) targetPlayer.hpPoints -= oneDamage;
        sendHpMessage(targetPlayer);

        if (targetPlayer.hpPoints <= 0) {
          targetPlayer.isAlive = !targetPlayer.isAlive;
          playerID.winCount += 1;
          if (playerID.winCount != 2) {
            sendEndRoundMessage(playerID);
            sendEndRoundMessage(targetPlayer);
          }
          playerID.isAlive = !playerID.isAlive;
        }

        sendHitMessage(playerID, targetPlayer);

        // ? to player who shooted
        playerID.score[0] += pointForHit;
        sendScoreMessage(playerID);

        if (playerID.ammoPoints) sendAmmoMessage(playerID, oneBullet);

        // end game
        if (playerID.winCount == 2) sendEndDuelMessage(playerID, targetPlayer);
      } else {
        //* ==========================
        //* ShootMessage -> ScoreMessage | AmmoMessage | MissMessageForTarget
        //* ==========================
        //! Owieczka - trzeba jeszcze wysłać wiadomość do targetPlayera o tym że ktoś w niego strzelał ale nie trafił

        sendMissMessageForTarget(playerID, targetPlayer);

        // ? to player who shooted
        playerID.score[1] += pointForHit;
        sendScoreMessage(playerID);

        if (playerID.ammoPoints) sendAmmoMessage(playerID, oneBullet);
      }
    } else {
      //* ==========================
      //* ShootMessage -> AmmoMessage
      //* ==========================
      // eslint-disable-next-line no-lonely-if
      if (playerID.ammoPoints) sendAmmoMessage(playerID, oneBullet);
    }
  }
}

//= ==========================================================================
// messageHandler
//= ==========================================================================
module.exports.messageHandler = (ws, msg) => {
  //! Owieczka - parse powinno być zamkniętne w try catch aby wychwycić błędy parsowania JSON'a
  let recivedMsgJSON = null;
  try {
    recivedMsgJSON = JSON.parse(msg);
  } catch (error) {
    console.error(error);
  }

  switch (recivedMsgJSON.type) {
    case "RespawnMessage": {
      console.log(`[SERVER REQ]`, recivedMsgJSON);
      //! Owieczka - przesunąć do funkcji RespawnMessageHandler
      RespawnMessageHandler(ws, recivedMsgJSON);
      break;
    }
    case "ShootMessage": {
      console.log(`[SERVER REQ]`, recivedMsgJSON);
      ShootMessageHandler(ws, recivedMsgJSON);
      break;
    }
    case "RestartMessage": {
      console.log(`[SERVER REQ]`, recivedMsgJSON);
      const playerID = searchForActivePlayer(recivedMsgJSON.playerID);

      if (playerID) {
        playerID.winCount = 0;
        playerID.score = [0, 0];
        playerID.revivePlayer();
        sendRiviveMessage(playerID);
        sendAmmoMessage(playerID, oneBullet);
        sendHpMessage(playerID);
        sendScoreMessage(playerID);
      }

      ActivePlayersValues = Object.values(ActivePlayers);
      if (
        ActivePlayersValues.length == 2 &&
        ActivePlayersValues[0].isAlive &&
        ActivePlayersValues[1].isAlive
      ) {
        relBusyHpKits();
        relBusyAmmoKits();
        sendCounterMessage(ActivePlayersValues[0], ActivePlayersValues[1]);
      }
      break;
    }
    case "RageQuitMessage": {
      console.log(`[SERVER REQ]`, recivedMsgJSON);
      const playerID = searchForActivePlayer(recivedMsgJSON.playerID);
      ActivePlayersValues = Object.values(ActivePlayers);
      sendSurrenderMessage(playerID);
      relBusyHpKits();
      relBusyAmmoKits();
      if (playerID) {
        clearTimeout(playerID.timeout);
        for (let index = 0; index < ActivePlayersValues.length; index++) {
          relBusyPlayerId(ActivePlayersValues[index]);
        }
      }
      ActivePlayers = {}; /*  ActivePlayers.filter((value) => {
        return value !== playerID;
      }); */

      console.log(`[GAME INFO]`, Markers);
      console.log(`=============`);
      console.log(`[GAME INFO]`, ActivePlayers);

      break;
    }
    case "ScanMessage": {
      console.log(`[SERVER REQ]`, recivedMsgJSON);
      const markerIsLocked = checkForLockPlayerID(recivedMsgJSON.scanResult);

      const SendMessage = {
        type: "ScanMessageResult",
        scanResult: markerIsLocked,
      };

      console.log(`[GAME RES]`, SendMessage);
      ws.send(JSON.stringify(SendMessage));
      break;
    }
    case "TimeoutMessage": {
      const playerID = searchForActivePlayer(recivedMsgJSON.playerID);

      if (playerID) {
        console.log(`[INFO] ${playerID.markerID} refresh Timeout Interval`);
        clearTimeout(playerID.timeout);

        playerID.timeout = setTimeout(
          disconnectForTimeout,
          timeoutToDisconnect,
          playerID
        );
      }
      break;
    }
    case "UserInteractionTime": {
      console.log(`[SERVER REQ]`, recivedMsgJSON);
      console.log(`[INFO] Collect Data`);

      fs.appendFile(
        "timeIntervals.txt",
        `${recivedMsgJSON.interactionTime.toString()}\n`,
        (err) => {
          if (err) return console.log(err);
        }
      );
      break;
    }
    default:
      console.log(
        `[GAME] Sorry, we are out of ${JSON.stringify(recivedMsgJSON.type)}.`
      );
      break;
  }
};
