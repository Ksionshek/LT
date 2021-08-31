let scene;
let camera;
let renderer;
let clock;
let deltaTime;
let totalTime;
let plane = null;
let planeHit = new THREE.Object3D();
let arToolkitSource;
let arToolkitContext;
//= ===========================================================================
// PLAYER's MARKERS
//= ===========================================================================
let markerRoot;
let markerRoot2;
let markerRoot3;
let markerRoot4;
let markerRoot5;
let markerRoot6;
let markerRoot7;
let markerRoot8;
let markerRoot9;
let markerRoot10;
//= ===========================================================================
// Ammo markers
//= ===========================================================================
let ammoMarker;
let ammoMarker2;
//= ===========================================================================
// HP markers
//= ===========================================================================
let hpMarker;
let hpMarker2;
//= ===========================================================================
// Respawn marker
//= ===========================================================================
let respawnMarker;
//= ===========================================================================
// marker controls
//= ===========================================================================
// PLAYERS
let markerControls1;
let markerControls5;
let markerControls6;
let markerControls7;
let markerControls8;
let markerControls9;
let markerControls10;
let markerControls11;
let markerControls12;
let markerControls13;

//= ===========================================================================
// marker controls
//= ===========================================================================
// Resource group
let markerControls14; //-> hpKit2
let markerControls15; //-> ammoKit2

let markerControls2; //-> ammoKit1
let markerControls3; //-> hpKit1
let markerControls4; //-> respawn

// zapisujemy pozycje markerow
let markerPos = [];

// grupa dla apteczki i ammo
let resourceGroup;
// grupa dla graczy
let markerGroup;
// grupa dla respawna
let respawnGroup;

// bazowy szescian, potem pojdzie out
let mesh1;

// szescian z amunicja
let mesh2;
let mesh22;

// szescian z apteczka
let mesh3;
let mesh33;

// 6scian z napisem respawn
let mesh4;

const bullets = [];

initialize();
animate();

function initialize() {
  scene = new THREE.Scene();
  var light = new THREE.AmbientLight(0xfffff0); // soft white light
  scene.add(light);
  camera = new THREE.Camera();

  scene.add(camera);

  camera.position.z = 3;
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  // scene.add(groupPart);
  renderer.setSize(window.outerWidth, window.outerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";

  //  document.body.appendChild(renderer.domElement);
  document.querySelector("#screenApp").appendChild(renderer.domElement);

  clock = new THREE.Clock();
  deltaTime = 0;
  totalTime = 0;

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",

    sourceWidth: 1280,
    sourceHeight: 960,

    // resolution displayed for the source
    displayWidth: 1280,
    displayHeight: 960,
  });

  // naprawia błąd z renderowaniem strony, gdy zmienimy rozmiar okienka
  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);

    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }

  arToolkitSource.init(function onReady() {
    onResize();
  });

  // handle resize event
  window.addEventListener("resize", function () {
    onResize();
  });

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "/game/data/camera_para.dat",
    detectionMode: "mono_and_matrix",
    matrixCodeType: "3x3",

    debug: false,

    imageSmoothingEnabled: true,
  });

  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  markerRoot = new THREE.Group();
  scene.add(markerRoot);
  markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: "barcode",
    barcodeValue: 5,
  });

  markerGroup = new THREE.Group();
  markerRoot.add(markerGroup);

  markerRoot2 = new THREE.Group();
  scene.add(markerRoot2);
  markerControls5 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
    type: "barcode",
    barcodeValue: 1,
  });
  markerRoot2.add(markerGroup);

  markerRoot3 = new THREE.Group();
  scene.add(markerRoot3);
  markerControls6 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot3, {
    type: "barcode",
    barcodeValue: 6,
  });
  markerRoot3.add(markerGroup);

  markerRoot4 = new THREE.Group();
  scene.add(markerRoot4);
  markerControls7 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot4, {
    type: "barcode",
    barcodeValue: 7,
  });
  markerRoot4.add(markerGroup);

  markerRoot5 = new THREE.Group();
  scene.add(markerRoot5);
  markerControls8 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot5, {
    type: "barcode",
    barcodeValue: 8,
  });
  markerRoot5.add(markerGroup);

  markerRoot6 = new THREE.Group();
  scene.add(markerRoot6);
  markerControls9 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot6, {
    type: "barcode",
    barcodeValue: 9,
  });
  markerRoot6.add(markerGroup);

  markerRoot7 = new THREE.Group();
  scene.add(markerRoot7);
  markerControls10 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot7,
    {
      type: "barcode",
      barcodeValue: 10,
    }
  );
  markerRoot7.add(markerGroup);

  markerRoot8 = new THREE.Group();
  scene.add(markerRoot8);
  markerControls11 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot8,
    {
      type: "barcode",
      barcodeValue: 11,
    }
  );
  markerRoot8.add(markerGroup);

  markerRoot9 = new THREE.Group();
  scene.add(markerRoot9);
  markerControls12 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot9,
    {
      type: "barcode",
      barcodeValue: 12,
    }
  );
  markerRoot9.add(markerGroup);

  markerRoot10 = new THREE.Group();
  scene.add(markerRoot10);
  markerControls13 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot10,
    {
      type: "barcode",
      barcodeValue: 13,
    }
  );
  markerRoot10.add(markerGroup);

  ammoMarker = new THREE.Group();
  scene.add(ammoMarker);

  markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, ammoMarker, {
    type: "barcode",
    barcodeValue: 2,
  });

  resourceGroup = new THREE.Group();
  ammoMarker.add(resourceGroup);

  ammoMarker2 = new THREE.Group();
  scene.add(ammoMarker2);

  markerControls15 = new THREEx.ArMarkerControls(
    arToolkitContext,
    ammoMarker2,
    {
      type: "barcode",
      barcodeValue: 15,
    }
  );

  ammoMarker2.add(resourceGroup);

  hpMarker = new THREE.Group();
  scene.add(hpMarker);
  markerControls3 = new THREEx.ArMarkerControls(arToolkitContext, hpMarker, {
    type: "barcode",
    barcodeValue: 3,
    smooth: true,
  });

  hpMarker.add(resourceGroup);

  hpMarker2 = new THREE.Group();
  scene.add(hpMarker2);
  markerControls14 = new THREEx.ArMarkerControls(arToolkitContext, hpMarker2, {
    type: "barcode",
    barcodeValue: 14,
    smooth: true,
  });

  hpMarker2.add(resourceGroup);

  respawnMarker = new THREE.Group();
  scene.add(respawnMarker);
  markerControls4 = new THREEx.ArMarkerControls(
    arToolkitContext,
    respawnMarker,
    {
      type: "barcode",

      barcodeValue: 4,
    }
  );
  respawnGroup = new THREE.Group();
  respawnMarker.add(respawnGroup);

  const geometry2 = new THREE.CubeGeometry(1.1, 1.1, 1.1);
  const texture2 = new THREE.TextureLoader().load("/game/img/ammo.png");
  const material2 = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    opacity: 0.9,
    map: texture2,
    transparent: true,
  });

  mesh2 = new THREE.Mesh(geometry2, material2);
  mesh22 = new THREE.Mesh(geometry2, material2);
  mesh2.position.y = 0.5;
  mesh22.position.y = 0.5;

  ammoMarker.add(mesh2);
  ammoMarker2.add(mesh22);

  const geometry3 = new THREE.CubeGeometry(1.2, 1.2, 1.2);
  const texture3 = new THREE.TextureLoader().load("/game/img/healing.png");
  const material3 = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    map: texture3,
    opacity: 0.69,
    alphaTest: 0.21,
    transparent: true,
  });

  mesh3 = new THREE.Mesh(geometry3, material3);
  mesh3.position.y = 0.5;
  mesh33 = new THREE.Mesh(geometry3, material3);
  mesh33.position.y = 0.5;

  hpMarker.add(mesh3);
  hpMarker2.add(mesh33);

  const geometry4 = new THREE.CubeGeometry(1, 1, 1);
  const texture4 = new THREE.TextureLoader().load("/game/img/respawn.jpg");
  const material4 = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    opacity: 0.9,
    map: texture4,
    transparent: true,
  });

  mesh4 = new THREE.Mesh(geometry4, material4);
  mesh4.position.y = 0.2;

  respawnMarker.add(mesh4);
}

