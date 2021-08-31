//= ===========================================================================
// Variables
//= ===========================================================================
let ws; // zmienna websocket
let player = "";
let playerNickname = "";
let currentPlayerPosition = [1, 1];
let watchID = null;
let meshHit;
const serverLocalIp = `192.168.50.61`;
const endInfoScreen = document.createElement("section");
const timeoutToDisconnect = 10000;
let lastInteractionTime = null;

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

//= ==========================================================================
// TimeoutMessage
//= ==========================================================================
function TimeoutMessage() {
  /*   //  DONE obsłużyć to closeConnection()
  const screenApp = document.getElementById("screenApp");
  const fireBtn = document.getElementById("buttonFire");
  const template = `
        <div class="endPromt" id="winnerOrloser">AFK KICK</div>
        <div class="msgMarker" id="kickedMsg">You have been kicked for being inactive</div>
        <div id="groupButton">
        <button class="goMenu" id="timeOutBtn"><span id="centerText">BACK</span></button>
        </div>
      `;
  fireBtn.disabled = true;
  endInfoScreen.innerHTML = template;
  screenApp.appendChild(endInfoScreen);
  timeOutBtn.onclick = closeConnection; */
  if (player) {
    const SendMessage = {
      type: "TimeoutMessage",
      playerID: player,
    };
    ws.send(JSON.stringify(SendMessage));

    // lastInteractionTime = new Date().getTime(); // ? Dla tego też mierzyć
    console.log(SendMessage);
  }
}

//= ==========================================================================
// sendUserInteractionTime
//= ==========================================================================
function sendUserInteractionTime() {
  console.log(`sendUserInteractionTime`);

  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastInteractionTime;
  const SendMessage = {
    type: "UserInteractionTime",
    interactionTime: timeDiff,
  };
  // const timeDiff = currentTime - playerArg.lastInteractionTime;
  ws.send(JSON.stringify(SendMessage));
  console.log(SendMessage);
}

//= ===========================================================================
// playSound
//= ===========================================================================
function playSound(url) {
  new Audio(url).play();
}

function closeConnection() {
  ws.close(); // close ws connection after user RageQuitMessage
  window.location.href = `https://${serverLocalIp}:3000/portal`;
}

function removeEntity(object) {
  scene.remove(object);
}

//= ===========================================================================
// goToMenu
//= ===========================================================================
function goToMenu() {
  // na ten moment przekieruj nas do gry. Potem bedzie zwolniac markerID i usuwac gracza z ActivePlayers i przekierowywac do menu glownego
  const SendMessage = {
    type: "RageQuitMessage",
    playerID: player,
  };
  lastInteractionTime = new Date().getTime();
  ws.send(JSON.stringify(SendMessage));
  console.log(SendMessage);
}

//= ===========================================================================
// goRespawn
//= ===========================================================================
function goRespawn() {
  // rozpoczni rewanz po przez zresetowanie rozgrywki. Ustaw na nowy ammo i zycie, usun divy oznajmiające o wygranej/przegranej z poprzedniej gry
  const SendMessage = {
    type: "RespawnMessage",
    playerID: player,
    targetID: "respawn_01",
  };

  // po resecie przywroc buttona, usun promta i odbluruj ekran

  //  document.getElementById("buttonFire").disabled = true;
  const screenApp = document.getElementById("screenApp");

  document.getElementById("buttonFire").style.opacity = "0.9";
  document.getElementById("buttonFire").innerHTML = "FIRE";
  document.getElementById("buttonFire").style.color = "initial";
  // screenApp.style.filter = "grayscale(0)";

  screenApp.removeChild(endInfoScreen);

  lastInteractionTime = new Date().getTime();
  ws.send(JSON.stringify(SendMessage));
  console.log(SendMessage);
  if (plane != null) {
    removeEntity(plane);
  }
  removeHitPlanes();
}

