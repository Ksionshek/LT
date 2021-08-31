//= ===========================================================================
// Variables
//= ===========================================================================
let ws; // zmienna websocket
const serverLocalIp = `192.168.50.100`;

let sceneScaner;
let cameraScaner;
let rendererScaner;
let clockScaner;
let deltaTimeScaner;
let totalTimeScaner;

let arToolkitSourceScaner;
let arToolkitContextScaner;

let markerGroupScanner;

let resourceGroupScaner;

//= ===========================================================================
// PLAYER's MARKERS
//= ===========================================================================

let markerRoot1Scaner;
let markerRoot2Scaner;
let markerRoot3Scaner;
let markerRoot4Scaner;
let markerRoot5Scaner;
let markerRoot6Scaner;
let markerRoot7Scaner;
let markerRoot8Scaner;
let markerRoot9Scaner;
let markerRoot10Scaner;

//= ===========================================================================
// Ammo markers
//= ===========================================================================
let ammoMarker1Scaner;
let ammoMarker2Scaner;

//= ===========================================================================
// HP markers
//= ===========================================================================
let hpMarker1Scaner;
let hpMarker2Scaner;

//= ===========================================================================
// Respawn marker
//= ===========================================================================
let respawnMarker1Scaner;

//= ===========================================================================
// marker controls
//= ===========================================================================
// PLAYERS
let mcPlayer1;
let mcPlayer2;
let mcPlayer3;
let mcPlayer4;
let mcPlayer5;
let mcPlayer6;
let mcPlayer7;
let mcPlayer8;
let mcPlayer9;
let mcPlayer10;

//= ===========================================================================
// Ammo controls
//= ===========================================================================
let mcAmmo1;
let mcAmmo2;

//= ===========================================================================
// HP controls
//= ===========================================================================
let mcHP1;
let mcHP2;

//= ===========================================================================
// Respawn control
//= ===========================================================================

let mcRespawn1;

//= ===========================================================================
// Target functions
//= ===========================================================================
let targetScan = null;

//= ===========================================================================
// PLAYER's target functions
//= ===========================================================================
function fnMarkerTarget() {
  targetScan = "markerID_01";
}
function fnMarkerTarget2() {
  targetScan = "markerID_02";
}
function fnMarkerTarget3() {
  targetScan = "markerID_03";
}
function fnMarkerTarget4() {
  targetScan = "markerID_04";
}
function fnMarkerTarget5() {
  targetScan = "markerID_05";
}
function fnMarkerTarget6() {
  targetScan = "markerID_06";
}
function fnMarkerTarget7() {
  targetScan = "markerID_07";
}
function fnMarkerTarget8() {
  targetScan = "markerID_08";
}
function fnMarkerTarget9() {
  targetScan = "markerID_09";
}
function fnMarkerTarget10() {
  targetScan = "markerID_10";
}

//= ===========================================================================
// Resource group target functions
//= ===========================================================================

function fnResTarget() {
  targetScan = "respawn_02";
}

function fnAmmoTarget() {
  targetScan = "AmmoKit_01";
}
function fnAmmoTarget2() {
  targetScan = "AmmoKit_02";
}

function fnHPTarget() {
  targetScan = "hpKit_01";
}
function fnHPTarget2() {
  targetScan = "hpKit_02";
}

initialize();
animate();

