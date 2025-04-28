const menuToggle = document.getElementById("menu-mobile");

menuToggle.addEventListener("click", () => {
  const menu = document.getElementById("menuMobile");
  menu.classList.toggle("d-none");
});