//= ===========================================================================
// goRewanz
//= ===========================================================================
function goRewanz() {
  const SendMessage = {
    type: "RestartMessage",
    playerID: player,
    targetID: "respawn_01",
  };

  const screenApp = document.getElementById("screenApp");

  document.getElementById("buttonFire").style.opacity = "0.9";
  document.getElementById("buttonFire").innerHTML = "FIRE";
  document.getElementById("buttonFire").style.color = "initial";

  screenApp.removeChild(endInfoScreen);

  lastInteractionTime = new Date().getTime();
  ws.send(JSON.stringify(SendMessage));
  console.log(SendMessage);
  if (plane != null) {
    // removeEntity(planeHit);
    removeEntity(plane);
  }
  removeHitPlanes();
}
//= ===========================================================================
// removeHitPlanes
//= ===========================================================================
function removeHitPlanes() {
  for (let i = planeHit.children.length - 1; i >= 0; i--) {
    console.log(planeHit.children.length);
    planeHit.remove(planeHit.children[i]);
  }
  scene.remove(planeHit);
}
//= ===========================================================================
// displayInfoAfterDuel
//= ===========================================================================
function displayInfoAfterDuel(result) {
  const fireBtn = document.getElementById("buttonFire");
  const screenApp = document.getElementById("screenApp");
  fireBtn.disabled = true;

  if (result) {
    document.getElementById("gpsPosition").innerHTML = "Well played!";
    const template = `
    <div class="endPromt" id="winnerOrloser">Victory</div>
    <div id="groupButton">
    <button class="goMenu" id="surrenderBtn"><span id="centerText">Surrender</span></button>
    <button class="goMenu" id="nextRoundBtn"><span id="centerText">Next\nRound</span></button>
    </div>
  `;
    endInfoScreen.innerHTML = template;

    screenApp.appendChild(endInfoScreen);
    const surrenderBtn = document.getElementById("surrenderBtn");
    const nextRoundBtn = document.getElementById("nextRoundBtn");
    surrenderBtn.onclick = goToMenu;
    nextRoundBtn.onclick = goRespawn;
  } else {
    document.getElementById("gpsPosition").innerHTML = "Good luck next time!";
    const template = `
    <div class="endPromt" id="winnerOrloser">Defeat</div>
    <div id="groupButton">
    <button class="goMenu" id="surrenderBtn"><span id="centerText">Surrender</span></button>
    <button class="goMenu" id="nextRoundBtn"><span id="centerText">Next\nRound</span></button>
    </div>
  `;
    endInfoScreen.innerHTML = template;

    screenApp.appendChild(endInfoScreen);
    const surrenderBtn = document.getElementById("surrenderBtn");
    const nextRoundBtn = document.getElementById("nextRoundBtn");
    surrenderBtn.onclick = goToMenu;
    nextRoundBtn.onclick = goRespawn;
  }
}

//= ===========================================================================
// displayInfoEndDuel
//= ===========================================================================
function displayInfoEndDuel(winner, loser) {
  document.getElementById("gpsPosition").innerHTML = "Good game!";
  const screenApp = document.getElementById("screenApp");
  const template = `
    <div class="endPromt" id="winnerOrloser">${winner} won</div>
    <div id="groupButton">
    <button class="goMenu" id="surrenderBtn"><span id="centerText">Surrender</span></button>
    <button class="goMenu" id="nextRoundBtn"><span id="centerText">Next\nGame</span></button>
    </div>
  `;
  endInfoScreen.innerHTML = template;

  screenApp.appendChild(endInfoScreen);
  const surrenderBtn = document.getElementById("surrenderBtn");
  const nextRoundBtn = document.getElementById("nextRoundBtn");
  surrenderBtn.onclick = goToMenu;
  nextRoundBtn.onclick = goRewanz;

  const fireBtn = document.getElementById("buttonFire");

  fireBtn.disabled = true;
  fireBtn.style.opacity = "0.65";
  fireBtn.innerHTML = "END";
  fireBtn.style.color = "rgb(0x45,0xa2, 0x9e)";

  screenApp.appendChild(endInfoScreen);
}

//= ===========================================================================
// displayInfoSurrender
//= ===========================================================================
function displayInfoSurrender(loser) {
  document.getElementById("gpsPosition").innerHTML = "Surrender!";
  const screenApp = document.getElementById("screenApp");
  const template = `
    <div class="endPromt" id="winnerOrloser">${loser}'s given up the match</div>
    <div id="groupButton">
    <span id="surrenderBtn2">
    <button class="goMenu" id="surrenderBtn"><span id="centerText">Back to main\npage</span></button></span>
    </div>
  `;
  endInfoScreen.innerHTML = template;
  screenApp.appendChild(endInfoScreen);
  const fireBtn = document.getElementById("buttonFire");

  fireBtn.disabled = true;

  fireBtn.style.opacity = "0.15";
  fireBtn.innerHTML = "GG";
  fireBtn.style.color = "rgb(0x45,0xa2, 0x9e)";
  const surrenderBtn = document.getElementById("surrenderBtn");

  surrenderBtn.onclick = closeConnection;

  // setTimeout(closeConnection(), 60000); // wait 2s and close connection
}