//= ===========================================================================
// INIT
//= ===========================================================================
function initialize() {
  sceneScaner = new THREE.Scene();
  const light = new THREE.AmbientLight(0xfffff0);
  sceneScaner.add(light);
  cameraScaner = new THREE.Camera();
  sceneScaner.add(cameraScaner);
  cameraScaner.position.z = 1;
  rendererScaner = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  rendererScaner.setSize(window.outerWidth, window.outerHeight);
  rendererScaner.domElement.style.position = "absolute";
  rendererScaner.domElement.style.top = "0px";
  rendererScaner.domElement.style.left = "0px";

  document.querySelector("#scannerApp").appendChild(rendererScaner.domElement);

  clockScaner = new THREE.Clock();
  deltaTimeScaner = 0;
  totalTimeScaner = 0;

  //= ===========================================================================
  // AR Source
  //= ===========================================================================
  arToolkitSourceScaner = new THREEx.ArToolkitSource({
    sourceType: "webcam",

    sourceWidth: 1280,
    sourceHeight: 960,

    displayWidth: 1280,
    displayHeight: 960,
  });

  function onResize() {
    arToolkitSourceScaner.onResize();
    arToolkitSourceScaner.copySizeTo(rendererScaner.domElement);

    if (arToolkitContextScaner.arController !== null) {
      arToolkitSourceScaner.copySizeTo(
        arToolkitContextScaner.arController.canvas
      );
    }
  }

  arToolkitSourceScaner.init(function onReady() {
    onResize();
  });

  window.addEventListener("resize", function () {
    onResize();
  });
  //= ===========================================================================
  // AR Context
  //= ===========================================================================
  arToolkitContextScaner = new THREEx.ArToolkitContext({
    cameraParametersUrl: "/game/data/camera_para.dat",
    detectionMode: "mono_and_matrix",
    matrixCodeType: "3x3",
    maxDetectionRate: 60,
    debug: false,
    imageSmoothingEnabled: true,
  });

  arToolkitContextScaner.init(function onCompleted() {
    cameraScaner.projectionMatrix.copy(
      arToolkitContextScaner.getProjectionMatrix()
    );
  });

  //= ===========================================================================
  // MC PLAYER 1
  //= ===========================================================================
  markerRoot1Scaner = new THREE.Group();
  sceneScaner.add(markerRoot1Scaner);
  mcPlayer1 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot1Scaner,
    {
      type: "barcode",
      barcodeValue: 5,
    }
  );

  markerGroupScanner = new THREE.Group();
  markerRoot1Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 2
  //= ===========================================================================
  markerRoot2Scaner = new THREE.Group();
  sceneScaner.add(markerRoot2Scaner);
  mcPlayer2 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot2Scaner,
    {
      type: "barcode",
      barcodeValue: 1,
    }
  );
  markerRoot2Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 3
  //= ===========================================================================
  markerRoot3Scaner = new THREE.Group();
  sceneScaner.add(markerRoot3Scaner);

  mcPlayer3 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot3Scaner,
    {
      type: "barcode",
      barcodeValue: 6,
    }
  );
  markerRoot3Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 4
  //= ===========================================================================
  markerRoot4Scaner = new THREE.Group();
  sceneScaner.add(markerRoot4Scaner);

  mcPlayer4 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot4Scaner,
    {
      type: "barcode",
      barcodeValue: 7,
    }
  );
  markerRoot4Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 5
  //= ===========================================================================
  markerRoot5Scaner = new THREE.Group();
  sceneScaner.add(markerRoot5Scaner);

  mcPlayer5 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot5Scaner,
    {
      type: "barcode",
      barcodeValue: 8,
    }
  );
  markerRoot5Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 6
  //= ===========================================================================
  markerRoot6Scaner = new THREE.Group();
  sceneScaner.add(markerRoot6Scaner);

  mcPlayer6 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot6Scaner,
    {
      type: "barcode",
      barcodeValue: 9,
    }
  );
  markerRoot6Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 7
  //= ===========================================================================
  markerRoot7Scaner = new THREE.Group();
  sceneScaner.add(markerRoot7Scaner);

  mcPlayer7 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot7Scaner,
    {
      type: "barcode",
      barcodeValue: 10,
    }
  );
  markerRoot7Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 8
  //= ===========================================================================
  markerRoot8Scaner = new THREE.Group();
  sceneScaner.add(markerRoot8Scaner);

  mcPlayer8 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot8Scaner,
    {
      type: "barcode",
      barcodeValue: 11,
    }
  );
  markerRoot8Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 9
  //= ===========================================================================
  markerRoot9Scaner = new THREE.Group();
  sceneScaner.add(markerRoot9Scaner);

  mcPlayer9 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot9Scaner,
    {
      type: "barcode",
      barcodeValue: 12,
    }
  );
  markerRoot9Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC PLAYER 10
  //= ===========================================================================
  markerRoot10Scaner = new THREE.Group();
  sceneScaner.add(markerRoot10Scaner);

  mcPlayer10 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    markerRoot10Scaner,
    {
      type: "barcode",
      barcodeValue: 13,
    }
  );
  markerRoot10Scaner.add(markerGroupScanner);
  //= ===========================================================================
  // MC Ammo 1
  //= ===========================================================================
  ammoMarker1Scaner = new THREE.Group();
  sceneScaner.add(ammoMarker1Scaner);

  mcAmmo1 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    ammoMarker1Scaner,
    {
      type: "barcode",
      barcodeValue: 2,
    }
  );

  resourceGroupScaner = new THREE.Group();
  ammoMarker1Scaner.add(resourceGroupScaner);
  //= ===========================================================================
  // MC Ammo 2
  //= ===========================================================================
  ammoMarker2Scaner = new THREE.Group();
  sceneScaner.add(ammoMarker2Scaner);

  mcAmmo2 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    ammoMarker2Scaner,
    {
      type: "barcode",
      barcodeValue: 15,
    }
  );
  ammoMarker2Scaner.add(resourceGroupScaner);
  //= ===========================================================================
  // MC HP 1
  //= ===========================================================================
  hpMarker1Scaner = new THREE.Group();
  sceneScaner.add(hpMarker1Scaner);
  mcHP1 = new THREEx.ArMarkerControls(arToolkitContextScaner, hpMarker1Scaner, {
    type: "barcode",
    barcodeValue: 3,
    smooth: true,
  });

  hpMarker1Scaner.add(resourceGroupScaner);
  //= ===========================================================================
  // MC HP 2
  //= ===========================================================================
  hpMarker2Scaner = new THREE.Group();
  sceneScaner.add(hpMarker2Scaner);

  mcHP2 = new THREEx.ArMarkerControls(arToolkitContextScaner, hpMarker2Scaner, {
    type: "barcode",
    barcodeValue: 14,
  });
  hpMarker2Scaner.add(resourceGroupScaner);
  //= ===========================================================================
  // MC Respawn
  //= ===========================================================================
  respawnMarker1Scaner = new THREE.Group();
  sceneScaner.add(respawnMarker1Scaner);
  mcRespawn1 = new THREEx.ArMarkerControls(
    arToolkitContextScaner,
    respawnMarker1Scaner,
    {
      type: "barcode",
      barcodeValue: 4,
    }
  );

  respawnMarker1Scaner.add(resourceGroupScaner);
}
//= ===========================================================================
// Update/Render/Animate
//= ===========================================================================
function update() {
  // update artoolkit on every frame
  if (arToolkitSourceScaner.ready !== false) {
    arToolkitContextScaner.update(arToolkitSourceScaner.domElement);
  }
}

