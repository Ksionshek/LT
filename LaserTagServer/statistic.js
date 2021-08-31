require("./game");

//= ==========================================================================
// Variables
//= ==========================================================================
let spectator = null;
let ActiveSpectatorsValues = null;
const timeoutToDisconnect = 15000;

//= ==========================================================================
// Arrays
//= ==========================================================================
const Spectators = [
  ["spectatorID_01", false], // ID, Avaiable
  ["spectatorID_02", false],
  ["spectatorID_03", false],
  ["spectatorID_04", false],
  ["spectatorID_05", false],
  ["spectatorID_06", false],
  ["spectatorID_07", false],
  ["spectatorID_08", false],
  ["spectatorID_09", false],
  ["spectatorID_10", false],
];

const ActiveSpectators = {};

//= ==========================================================================
// Class
//= ==========================================================================
const Spectator = class Spectator {
  constructor(spectatorID, ws, timeout) {
    (this.spectatorID = spectatorID), (this.ws = ws), (this.timeout = timeout);
  }
};

function searchForActiveSpectators(spectatorID) {
  if (ActiveSpectators[spectatorID] !== undefined)
    return ActiveSpectators[spectatorID];

  return null;
}

function getFreeSpectatorId() {
  // Owieczka - a nie lepiej getFreePlayerId()
  let freeId = null;
  for (let index = 0; index < Spectators.length; index++) {
    if (!Spectators[index][1]) {
      Spectators[index][1] = true;
      // eslint-disable-next-line prefer-destructuring
      freeId = Spectators[index][0]; // Owieczka - a dlaczego tu nie można zrobić returna>>
      break;
    }
  }
  // co bedzie jak wejdzie 11 gracz?
  return freeId;
}

function relBusySpectatorId(spectatorArg) {
  for (let index = 0; index < Spectators.length; index++) {
    if (spectatorArg.spectatorID == Spectators[index][0]) {
      Spectators[index][1] = false;
      break;
    }
  }
}

//= ==========================================================================
// disconnectForTimeout
//= ==========================================================================
function disconnectForTimeout(spectatorArg) {
  console.log(`[INFO] ${spectatorArg.spectatorID} Disconnect For Timeout`);
  // DONE close connection and inform user
  clearTimeout(spectatorArg.timeout);
  relBusySpectatorId(spectatorArg);
  delete ActiveSpectators[spectatorArg.spectatorID];

  // console.log(Spectators);
}

// TODO wyslij ActivePlayers dla usera co dołączył w trakcie meczu

module.exports.broadcastToViewers = (toSpectator) => {
  ActiveSpectatorsValues = Object.values(ActiveSpectators);
  for (let index = 0; index < ActiveSpectatorsValues.length; index++) {
    ActiveSpectatorsValues[index].ws.send(JSON.stringify(toSpectator));
    console.log(`[SPECTATOR RES]`, toSpectator);
  }
};

function NewSpectatorMessageHandler(ws, recivedMsgJSON) {
  //  console.log(recivedMsgJSON);
  if (recivedMsgJSON.spectatorID == "") {
    // podlaczenie nowego uzytkownika
    const spectatorFreeID = getFreeSpectatorId();
    if (spectatorFreeID) {
      spectator = new Spectator(spectatorFreeID, ws);

      spectator.timeout = setTimeout(
        disconnectForTimeout,
        timeoutToDisconnect,
        spectator
      );
      ActiveSpectators[spectator.spectatorID] = spectator;
      // console.log(spectator);
    } else {
      console.log(`[ERROR] all slots are busy!!`);
    }
  } else {
    spectator = searchForActiveSpectators(recivedMsgJSON.spectatorID); //! sprawdz w tablicy active player kto ma ten markerid i return go
    if (spectator) spectator.ws = ws;
  }

  if (spectator) {
    const SendMessage = {
      type: "SpectatorRiviveMessage",
      spectatorID: spectator.spectatorID,
    };
    spectator.ws.send(JSON.stringify(SendMessage));
    console.log(`[SPECTATOR RES]`, SendMessage);
  } else {
    console.log(`[ERROR] problem with spectator!!`);
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
    console.log(`[SPECTATOR REQ]`, recivedMsgJSON);
  } catch (error) {
    console.error(error);
  }
  // const responseMsgJSON = { type: "Empty response, someting went wrong" };

  switch (recivedMsgJSON.type) {
    case "CreateNewSpectator": {
      NewSpectatorMessageHandler(ws, recivedMsgJSON);
      break;
    }
    case "TimeoutSpectatorMessage": {
      const spectatorID = searchForActiveSpectators(recivedMsgJSON.spectatorID);

      if (spectatorID) {
        console.log(
          `[SPECTATOR INFO] ${spectatorID.spectatorID} refresh Timeout Interval`
        );
        clearTimeout(spectatorID.timeout);

        spectatorID.timeout = setTimeout(
          disconnectForTimeout,
          timeoutToDisconnect,
          spectatorID
        );
      }
      break;
    }
    default:
      console.log(
        `[SPECTATOR] Sorry, we are out of ${JSON.stringify(
          recivedMsgJSON.type
        )}.`
      );
      break;
  }
};
