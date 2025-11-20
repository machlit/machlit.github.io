// Detect system theme preference and set initial theme
function initTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const html = document.documentElement;

  if (prefersDark) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  updateLogoSrc();
}

// Initialize theme on page load
initTheme();

// Listen for theme preference changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    const html = document.documentElement;
    if (e.matches) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    updateLogoSrc();
  });

// Update logo src based on theme
function updateLogoSrc() {
  const logoImage = document.querySelector("header .logo .logo-image");
  if (!logoImage) return;

  const isDark = document.documentElement.classList.contains("dark");
  const darkSrc = logoImage.getAttribute("data-dark");
  const lightSrc = logoImage.getAttribute("data-light");

  logoImage.src = isDark ? darkSrc : lightSrc;

  const demoLogoImage = document.querySelector(
    "section.hero#top .visual .demo-image",
  );
  if (!demoLogoImage) return;

  const isDemoDark = document.documentElement.classList.contains("dark");
  const demoDarkSrc = demoLogoImage.getAttribute("data-dark");
  const demoLightSrc = demoLogoImage.getAttribute("data-light");

  demoLogoImage.src = isDemoDark ? demoDarkSrc : lightSrc;
}

// Build spacer height to match content
const content = document.querySelector(".smooth-content");
const spacer = document.getElementById("spacer");

function updateSpacer() {
  // total height equals content height from smooth-content
  const contentHeight = content.offsetHeight;
  spacer.style.height = contentHeight + "px";
}
window.addEventListener("resize", updateSpacer);
updateSpacer();

// Smooth/slow scroll: interpolate transform towards window.scrollY
const smoothEl = document.querySelector(".smooth-content");
let current = 0;
let target = 0;
const ease = 0.06; // lower -> slower, tighter lag

// Track parallax offset for visual elements (cards move faster)
let parallaxCurrent = 0;
const parallaxEase = 0.08; // slightly higher ease = faster movement

function raf() {
  target = window.scrollY || window.pageYOffset;

  current += (target - current) * ease;
  parallaxCurrent += (target - parallaxCurrent) * parallaxEase;

  // round to avoid subpixel jitter affecting text clarity
  const rounded = Math.round(current * 100) / 100;
  smoothEl.style.transform = `translateY(${-rounded}px)`;

  // Apply parallax offset to visual elements
  const visualEls = document.querySelectorAll(".visual");
  visualEls.forEach((el) => {
    const parallaxOffset = parallaxCurrent - current;
    el.style.transform = `translateY(${parallaxOffset * 0.15}px)`;
  });

  // Apply parallax depth to floating symbols
  const floatingSymbols = document.querySelectorAll(".floating-symbol");
  floatingSymbols.forEach((symbol) => {
    const depth = parseFloat(symbol.getAttribute("data-depth")) || 0.5;
    const parallaxOffset = parallaxCurrent - current;
    symbol.style.transform = `translateY(${parallaxOffset * depth}px)`;
  });

  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Reveal elements when near viewport (works with transformed container)
const revealEls = document.querySelectorAll(".reveal");
function checkReveal() {
  const viewportTop = current; // use smoothed current for subtle timing
  const vh = window.innerHeight;
  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const top = rect.top + current; // element's top relative to document
    const threshold = vh * 0.7; // reveal when 70% into view
    if (top < viewportTop + threshold) {
      el.classList.add("in-view");
    }
  });
}

// run check periodically alongside raf
function rafReveal() {
  checkReveal();
  requestAnimationFrame(rafReveal);
}
requestAnimationFrame(rafReveal);

// Update scroll indicator based on scroll position and remaining content
function updateScrollIndicator() {
  const scrollIndicator = document.getElementById("scrollIndicator");
  const scrollY = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const maxScroll = docHeight - windowHeight;
  const scrollPercentage = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

  // Only show scroll down at the start, hide once user reaches near the end
  if (scrollPercentage < 10) {
    // At top: show scroll down
    scrollIndicator.textContent = `Scroll down ↓`;
    scrollIndicator.classList.remove("hidden");
  } else {
    // Anywhere else: hide indicator
    scrollIndicator.classList.add("hidden");
  }
}

window.addEventListener("scroll", updateScrollIndicator);
window.addEventListener("resize", updateScrollIndicator);
updateScrollIndicator();

// Optional: smooth wheel damping (prevent very large jumps on fast wheels)
// We leave native scroll but the slow interpolation creates the desired effect.

// Improve performance: reduce motion for users who prefer reduced motion
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (prefersReduced) {
  // disable transforms and smooth effect
  smoothEl.style.transform = "none";
  // remove RAF loops by not starting them (they've already started — simple fallback: set ease to 1)
}

// Typewriter effect for code snippets
function typewriterEffect(element, speed = 30) {
  const fullText = element.getAttribute("data-code");
  if (!fullText) return;

  element.textContent = "";
  let index = 0;

  function type() {
    if (index < fullText.length) {
      element.textContent += fullText.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typewriter effect when code snippets come into view
const codeSnippets = document.querySelectorAll(".code-snippet[data-code]");
const snippetObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains("typed")) {
        entry.target.classList.add("typed");
        typewriterEffect(entry.target);
      }
    });
  },
  { threshold: 0.5 },
);

codeSnippets.forEach((snippet) => {
  snippetObserver.observe(snippet);
});

// Logo animation: show in navbar when scrolling past first section (desktop only)
const logoImage = document.querySelector("header .logo .logo-image");
function updateLogoVisibility() {
  const scrollY = window.scrollY || window.pageYOffset;
  const firstSectionHeight = window.innerHeight;
  const isDesktop = window.matchMedia("(min-width: 901px)").matches;

  if (scrollY > firstSectionHeight * 0.5 && isDesktop) {
    logoImage.classList.add("visible");
  } else {
    logoImage.classList.remove("visible");
  }
}

window.addEventListener("scroll", updateLogoVisibility);
window.addEventListener("resize", updateLogoVisibility);
updateLogoVisibility();

// Basic link passive handlers for mobile
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    // scroll instantly to native position then allow smooth lag to catch up
    window.scrollTo({
      top: el.offsetTop,
      behavior: "instant" in HTMLDivElement.prototype ? "instant" : "auto",
    });
  });
});
