// Animations and Micro-Interactions
function revealOnScroll() {
  const elements = document.querySelectorAll("section");
  const windowHeight = window.innerHeight;

  elements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      el.classList.add("visible");
    } else {
      el.classList.remove("visible");
    }
  });
}

function addBlinkingEffect() {
  const header = document.querySelector("header h1");
  setInterval(() => {
    header.classList.toggle("blink");
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("scroll", revealOnScroll);
  addBlinkingEffect();
});