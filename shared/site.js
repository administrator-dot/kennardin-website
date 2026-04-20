const FALLBACK_HEADER = `
<header class="blue-header site-header">
  <div class="top-brand">
    <div class="container">
      <div class="d-flex align-items-center gap-3">
        <a href="index.html" aria-label="Go to home page">
          <img src="images/final-web-seal.png" alt="Town of Kennard Logo" width="140">
        </a>
        <div class="flex-grow-1 text-center">
          <h3 class="text-white mb-0">Town of Kennard, Indiana</h3>
          <h1 id="site-page-title" class="site-page-title"></h1>
        </div>
        <div class="position-relative site-search-wrap">
          <label class="visually-hidden" for="site-search-input">Search the site</label>
          <input
            type="text"
            id="site-search-input"
            placeholder="Search the site..."
            class="form-control"
            autocomplete="off"
          >
          <div id="site-search-results" class="site-search-results"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="menu-bar">
    <nav class="navbar navbar-expand-lg">
      <div class="container">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item"><a class="nav-link text-white" href="index.html">Home</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">Local Government</a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="town-board.html">Town Board</a></li>
                <li><a class="dropdown-item" href="minutes-agendas.html">Minutes & Agendas</a></li>
                <li><a class="dropdown-item" href="town-ordinances.html">Town Ordinances</a></li>
              </ul>
            </li>
            <li class="nav-item"><a class="nav-link text-white" href="town-utilities.html">Town Utilities</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">Departments & Services</a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="police-department.html">Police Department</a></li>
                <li><a class="dropdown-item" href="fire-department.html">Fire Department</a></li>
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">Community</a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="kennard.html">Kennard</a></li>
                <li><a class="dropdown-item" href="local-schools.html">Local Schools</a></li>
                <li><a class="dropdown-item" href="local-churches.html">Local Churches</a></li>
                <li><a class="dropdown-item" href="local-business.html">Local Business</a></li>
              </ul>
            </li>
            <li class="nav-item"><a class="nav-link text-white" href="contact.html">Contact</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="faq.html">FAQ</a></li>
            <li class="nav-item"><a class="nav-link text-white" href="bids-info.html">Bids & Info</a></li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</header>
`;

const FALLBACK_FOOTER = '<footer>(c) 2026 Town of Kennard</footer>';

async function loadFragment(path, fallbackMarkup) {
  // Browsers block fetch() for file:// pages, so use the inline fallback there.
  if (window.location.protocol === "file:") return fallbackMarkup;
  try {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error("Fragment fetch failed");
    return await response.text();
  } catch {
    return fallbackMarkup;
  }
}

async function injectSharedLayout() {
  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");

  if (headerHost) {
    headerHost.innerHTML = await loadFragment("shared/header.html", FALLBACK_HEADER);
  }

  if (footerHost) {
    footerHost.innerHTML = await loadFragment("shared/footer.html", FALLBACK_FOOTER);
  }
}

function setPageTitle() {
  const titleNode = document.getElementById("site-page-title");
  if (!titleNode) return;

  const explicit = document.body.dataset.pageTitle;
  const derived = document.title.split("-")[0].trim();
  const pageTitle = explicit || derived;

  if (pageTitle.toLowerCase() === "home") {
    titleNode.textContent = "Welcome to the Town of Kennard, Indiana";
  } else {
    titleNode.textContent = pageTitle;
  }
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".navbar-nav a.nav-link, .navbar-nav a.dropdown-item");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
      const dropdown = link.closest(".dropdown");
      if (dropdown) {
        const trigger = dropdown.querySelector(".nav-link.dropdown-toggle");
        if (trigger) trigger.classList.add("active");
      }
    }
  });
}

function initSearch() {
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("site-search-results");
  if (!input || !results) return;

  fetch("search.json")
    .then((response) => response.json())
    .then((items) => {
      const normalized = items.map((item) => ({
        title: item.title || "",
        url: item.url || "#",
        content: (item.content || "").toLowerCase(),
      }));

      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        results.innerHTML = "";

        if (query.length < 2) {
          results.style.display = "none";
          return;
        }

        const filtered = normalized
          .filter((item) => item.title.toLowerCase().includes(query) || item.content.includes(query))
          .slice(0, 8);

        if (filtered.length === 0) {
          results.innerHTML = '<div class="p-2 text-muted">No results found.</div>';
        } else {
          const list = filtered
            .map(
              (item) =>
                '<a href="' +
                item.url +
                '" class="d-block p-2 text-decoration-none border-bottom">' +
                item.title +
                "</a>"
            )
            .join("");
          results.innerHTML = list;
        }

        results.style.display = "block";
      });

      document.addEventListener("click", (event) => {
        if (!results.contains(event.target) && event.target !== input) {
          results.style.display = "none";
        }
      });
    })
    .catch(() => {
      results.innerHTML = '<div class="p-2 text-muted">Search is temporarily unavailable.</div>';
      results.style.display = "block";
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  await injectSharedLayout();
  setPageTitle();
  setActiveNavLink();
  initSearch();
});