function update() {
  mesh2.rotation.x += 0.02;
  mesh2.rotation.y += 0.02;
  mesh3.rotation.x += 0.02;
  mesh3.rotation.y += 0.02;
  mesh33.rotation.x += 0.02;
  mesh33.rotation.y += 0.02;
  mesh22.rotation.x += 0.02;
  mesh22.rotation.y += 0.02;
  mesh4.rotation.x += 0.02;
  mesh4.rotation.y += 0.02;

  if (arToolkitSource.ready !== false) {
    arToolkitContext.update(arToolkitSource.domElement);
  }
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  deltaTime = clock.getDelta();
  totalTime += deltaTime;

  update();
  for (let index = 0; index < bullets.length; index += 1) {
    if (bullets[index] === undefined) continue;
    if (bullets[index].alive == false) {
      bullets.splice(index, 1);
      continue;
    }

    bullets[index].position.add(bullets[index].velocity);
  }

  render();
}
markerControls1.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker();
});

markerControls5.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });

  fnMarker2();
});

markerControls6.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker3();
});

markerControls7.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker4();
});

markerControls8.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker5();
});

markerControls9.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker6();
});

markerControls10.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker7();
});

markerControls11.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker8();
});

markerControls12.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker9();
});

markerControls13.addEventListener("markerFound", (event) => {
  arToolkitContext.arController.addEventListener("getMarker", function (ev) {
    markerPos = ev.data.marker.pos;
  });
  fnMarker10();
});

markerControls2.addEventListener("markerFound", (event) => {
  console.log("Ammo marker");

  fnAmmo();
});

markerControls15.addEventListener("markerFound", (event) => {
  console.log("Ammo marker");

  fnAmmo2();
});

markerControls3.addEventListener("markerFound", (event) => {
  console.log("Apteczka marker");
  fnHP();
});

markerControls14.addEventListener("markerFound", (event) => {
  console.log("Apteczka marker");
  fnHP2();
});

markerControls4.addEventListener("markerFound", (event) => {
  console.log("Res marker :)");

  fnRes();
});
