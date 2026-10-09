(() => {
  const button = document.getElementById("donation-interest");
  const status = document.getElementById("donation-status");
  const storageKey = "pwgl.donation-interest";
  let confirmed = false;

  const showThanks = () => {
    button.hidden = true;
    status.textContent = "Thanks for letting me know! Your interest helps me decide whether to add donations.";
  };

  try {
    confirmed = sessionStorage.getItem(storageKey) === "1";
  } catch {
    // Keep the button usable when browser storage is unavailable.
  }

  if (confirmed) showThanks();
  else button.hidden = false;

  button.addEventListener("click", () => {
    if (confirmed) return;
    confirmed = true;
    window.gtag("event", "donation_interest");
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // The in-memory guard still prevents repeated events on this page.
    }
    showThanks();
  });
})();
