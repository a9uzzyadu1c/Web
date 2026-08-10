(function () {
  "use strict";

  var API_URL = "https://www.gamerpower.com/api/giveaways?platform=epic-games-store,steam&type=game&sort-by=date";

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

  fetch(API_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("Bad response");
      return res.json();
    })
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
