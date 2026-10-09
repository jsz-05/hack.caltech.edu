/** Google Forms' public responder endpoint. This is not the official Forms REST API.
 * no-cors sends a simple POST but returns an opaque response: delivery cannot be
 * confirmed here. Never label dispatch as a verified saved response.
 */
async function sendToGoogleForm(action, entries, fetcher = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    await fetcher(action, {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: entries,
      signal: controller.signal,
    });
    return { dispatched: true, confirmed: false };
  } finally {
    clearTimeout(timeout);
  }
}

// Mappings verified against the published form on October 7, 2026.
// Keep the exact Google choice values when changing the visible labels.
export const ORGANIZER_FIELDS = Object.freeze({
  name: "entry.2118451569",
  email: "entry.209437452",
  year: "entry.2123560026",
  hours: "entry.1567651893",
  roles: "entry.1313245948",
});
export const RESPONDER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSduE7XjfdQ8-dhFlVV5wkyV5YRda7D8SI2xniZ3yvl3pPR4Dg/viewform";
export function normalizeUsername(value) {
  return value
    .trim()
    .replace(/@caltech\.edu$/i, "")
    .toLowerCase();
}
export function buildOrganizerEntries(data) {
  const username = normalizeUsername(String(data.get("username") || ""));
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(username))
    throw new Error("Enter your Caltech username, such as jzhou3.");
  const entries = new URLSearchParams();
  entries.set(ORGANIZER_FIELDS.name, String(data.get("name") || "").trim());
  entries.set(ORGANIZER_FIELDS.email, `${username}@caltech.edu`);
  for (const key of ["year", "hours"]) {
    const value = String(data.get(key) || "").trim();
    if (value) entries.set(ORGANIZER_FIELDS[key], value);
  }
  // URLSearchParams.append preserves multiple checked values.
  for (const role of data.getAll("roles"))
    entries.append(ORGANIZER_FIELDS.roles, String(role));
  const other = String(data.get("otherRole") || "").trim();
  if (other) {
    entries.append(ORGANIZER_FIELDS.roles, "__other_option__");
    entries.set(`${ORGANIZER_FIELDS.roles}.other_option_response`, other);
  }
  for (const key of ["year", "hours", "roles"]) {
    entries.set(`${ORGANIZER_FIELDS[key]}_sentinel`, "");
  }
  entries.set("fvv", "1");
  entries.set("pageHistory", "0");
  return entries;
}
export function prefilledUrl(entries) {
  const url = new URL(RESPONDER_URL);
  url.searchParams.set("usp", "pp_url");
  for (const [name, value] of entries) {
    if (name.startsWith("entry.") && !name.endsWith("_sentinel"))
      url.searchParams.append(name, value);
  }
  return url.href;
}

const form = document.querySelector("#organizer-form");
if (form) {
  const username = form.elements.username;
  const status = document.querySelector("#organizer-status");
  const submit = form.querySelector("[type=submit]");
  const fallback = document.querySelector("#google-fallback");
  const fields = document.querySelector("#organizer-fields");
  const review = document.querySelector("#organizer-review");
  let submitting = false;
  let lastSent = "";
  const scrollToForm = () => {
    form.scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  const showConfirmation = () => {
    fallback.hidden = true;
    status.dataset.kind = "sent";
    status.textContent =
      "Thanks for your interest in helping make Hacktech happen. Your interest has been sent. Look out for an email from Hacktech in your Caltech inbox within 1–2 weeks with next steps and kickoff meeting details.";
    status.focus({ preventScroll: true });
    fields.inert = true;
    form.dataset.state = "sent";
    review.hidden = false;
    scrollToForm();
  };
  review.addEventListener("click", () => {
    fields.inert = false;
    delete form.dataset.state;
    status.textContent = "";
    delete status.dataset.kind;
    review.hidden = true;
    form.elements.name.focus({ preventScroll: true });
    scrollToForm();
  });
  const normalize = () => {
    username.value = normalizeUsername(username.value);
    username.setCustomValidity("");
  };
  username.addEventListener("input", normalize);
  username.addEventListener("blur", normalize);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    normalize();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    let entries;
    try {
      entries = buildOrganizerEntries(data);
    } catch (error) {
      username.setCustomValidity(error.message);
      username.reportValidity();
      return;
    }
    fallback.href = prefilledUrl(entries);
    if (entries.toString() === lastSent) {
      showConfirmation();
      return;
    }
    submitting = true;
    submit.disabled = true;
    submit.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");
    status.textContent = "";
    try {
      await sendToGoogleForm(form.action, entries);
      lastSent = entries.toString();
      // Collapse rather than discard answers: the opaque response cannot confirm storage.
      showConfirmation();
    } catch (error) {
      status.dataset.kind = "error";
      fallback.hidden = false;
      status.textContent =
        "We couldn’t confirm that your details were sent. Your answers are still here. Open the Google Form below to finish, or try again.";
      status.focus();
    } finally {
      submitting = false;
      form.removeAttribute("aria-busy");
      submit.disabled = false;
      submit.textContent = "Express interest";
    }
  });
}