function render() {
  rendererScaner.render(sceneScaner, cameraScaner);
}

function animate() {
  requestAnimationFrame(animate);
  deltaTimeScaner = clockScaner.getDelta();
  totalTimeScaner += deltaTimeScaner;

  update();
  render();
}
//= ===========================================================================
// Cookie OMNOMNOMNOM
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
  const user = getCookie(cname);
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
  // checkCookie(cname);
}

function goToGame() {
  window.location.href = `/game`;
}

const buttonHrefAdd = document.createElement("span");
const msgForClient = document.createElement("span");
const nav = document.getElementById("nav");
const scannerApp = document.getElementById("scannerApp");
const templateWrong = `<button class="buttonHrefWrong" onclick="scanMarker()"; > PLAY</button>`;
let template = `<button class="buttonHref" onclick="goToGame()"; >
    PLAY</button>`;
//= ===========================================================================
// Scan Marker
//= ===========================================================================
function scanMarker() {
  const SendMessage = {
    type: "ScanMessage",
    scanResult: targetScan,
  };

  console.log(SendMessage.type);
  ws.send(JSON.stringify(SendMessage));
}
function permissionReq() {
  const constraints = {
    audio: false,
    video: { facingMode: "environment" },
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log("Got MediaStream:", stream);
      window.addEventListener("load", onLoad(), false);
      document.addEventListener("DOMContentLoaded", () => {});
      document.getElementById("preloader").style.display = "none";
      scannerApp.style.visibility = "visible";
    })
    .catch((error) => {
      template = `<h1 id="title">
      No permission to the camera, please give the appropriate permissions and
      try again!
    </h1>
    <button
    class="btnPreload" id="tmp">
    <a href="/portal">Portal</a>
  </button>
    `;

      const msg = document.createElement("span");
      msg.innerHTML = template;
      document.getElementById("btnID").style.display = "none";
      document.getElementById("preloader").appendChild(msg);
    });
}

