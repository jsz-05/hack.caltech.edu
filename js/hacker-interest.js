(() => {
  const dialog = document.querySelector('#hacker-interest');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const form = dialog.querySelector('#hacker-interest-form');
  const fields = dialog.querySelector('#hacker-interest-fields');
  const sent = dialog.querySelector('#hacker-interest-sent');
  const status = dialog.querySelector('#hacker-interest-status');
  const fallback = dialog.querySelector('#hacker-interest-fallback');
  const submit = form.querySelector('[type="submit"]');
  const video = dialog.querySelector('.hacker-interest-video');
  const inputs = [...form.querySelectorAll('input:not([type="hidden"])')];
  let opener;
  let submitting = false;
  let dispatched = false;

  document.querySelectorAll('[data-hacker-interest]').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      video.src = video.dataset.src;
      dialog.showModal();
      dialog.scrollTop = 0;
      if (dispatched) dialog.querySelector('[data-hacker-interest-done]').focus();
    });
  });
  dialog.querySelector('.hacker-interest-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-hacker-interest-done]').addEventListener('click', () => dialog.close());
  // Only dismiss a complete click on the backdrop, not a drag from inside the form.
  let backdropStart = false;
  dialog.addEventListener('pointerdown', (event) => { backdropStart = event.target === dialog; });
  dialog.addEventListener('click', (event) => {
    if (backdropStart && event.target === dialog) dialog.close();
    backdropStart = false;
  });
  dialog.addEventListener('close', () => {
    video.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  inputs.forEach((input) => input.addEventListener('blur', () => { input.value = input.value.trim(); }));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || dispatched) return;
    inputs.forEach((input) => { input.value = input.value.trim(); });
    if (!form.reportValidity()) return;

    // The input names are Google's entry IDs, just like the organizer form.
    const entries = new URLSearchParams(new FormData(form));
    const fallbackUrl = new URL(form.action.replace(/\/formResponse$/, '/viewform'));
    fallbackUrl.searchParams.set('usp', 'pp_url');
    for (const [name, value] of entries) {
      if (name.startsWith('entry.')) fallbackUrl.searchParams.set(name, value);
    }
    fallback.href = fallbackUrl.href;
    fallback.hidden = true;
    status.textContent = '';
    submitting = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    inputs.forEach((input) => { input.readOnly = true; });
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      // Same public responder POST as organizer.js. The opaque response confirms
      // dispatch only, so do not claim the response was verified as saved.
      await fetch(form.action, {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: entries,
        signal: controller.signal,
      });
      dispatched = true;
      fields.hidden = true;
      sent.hidden = false;
      status.dataset.kind = 'sent';
      status.textContent = 'Your details have been sent.';
      if (dialog.open) status.focus();
    } catch {
      fallback.hidden = false;
      status.dataset.kind = 'error';
      status.textContent = 'We couldn’t confirm your details were sent. Your answers are still here. Try again or finish in Google Forms below.';
      if (dialog.open) status.focus();
    } finally {
      clearTimeout(timeout);
      submitting = false;
      submit.disabled = false;
      submit.textContent = 'Register interest';
      inputs.forEach((input) => { input.readOnly = false; });
      form.removeAttribute('aria-busy');
    }
  });
})();
