import { demoAccounts, DEMO_PASSWORD } from "../auth.js";
import { escapeHTML, icon } from "../ui.js";

export function render() {
  return `<main class="login-layout">
    <section class="login-brand-panel">
      <a class="brand login-brand" href="/login" aria-label="DirectGas"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.2 2.8c.5 4-4.1 5.3-4.1 9.2 0 1.5 1 2.5 2.3 2.5 1.8 0 2.8-1.6 2.5-3.5 2.4 1.6 3.8 3.7 3.8 6.1a5.8 5.8 0 0 1-11.6 0c0-5.8 6.2-8.5 7.1-14.3Z" fill="white"/><path d="M12.1 21a2.8 2.8 0 0 0 2.8-2.8c0-1.1-.6-2-1.7-2.9-.1 1.9-2.7 2-2.7 3.7 0 1.1.7 2 1.6 2Z" fill="#9FE5C9"/></svg></span><span class="brand-name">direct<span>gas</span></span></a>
      <div class="login-brand-copy"><div class="eyebrow">Supply chain intelligence</div><h1>One connected view of LPG demand.</h1><p>Demand signals connect customer choices, supplier planning and platform oversight across the network.</p><div class="login-stats"><div><strong>01</strong><span>Customer-led orders</span></div><div><strong>02</strong><span>Demand intelligence</span></div><div><strong>03</strong><span>Supply visibility</span></div></div></div>
      <div class="login-disclaimer">Competition demo · Fictional accounts and data · No real LPG orders, payments or deliveries</div>
    </section>
    <section class="login-form-panel"><div class="login-form-card">
      <div class="eyebrow">Welcome to DirectGas</div><h2>Sign in to your workspace</h2><p class="login-subtitle">Choose your demo role to explore the connected platform.</p>
      <form id="loginForm" novalidate><div class="field"><label for="loginEmail">Email address</label><input id="loginEmail" type="email" name="email" autocomplete="username" required placeholder="you@directgas.rw"></div><div class="field"><label for="loginPassword">Password</label><div class="password-wrap"><input id="loginPassword" type="password" name="password" autocomplete="current-password" required placeholder="Enter demo password"><button class="password-toggle" id="togglePassword" type="button" aria-label="Show password">${icon("eye", 16)}</button></div></div><div class="login-error" id="loginError" role="alert" hidden></div><button class="btn btn-primary login-submit" type="submit">Sign in <span aria-hidden="true">→</span></button></form>
      <div class="demo-access"><div class="demo-access-heading"><span>Quick access</span><span class="status predicted">Demo accounts</span></div><div class="demo-account-list">${demoAccounts.map(account => `<button class="demo-account" type="button" data-demo-role="${account.role}"><span class="demo-account-icon">${account.initials}</span><span><strong>${escapeHTML(account.label)}</strong><small>${escapeHTML(account.email)}</small></span><span class="demo-account-arrow">→</span></button>`).join("")}</div><div class="demo-password"><span>Shared demo password</span><code>${escapeHTML(DEMO_PASSWORD)}</code></div></div>
      <div class="auth-warning"><strong>Demo authentication only</strong><br>Credentials and role checks run in your browser. This is not production authentication or server-enforced authorization.</div>
    </div></section>
  </main>`;
}

export function mount({ onLogin }) {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const error = document.getElementById("loginError");
  const submit = (requestedEmail = email.value, requestedPassword = password.value) => {
    try {
      error.hidden = true;
      onLogin(requestedEmail, requestedPassword);
    } catch (loginError) {
      error.textContent = loginError.message;
      error.hidden = false;
    }
  };
  form.addEventListener("submit", event => {
    event.preventDefault();
    submit();
  });
  document.getElementById("togglePassword").addEventListener("click", event => {
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    event.currentTarget.setAttribute("aria-label", visible ? "Hide password" : "Show password");
  });
  document.querySelectorAll("[data-demo-role]").forEach(button => button.addEventListener("click", () => {
    const account = demoAccounts.find(item => item.role === button.dataset.demoRole);
    if (!account) return;
    email.value = account.email;
    password.value = DEMO_PASSWORD;
    submit(account.email, DEMO_PASSWORD);
  }));
}