//= ===========================================================================
// Listenery -> Player's Group
//= ===========================================================================
mcPlayer1.addEventListener("markerFound", (event) => {
  fnMarkerTarget();
});

mcPlayer2.addEventListener("markerFound", (event) => {
  fnMarkerTarget2();
});
mcPlayer3.addEventListener("markerFound", (event) => {
  fnMarkerTarget3();
});
mcPlayer4.addEventListener("markerFound", (event) => {
  fnMarkerTarget4();
});
mcPlayer5.addEventListener("markerFound", (event) => {
  fnMarkerTarget5();
});
mcPlayer6.addEventListener("markerFound", (event) => {
  fnMarkerTarget6();
});
mcPlayer7.addEventListener("markerFound", (event) => {
  fnMarkerTarget7();
});
mcPlayer8.addEventListener("markerFound", (event) => {
  fnMarkerTarget8();
});
mcPlayer9.addEventListener("markerFound", (event) => {
  fnMarkerTarget9();
});
mcPlayer10.addEventListener("markerFound", (event) => {
  fnMarkerTarget10();
});

//= ===========================================================================
// Listenery -> Resource's Group
//= ===========================================================================
mcAmmo1.addEventListener("markerFound", (event) => {
  fnAmmoTarget();
});
mcAmmo2.addEventListener("markerFound", (event) => {
  fnAmmoTarget2();
});
mcHP1.addEventListener("markerFound", (event) => {
  fnHPTarget();
});
mcHP2.addEventListener("markerFound", (event) => {
  fnHPTarget2();
});
mcRespawn1.addEventListener("markerFound", (event) => {
  fnResTarget();
});

function onLoad() {
  ws = new WebSocket(`wss://${serverLocalIp}:8000`);

  deleteCookie("playerCookieID"); //! usuwanie śmieci które mogły tam zostać
  deleteCookie("playerNicknameCookie");

  ws.onopen = () => {};

  ws.onmessage = (message) => {
    const recivedMsg = JSON.parse(message.data);
    console.log(recivedMsg);

    if (recivedMsg.scanResult) {
      const templateMsg = `<span class="msgMarker" id="msgGL">GL&HF!</span>`;
      document.getElementById("msgScan").style.display = "none";

      setCookie("playerCookieID", targetScan, 1);
      msgForClient.innerHTML = templateMsg;
      buttonHrefAdd.innerHTML = template;
      scannerApp.appendChild(msgForClient);
      scannerApp.appendChild(buttonHrefAdd);
    } else {
      const templateMsg = `<span class="msgMarker" id="msgWrongMarker">Marker is taken.<br/>Choose another marker</span>
      `;
      document.getElementById("msgScan").style.animation =
        "moveDivMsg 2s ease-in";
      document.getElementById("msgScan").style.animationFillMode = "forwards";

      msgForClient.innerHTML = templateMsg;
      // buttonHrefAdd.innerHTML = templateWrong;
      scannerApp.appendChild(msgForClient);
      //scannerApp.appendChild(buttonHrefAdd);
    }
  };
  ws.onclose = () => {};
}
