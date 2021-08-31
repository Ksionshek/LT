let ws; // zmienna websocket
let spectator = "";
let count = 0;
const PlayersInCurrentGame = [];
const serverLocalIp = `192.168.50.100`;
const timeoutToDisconnect = 10000;
//= ==========================================================================
// TimeoutMessage
//= ==========================================================================
function TimeoutSpectatorMessage() {
  if (spectator) {
    const SendMessage = {
      type: "TimeoutSpectatorMessage",
      spectatorID: spectator,
    };
    ws.send(JSON.stringify(SendMessage));

    // lastInteractionTime = new Date().getTime(); // ? Dla tego też mierzyć
    console.log(SendMessage);
  }
}
//= ===========================================================================
// Cookie Monster OM OM OM
//= ===========================================================================
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000); // TODO change to minutes
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie(cname) {
  let user = getCookie(cname);
  if (user != "") {
    window.alert(`Welcome again ${user}`);
  } /*  else {
    user = window.prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);
    }
  } */
}

function deleteCookie(cname) {
  const expires = `expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  document.cookie = `${cname}=;${expires};path=/`;
  checkCookie(cname);
}

function checkPlayerInTable(recivedMsg) {
  for (let i = 0; i < PlayersInCurrentGame.length; i++) {
    if (PlayersInCurrentGame[i].playerID == recivedMsg.playerID) {
      return true;
    }
  }
  return false;
}
function updateEmptyTable(recivedMsg) {
  for (let i = 1; i <= PlayersInCurrentGame.length; i++) {
    let rowPlayerID = document.getElementById("player" + i + "");
    if (rowPlayerID.style.visibility == "hidden") {
      let cellPlayerID1 = document.getElementsByClassName(
        "divTableCell" + i + ""
      )[0];
      let cellPlayerID2 = document.getElementsByClassName(
        "divTableCell" + i + ""
      )[1];
      let cellPlayerID3 = document.getElementsByClassName(
        "divTableCell" + i + ""
      )[2];

      cellPlayerID1.innerHTML = `${recivedMsg.playerID}`;
      cellPlayerID2.innerHTML = `${recivedMsg.score[0]}`;
      cellPlayerID3.innerHTML = `${recivedMsg.score[1]}`;
      rowPlayerID.style.visibility = "visible";
      console.log(rowPlayerID);
      break;
    }
  }
  console.log("Table update");
}

function updateTable(recivedMsg) {
  for (let i = 1; i <= PlayersInCurrentGame.length; i++) {
    let cellPlayerID1 = document.getElementsByClassName(
      "divTableCell" + i + ""
    )[0];

    if (cellPlayerID1.textContent == recivedMsg.playerID) {
      let cellPlayerID2 = document.getElementsByClassName(
        "divTableCell" + i + ""
      )[1];
      let cellPlayerID3 = document.getElementsByClassName(
        "divTableCell" + i + ""
      )[2];

      cellPlayerID1.innerHTML = `${recivedMsg.playerID}`;
      cellPlayerID2.innerHTML = `${recivedMsg.score[0]}`;
      cellPlayerID3.innerHTML = `${recivedMsg.score[1]}`;
      break;
    }
  }
}

function checkHowManyPlayer() {
  for (let i = 10; i > PlayersInCurrentGame.length; i--) {
    console.log("player" + i + "");
    let rowPlayerID = document.getElementById("player" + i + "");
    rowPlayerID.style.visibility = "hidden";
  }
}
function onLoad() {
  ws = new WebSocket(`wss://${serverLocalIp}:8000`);
  // logging the websocket property properties
  console.log(PlayersInCurrentGame.length);
  console.log(ws);
  setInterval(TimeoutSpectatorMessage, timeoutToDisconnect);
  ws.onopen = (event) => {
    // spectator = getCookie("spectatorCookieID");
    const SendMessage = {
      type: "CreateNewSpectator",
      spectatorID: spectator,
    };
    console.log(SendMessage.type);
    ws.send(JSON.stringify(SendMessage));
    if (!count) {
      checkHowManyPlayer();
      count++;
    }
  };

  ws.onmessage = (message) => {
    messageHandler(ws, message);
  };
  ws.onclose = (event) => {
    deleteCookie("spectatorCookieID");
    window.alert(`${event.code}`);
  };
}

window.addEventListener("load", onLoad(), false);

function messageHandler(ws, message) {
  const recivedMsg = JSON.parse(message.data);
  //console.log("msg handler dziala!");
  console.log(recivedMsg);

  switch (recivedMsg.type) {
    case "SpectatorRiviveMessage": {
      //! Owieczka - trzeba sprawdzić czy serwer nas ozywył czyli czy recivedMsg.isAlive ==true

      spectator = recivedMsg.spectatorID;
      setCookie("spectatorCookieID", spectator, 1);

      window.alert(spectator);
      break;
    }
    case "ScoreMessage": {
      if (!checkPlayerInTable(recivedMsg)) {
        //addPlayerToTable(recivedMsg);
        PlayersInCurrentGame.push(recivedMsg);
        console.log("Hello new Player");
        updateEmptyTable(recivedMsg);
      } else {
        updateTable(recivedMsg);
      }
      console.log("PLAYER AFTER ALL");
      for (let i = 0; i < PlayersInCurrentGame.length; i++) {
        console.log(PlayersInCurrentGame[i].playerID);
      }
      break;
    }
    default: {
      console.log(`[ERROR] undefind recived message ${recivedMsg.type}`);
      break;
    }
  }
}
