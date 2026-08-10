(function () {
  "use strict";

  var TARGET_URL = "https://www.gamerpower.com/api/giveaways?platform=epic-games-store,steam&type=game&sort-by=date";

  // GamerPower's API doesn't send CORS headers for browser fetches from
  // custom domains, so we route through a public CORS proxy. Multiple are
  // listed because free proxies go down or rate-limit often — if one
  // fails, the next is tried automatically.
  //
  // OPTIONAL BUT RECOMMENDED: if you deploy your own Cloudflare Worker
  // (free, and far more reliable than public proxies), paste its URL
  // here and it'll always be tried first.
  var OWN_WORKER_URL = ""; // e.g. "https://free-games.yourname.workers.dev"

  var PROXIES = [
    OWN_WORKER_URL,
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(TARGET_URL),
    "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(TARGET_URL),
    "https://thingproxy.freeboard.io/fetch/" + TARGET_URL,
    "https://cors.eu.org/" + TARGET_URL
  ].filter(Boolean);

  var epicEl = document.getElementById("epicGames");
  var steamEl = document.getElementById("steamGames");
  if (!epicEl || !steamEl) return;

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function statusMessage(text, linkHref, linkText) {
    var p = document.createElement("p");
    p.className = "games-status";
    p.textContent = text + " ";
    if (linkHref) {
      var a = document.createElement("a");
      a.href = linkHref;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = linkText || linkHref;
      p.appendChild(a);
    }
    return p;
  }

  function gameCard(g) {
    var article = document.createElement("article");
    article.className = "card game-card";

    var img = g.thumbnail || g.image;
    var worthText = g.worth && g.worth !== "N/A" && g.worth !== "" ? g.worth + " value" : "Free right now";
    var endText = g.end_date && g.end_date !== "N/A" ? "Ends " + g.end_date.split(" ")[0] : "No end date listed";
    var claimUrl = g.open_giveaway_url || g.gamerpower_url || "https://www.gamerpower.com";

    article.innerHTML =
      (img ? '<img class="game-card__thumb" src="' + escapeHTML(img) + '" alt="" loading="lazy">' : "") +
      "<h3>" + escapeHTML(g.title || "Untitled giveaway") + "</h3>" +
      '<p class="game-card__worth">' + escapeHTML(worthText) + "</p>" +
      '<p class="game-card__end">' + escapeHTML(endText) + "</p>" +
      '<a class="card__link" href="' + escapeHTML(claimUrl) + '" target="_blank" rel="noopener">' +
      "<span>Claim now</span>" +
      '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8h9M8.5 3.5 13 8l-4.5 4.5"/></svg>' +
      "</a>";

    return article;
  }

  function render(container, games) {
    container.innerHTML = "";
    if (!games.length) {
      container.appendChild(statusMessage("Nothing free here right now — check back soon."));
      return;
    }
    games.forEach(function (g) {
      container.appendChild(gameCard(g));
    });
  }

  function fetchWithTimeout(url, ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, ms);
    return fetch(url, { signal: controller.signal }).finally(function () {
      clearTimeout(timer);
    });
  }

  function tryProxy(i) {
    if (i >= PROXIES.length) return Promise.reject(new Error("all proxies failed"));
    return fetchWithTimeout(PROXIES[i], 7000)
      .then(function (res) {
        if (!res.ok) throw new Error("bad status");
        return res.text();
      })
      .then(function (text) {
        return JSON.parse(text);
      })
      .catch(function () {
        return tryProxy(i + 1);
      });
  }

  tryProxy(0)
    .then(function (data) {
      var list = Array.isArray(data) ? data : (data && data.giveaways) || [];
      var epic = list.filter(function (g) {
        return /epic/i.test(g.platforms || "");
      });
      var steam = list.filter(function (g) {
        return /steam/i.test(g.platforms || "");
      });
      render(epicEl, epic);
      render(steamEl, steam);
    })
    .catch(function () {
      epicEl.innerHTML = "";
      steamEl.innerHTML = "";
      epicEl.appendChild(
        statusMessage("Couldn't load giveaways right now.", "https://www.gamerpower.com/giveaways?platform=epic-games-store", "See them on GamerPower.com")
      );
      steamEl.appendChild(
        statusMessage("Couldn't load giveaways right now.", "https://www.gamerpower.com/giveaways?platform=steam", "See them on GamerPower.com")
      );
    });
})();
