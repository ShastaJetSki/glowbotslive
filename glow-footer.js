/**
 * glow-footer.js
 * Drop this file in your project root and add:
 *   <script src="glow-footer.js"></script>
 * before </body> on every page.
 *
 * Automatically injects the glow-bots image and "Powered by" tag
 * as a fixed footer at the bottom of every page.
 */
(function () {
  /* ── Inject styles ── */
  var style = document.createElement('style');
  style.textContent = `
    #glow-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      padding-bottom: 6px;
    }
    #glow-footer .gf-bots {
      width: 110px;
      display: block;
      filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.5));
      margin-bottom: 2px;
    }
    #glow-footer .gf-powered {
      font-size: 10px;
      color: rgba(180, 180, 190, 0.65);
      font-family: system-ui, -apple-system, sans-serif;
      letter-spacing: 0.4px;
      pointer-events: all;
    }
    #glow-footer .gf-powered a {
      color: rgba(200, 200, 210, 0.7);
      text-decoration: none;
      font-weight: 600;
    }
    #glow-footer .gf-powered a:hover {
      color: #DC2626;
    }
    /* Give pages enough bottom padding so the footer doesn't overlap content */
    body {
      padding-bottom: max(80px, env(safe-area-inset-bottom, 80px)) !important;
    }
  `;
  document.head.appendChild(style);

  /* ── Inject HTML ── */
  var footer = document.createElement('div');
  footer.id = 'glow-footer';
  footer.innerHTML = `
    <img class="gf-bots" src="glow-bots.png" alt="">
    <div class="gf-powered">
      Powered by <a href="https://www.anthropic.com" target="_blank" rel="noopener">Claude AI &middot; Anthropic</a>
    </div>
  `;
  document.body.appendChild(footer);
})();