//= ===========================================================================
// fireAnimation
//= ===========================================================================
// funkcja odpowiada za wyswietlanie pocisku na ekranie podczas oddawania strzalu
function fireAnimation() {
  const bullet_texture = new THREE.TextureLoader().load(
    "/game/img/eksplozja3.png"
  );
  const bullet = new THREE.Mesh(
    new THREE.CubeGeometry(0.1, 0.1, 5.0),
    new THREE.MeshBasicMaterial({
      opacity: 1.0,
      map: bullet_texture,
      transparent: true,
    })
  );

  bullet.position.set(1.0, -0.5, 0.25);

  // pocisk leci od prawego dolnego rogu do srodka ekranu
  bullet.velocity = new THREE.Vector3(
    Math.sin(camera.rotation.y),
    0,
    -Math.cos(camera.rotation.y)
  );

  bullet.alive = true;
  setTimeout(function () {
    bullet.alive = false;
    scene.remove(bullet);
  }, 1100);
  bullets.push(bullet);
  scene.add(bullet);
}

//= ===========================================================================
// fnMarker functions
//= ===========================================================================
let target = null;
function fnMarker() {
  target = "markerID_01";
}
function fnMarker2() {
  target = "markerID_02";
}
function fnMarker3() {
  target = "markerID_03";
}
function fnMarker4() {
  target = "markerID_04";
}
function fnMarker5() {
  target = "markerID_05";
}
function fnMarker6() {
  target = "markerID_06";
}
function fnMarker7() {
  target = "markerID_07";
}
function fnMarker8() {
  target = "markerID_08";
}
function fnMarker9() {
  target = "markerID_09";
}
function fnMarker10() {
  target = "markerID_10";
}

function fnRes() {
  target = "respawn_02";
}
function fnAmmo() {
  target = "AmmoKit_02";
}
function fnAmmo2() {
  target = "AmmoKit_01";
}

function fnHP() {
  target = "hpKit_02";
}
function fnHP2() {
  target = "hpKit_01";
}
//= ===========================================================================
// deadAnimation
//= ===========================================================================
function deadAnimation() {
  const geometryPlane = new THREE.PlaneBufferGeometry(
    window.innerWidth,
    window.innerHeight,
    1
  );
  const materialPlane = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.35,
  });
  plane = new THREE.Mesh(geometryPlane, materialPlane);
  scene.add(plane);
}
//= ===========================================================================
// hitAnimation
//= ===========================================================================
function hitAnimation() {
  const geometryPlane = new THREE.PlaneBufferGeometry(50, 50, 1);
  const hitText = new THREE.TextureLoader().load("/game/img/hitAnimation.png");
  const materialPlane = new THREE.MeshBasicMaterial({
    map: hitText,
    transparent: true,
    opacity: 1.0,
  });
  meshHit = new THREE.Mesh(geometryPlane, materialPlane);
}

//= ===========================================================================
// fireShoot
//= ===========================================================================
function fireShoot() {
  fireAnimation();
  console.log(`Marker pos: ${markerPos}`);

  if (player) {
    // window.alert(target);
    const SendMessage = {
      type: "ShootMessage",
      // eslint-disable-next-line object-shorthand
      playerID: player,
      targetID: target, // tu musi byc funkcja robiaca return rodzaju markera
      /*   gpsLocation: currentPlayerPosition, */
      markerPosition: [markerPos[0] / 1280, markerPos[1] / 960], // pozycja markera na ekranie
    };
    switch (SendMessage.targetID) {
      case "hpKit_02": {
        playSound("/game/data/apteczka.mp3");
        document.getElementById("gpsPosition").innerHTML = "Restored HP";
        break;
      }
      case "AmmoKit_02": {
        playSound("/game/data/reload.mp3");
        document.getElementById("gpsPosition").innerHTML = "Restored Ammo";
        break;
      }
      default: {
        playSound("/game/data/fire.mp3");
        break;
      }
    }
    target = null;
    lastInteractionTime = new Date().getTime();
    ws.send(JSON.stringify(SendMessage));
    console.log(SendMessage);
  }

  markerControls1.removeEventListener("markerFound", function (event) {});
  markerControls2.removeEventListener("markerFound", function (event) {});
  markerControls3.removeEventListener("markerFound", function (event) {});
  markerControls4.removeEventListener("markerFound", function (event) {});
  markerControls5.removeEventListener("markerFound", function (event) {});
  markerControls6.removeEventListener("markerFound", function (event) {});
  markerControls7.removeEventListener("markerFound", function (event) {});
  markerControls8.removeEventListener("markerFound", function (event) {});

  markerControls9.removeEventListener("markerFound", function (event) {});
  markerControls10.removeEventListener("markerFound", function (event) {});
  markerControls11.removeEventListener("markerFound", function (event) {});
  markerControls12.removeEventListener("markerFound", function (event) {});
  markerControls13.removeEventListener("markerFound", function (event) {});
  markerControls14.removeEventListener("markerFound", function (event) {});
  markerControls15.removeEventListener("markerFound", function (event) {});

  markerPos[0] = 0;
  markerPos[1] = 0;
  console.log(`zerowanie pos: ${markerPos}`);
}

