/** CSS crítico móvil — va inline en el HTML para funcionar aunque el bundle esté desactualizado */
export const MOBILE_LAYOUT_FIX_CSS = `
@media (max-width: 1023px) {
  html, body {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    margin: 0 !important;
  }
  aside.fixed,
  .lsa-sidebar {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  .pl-64,
  main.pl-64,
  .lsa-main {
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
  main,
  .lsa-main,
  .lsa-shell,
  .lsa-content {
    width: 100% !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
  .lsa-mobile-header {
    display: flex !important;
    width: 100% !important;
  }
  .lsa-mobile-nav {
    display: block !important;
  }
}
@media (min-width: 1024px) {
  .lsa-mobile-header,
  .lsa-mobile-nav {
    display: none !important;
  }
  .lsa-sidebar {
    display: flex !important;
  }
  .lsa-main {
    padding-left: 16rem !important;
  }
}
`.trim();
