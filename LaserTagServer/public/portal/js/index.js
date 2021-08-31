const routes = {
  "/": home,
  "/game-mode": gameMode,
  //! "/map": map,
  "/statistic": statistic,
};

const rootDiv = document.getElementById("root");
rootDiv.innerHTML = routes[window.location.pathname];

const onNavigate = (pathname) => {
  window.history.pushState(
    {},
    pathname,
    `${window.location.origin}/portal${pathname}`
  );
  rootDiv.innerHTML = routes[pathname];
};

window.onpopstate = () => {
  rootDiv.innerHTML = routes[window.location.pathname];
};