//= ===========================================================================
// getNickname
//= ===========================================================================
function getNickname() {
  let nickname = null;

  while (!nickname) nickname = prompt("Podaj nick:");
  setCookie("playerNicknameCookie", nickname, 1);
  return nickname;
}

//= ===========================================================================
// showPosition - GPS
//= ===========================================================================
function showPosition(position) {
  currentPlayerPosition = [position.coords.latitude, position.coords.longitude];
  document.getElementById("gpsPosition").innerHTML = currentPlayerPosition;
}

//= ===========================================================================
// showError
//= ===========================================================================

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      window.alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      window.alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      window.alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      window.alert("An unknown error occurred.");
      break;
    default:
      window.alert(`No case for ${error.code}.`);
      break;
  }
}

//= ===========================================================================
// stopWatch
//= ===========================================================================

function stopWatch() {
  navigator.geolocation.clearWatch(watchID);
}

//= ===========================================================================
// getCurrentPlayerLocation
//= ===========================================================================

function getCurrentPlayerLocation() {
  if (navigator.geolocation) {
    const positionOptions = {
      timeout: Infinity, // TODO sensowny odstęp czasowy
      maximumAge: 0,
      enableHighAccuracy: true,
    };
    watchID = navigator.geolocation.watchPosition(
      showPosition,
      showError,
      positionOptions
    );
  } else {
    window.alert("Geolocation is not supported by this browser.");
  }
}

//= ===========================================================================
// messageHandler
//= ===========================================================================

//! Owieczka - a gdzie jest webSocketMessgaeHandler??

