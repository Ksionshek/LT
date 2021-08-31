function playSound(url) {
  new Audio(url).play();
}

const gameMode = `
<section class="hero">
  <div class="hero-body">
      <h1 class="title" style="text-align:center">
        LaserTag Game Modes
      </h1>
  </div>
</section>
<div class="box has-text-centered has-bg-img" >
<button class="button is-large is-rounded is-centered is-info is-outlined"><a href="/scan">Duel</a></button>
<br>
<br>
<button class="button is-large is-rounded is-centered is-info is-outlined"><a href="/game/markers/markers.rar" download>Download Markers</a></button>
</div>
`;
