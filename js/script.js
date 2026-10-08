"use strict";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");

function setNavOpen(open) {
  navbar?.classList.toggle("active", open);
  navToggler?.classList.toggle("active", open);
  navToggler?.setAttribute("aria-expanded", String(open));
  navToggler?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
navToggler?.addEventListener("click", () =>
  setNavOpen(!navbar.classList.contains("active")),
);
document
  .querySelectorAll("[data-nav-link]")
  .forEach((link) => link.addEventListener("click", () => setNavOpen(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navbar?.classList.contains("active")) {
    setNavOpen(false);
    navToggler.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-header]")) setNavOpen(false);
});
window
  .matchMedia("(min-width: 992px)")
  .addEventListener("change", () => setNavOpen(false));

const backTopBtn = document.querySelector("[data-back-top-btn]");
function updateBackTop() {
  backTopBtn?.classList.toggle("active", window.scrollY > 100);
}
window.addEventListener("scroll", updateBackTop, { passive: true });
updateBackTop();

document.querySelectorAll("[data-btn]").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const bounds = button.getBoundingClientRect();
    button.style.setProperty("--top", `${event.clientY - bounds.top}px`);
    button.style.setProperty("--left", `${event.clientX - bounds.left}px`);
  });
});

// Observe once instead of measuring every section on every scroll event.
const revealElements = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  revealElements.forEach((element) => {
    element.classList.add("reveal-pending");
    observer.observe(element);
  });
}

const cursor = document.querySelector("[data-cursor]");
if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      if (reducedMotion.matches) return;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.left = `${event.clientX}px`;
      cursor.classList.toggle(
        "hovered",
        Boolean(event.target.closest("a, button")),
      );
    },
    { passive: true },
  );
}

const counters = document.querySelectorAll(".stat-number");
function formatCount(target) {
  return target === 30 ? `$${target}K` : `${target}${target === 36 ? "" : "+"}`;
}
function animateCount(counter) {
  const target = Number(counter.dataset.target);
  if (reducedMotion.matches) return;
  let start;
  function frame(time) {
    start ??= time;
    const progress = Math.min((time - start) / 1200, 1);
    counter.textContent =
      progress === 1
        ? formatCount(target)
        : String(Math.round(target * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );
  counters.forEach((counter) => counterObserver.observe(counter));
}

document.querySelectorAll(".faq-question").forEach((button, index) => {
  const answer = button.nextElementSibling;
  answer.id = `faq-answer-${index + 1}`;
  answer.hidden = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-controls", answer.id);
  button.querySelector(".faq-toggle-icon")?.setAttribute("aria-hidden", "true");
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    answer.hidden = expanded;
  });
});

// Shared by the existing inquiry and updates dialogs.
let activeDialog = null;
let dialogTrigger = null;
let previousOverflow = "";
function openSiteDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog || activeDialog) return;
  dialogTrigger = document.activeElement;
  previousOverflow = document.body.style.overflow;
  activeDialog = dialog;
  dialog.style.display = "block";
  document.body.style.overflow = "hidden";
  [...document.body.children].forEach((element) => {
    if (element !== dialog && !element.inert) {
      element.inert = true;
      element.dataset.dialogInert = "true";
    }
  });
  dialog.querySelector(".close")?.focus();
}
function closeSiteDialog() {
  if (!activeDialog) return;
  activeDialog.style.display = "none";
  activeDialog = null;
  document.body.style.overflow = previousOverflow;
  document.querySelectorAll("[data-dialog-inert]").forEach((element) => {
    element.inert = false;
    delete element.dataset.dialogInert;
  });
  dialogTrigger?.focus();
}
document.addEventListener("click", (event) => {
  if (event.target === activeDialog) closeSiteDialog();
});
document.addEventListener("keydown", (event) => {
  if (!activeDialog) return;
  if (event.key === "Escape") closeSiteDialog();
  if (event.key !== "Tab") return;
  const focusable = [
    ...activeDialog.querySelectorAll(
      'button, a[href], input, textarea, select, [tabindex="0"]',
    ),
  ].filter((element) => !element.disabled && element.getClientRects().length);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});