function messageHandler(ws, message) {
  const recivedMsg = JSON.parse(message.data);
  console.log(recivedMsg);

  switch (recivedMsg.type) {
    case "RiviveMessage": {
      //! Owieczka - trzeba sprawdzić czy serwer nas ozywył czyli czy recivedMsg.isAlive ==true
      if (recivedMsg.isPlayerAlive) {
        player = recivedMsg.playerID;
        document.getElementById("gpsPosition").innerHTML =
          "waiting for another player";
        //! setCookie("playerCookieID", player, 1);
        // DONE sprawdzić cookie ? wysłać do serwera playerID z cookie i na serwerze odesłać dane z ActivePlayers[] : wczytać nowego gracza
      }
      //sendUserInteractionTime();
      break;
    }
    case "HitMessage": {
      // Owieczka - trzeba sprawdzić czy jest to komunikat że to my trafiliśmy czyli czy recivedMsg.playerId==playerID czy moze to w nas trafiono czyli recivedMsg.targetID = playerID i odpowiednio zaragować
      playSound("/game/data/dmgSound.mp3");
      hitAnimation();
      planeHit.add(meshHit);
      scene.add(planeHit);
      sendUserInteractionTime();
      break;
    }
    case "MissMessageForTarget": {
      document.getElementById(
        "gpsPosition"
      ).innerHTML = `${recivedMsg.playerID} tried to shoot you, be careful!`;
      // window.alert(`${recivedMsg.playerID} tried to shoot you, be careful!`);
      sendUserInteractionTime();
      break;
    }
    case "HpMessage": {
      // playSound("/game/data/dmgSound.mp3"); -> to powinno być grane, gdy ktoś otrzyma obrażenia
      const hp1 = document.getElementsByClassName("blood")[0];
      const hp2 = document.getElementsByClassName("blood")[1];

      hp1.innerHTML = recivedMsg.hpPoints;
      hp2.innerHTML = recivedMsg.hpPoints;
      if (recivedMsg.hpPoints == 0) {
        playSound("/game/data/robloxDeathSound.mp3");
        deadAnimation();
      }
      // hpv.innerHTML = pasekHP.value;
      sendUserInteractionTime();
      break;
    }
    case "AmmoMessage": {
      //  console.log("in hp part");
      const ammoValue = document.getElementById("ammo");
      const ammoBar = document.getElementById("ammoBar");
      ammoValue.innerHTML = `${recivedMsg.ammoPoints}`;
      ammoBar.style.width = `${recivedMsg.ammoPoints / 5}%`;
      if (!recivedMsg.ammoPoints)
        /*  window.alert(
          "You haven't ammunition, find ammunition kit to load your weapon!"
        ); */
        document.getElementById("gpsPosition").innerHTML =
          "You haven't ammunition, find ammunition kit to load your weapon!";
      sendUserInteractionTime();
      break;
    }
    case "ScoreMessage": {
      document.getElementById("trafione").innerHTML = recivedMsg.score[0];
      document.getElementById("nietrafione").innerHTML = recivedMsg.score[1];

      /*  // jezeli zabilem gracza
      if (!recivedMsg.isTargetAlive) {
        displayInfoAfterDuel(!recivedMsg.isTargetAlive);
      } */
      sendUserInteractionTime();
      break;
    }
    case "CounterMessage": {
      //TODO zmien opis gpsloc
      const cnt = document.getElementById("status");
      document.getElementById("gpsPosition").innerHTML = "Fight!";
      document.getElementById("buttonFire").disabled = true;
      console.log(recivedMsg.counter);
      cnt.innerHTML = recivedMsg.counter;
      cnt.classList.add("counter");

      if (!recivedMsg.counter) {
        document.getElementById("buttonFire").disabled = false;
        cnt.innerHTML = " ";
      } else {
        document.getElementById("gpsPosition").innerHTML =
          "Get ready for the duel!";
      }
     // sendUserInteractionTime();

      break;
    }
    case "EndDuelMessage": {
      sendUserInteractionTime();
      displayInfoEndDuel(recivedMsg.playerNickname, recivedMsg.targetNickname);
      break;
    }
    case "EndRoundMessage": {
      sendUserInteractionTime();
      displayInfoAfterDuel(recivedMsg.isTargetAlive);
      break;
    }
    case "SurrenderMessage": {
      sendUserInteractionTime();
      displayInfoSurrender(recivedMsg.playerNickname);
      break;
    }
    default:
      console.log(`[ERROR] undefind recived message ${recivedMsg.type}`);
      break;
  }
}

// screen.lockOrientation("portrait-primary");
function onLoad() {
  ws = new WebSocket(`wss://${serverLocalIp}:8000`);
  // logging the websocket property properties
  console.log(ws);
  //! getCurrentPlayerLocation();
  // DONE function checking permissions to camera

  setInterval(TimeoutMessage, timeoutToDisconnect);

  ws.onopen = (event) => {
    //! Owieczka - zamiast wysyłać tu śmieci móżna tą okazje wykorzystać do wysłania wiadomości o utworzeniu nowego gracza
    console.log(player);

    playerNickname = getCookie("playerNicknameCookie");

    if (playerNickname == "") playerNickname = getNickname(); //! checemy nick tylko raz na początku rozgrywki

    player = getCookie("playerCookieID");

    if (player != "") {
      /* && currentPlayerPosition */
      // ? jak go wyslac oot jest ptyanie

      const SendMessage = {
        type: "RespawnMessage",
        // eslint-disable-next-line object-shorthand
        nickname: playerNickname,
        playerID: player,
        targetID: "respawn_01",
        /*        gpsLocation: currentPlayerPosition, */
      };
      document.getElementById("buttonFire").disabled = false;
      lastInteractionTime = new Date().getTime();

      ws.send(JSON.stringify(SendMessage));
      console.log(SendMessage.type);
    }
    // DONE mechanizm cookies
  };

  ws.onmessage = (message) => {
    messageHandler(ws, message); //! Owieczka - przekazanie wiadomości z serwera do handlera
    // console.log(message.data);
  };
  ws.onclose = (event) => {
    //! stopWatch();

    // clearInterval(timeoutMessageInterval);
    deleteCookie("playerCookieID");
    deleteCookie("playerNicknameCookie");

    document.getElementById("gpsPosition").innerHTML = "Server shutdown";
    /*  window.alert(
      `Close websocket connection with error ${event.code}, ${watchID}`
    ); */
  };
}
// DONE how to detect close tab to close ws?
/* window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
}); */

window.addEventListener("load", onLoad(), false);
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("buttonFire").disabled = true;
});
