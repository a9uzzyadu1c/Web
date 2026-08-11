(function () {
  "use strict";

  var input = document.getElementById("nameInput");
  var fontList = document.getElementById("fontList");
  if (!input || !fontList) return;

  /* ============================================================
     Mathematical Alphanumeric Symbols (U+1D400–U+1D7FF).
     Each style is 52 sequential code points (A-Z then a-z), with a
     handful of reserved slots that fall back to pre-existing
     "letterlike symbol" characters — that's standard Unicode, not
     a bug in this code.
     ============================================================ */

  var MATH_BASE = {
    bold: 0x1D400, italic: 0x1D434, boldItalic: 0x1D468, script: 0x1D49C,
    boldScript: 0x1D4D0, fraktur: 0x1D504, doubleStruck: 0x1D538,
    boldFraktur: 0x1D56C, sans: 0x1D5A0, sansBold: 0x1D5D4,
    sansItalic: 0x1D608, sansBoldItalic: 0x1D63C, monospace: 0x1D670
  };
  var DIGIT_BASE = {
    bold: 0x1D7CE, doubleStruck: 0x1D7D8, sans: 0x1D7E2, sansBold: 0x1D7EC, monospace: 0x1D7F6
  };
  var MATH_EXCEPTIONS = {
    italic: { h: "\u210E" },
    script: {
      B: "\u212C", E: "\u2130", F: "\u2131", H: "\u210B", I: "\u2110", L: "\u2112", M: "\u2133", R: "\u211B",
      e: "\u212F", g: "\u210A", o: "\u2134"
    },
    fraktur: { C: "\u212D", H: "\u210C", I: "\u2111", R: "\u211C", Z: "\u2128" },
    doubleStruck: { C: "\u2102", H: "\u210D", N: "\u2115", P: "\u2119", Q: "\u211A", R: "\u211D", Z: "\u2124" }
  };

  function mathStyle(styleKey, digitKey) {
    var base = MATH_BASE[styleKey];
    var dbase = digitKey ? DIGIT_BASE[digitKey] : null;
    var exc = MATH_EXCEPTIONS[styleKey] || {};
    return function (text) {
      var out = "";
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (exc[ch]) { out += exc[ch]; continue; }
        if (ch >= "A" && ch <= "Z") out += String.fromCodePoint(base + (ch.charCodeAt(0) - 65));
        else if (ch >= "a" && ch <= "z") out += String.fromCodePoint(base + 26 + (ch.charCodeAt(0) - 97));
        else if (ch >= "0" && ch <= "9" && dbase) out += String.fromCodePoint(dbase + (ch.charCodeAt(0) - 48));
        else out += ch;
      }
      return out;
    };
  }

  /* ---------------- lookup-table styles ---------------- */

  var SMALL_CAPS = {
    a: "\u1D00", b: "\u0299", c: "\u1D04", d: "\u1D05", e: "\u1D07", f: "\uA730", g: "\u0262",
    h: "\u029C", i: "\u026A", j: "\u1D0A", k: "\u1D0B", l: "\u029F", m: "\u1D0D", n: "\u0274",
    o: "\u1D0F", p: "\u1D18", r: "\u0280", t: "\u1D1B", u: "\u1D1C", v: "\u1D20", w: "\u1D21",
    y: "\u028F", z: "\u1D22"
  };
  function smallCaps(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var lower = text[i].toLowerCase();
      out += SMALL_CAPS[lower] || text[i];
    }
    return out;
  }

  function circledStyle(upperBase, lowerBase, zeroPoint, oneBase) {
    return function (text) {
      var out = "";
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch >= "A" && ch <= "Z") out += String.fromCodePoint(upperBase + (ch.charCodeAt(0) - 65));
        else if (ch >= "a" && ch <= "z" && lowerBase) out += String.fromCodePoint(lowerBase + (ch.charCodeAt(0) - 97));
        else if (ch >= "a" && ch <= "z") out += String.fromCodePoint(upperBase + (ch.charCodeAt(0) - 97));
        else if (ch === "0" && zeroPoint) out += String.fromCodePoint(zeroPoint);
        else if (ch >= "1" && ch <= "9" && oneBase) out += String.fromCodePoint(oneBase + (ch.charCodeAt(0) - 49));
        else out += ch;
      }
      return out;
    };
  }
  var circled = circledStyle(0x24B6, 0x24D0, 0x24EA, 0x2460);
  var circledDark = circledStyle(0x1F150, null, null, null);
  var squared = circledStyle(0x1F130, null, null, null);
  var squaredDark = circledStyle(0x1F170, null, null, null);

  function fullwidth(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch >= "A" && ch <= "Z") out += String.fromCodePoint(0xFF21 + (ch.charCodeAt(0) - 65));
      else if (ch >= "a" && ch <= "z") out += String.fromCodePoint(0xFF41 + (ch.charCodeAt(0) - 97));
      else if (ch >= "0" && ch <= "9") out += String.fromCodePoint(0xFF10 + (ch.charCodeAt(0) - 48));
      else if (ch === " ") out += "\u3000";
      else out += ch;
    }
    return out;
  }

  var FLIP = {
    a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183", h: "\u0265",
    i: "\u1D09", j: "\u027E", k: "\u029E", l: "\uA781", m: "\u026F", n: "u", o: "o", p: "d",
    q: "b", r: "\u0279", s: "s", t: "\u0287", u: "n", v: "\u028C", w: "\u028D", x: "x",
    y: "\u028E", z: "z",
    "1": "\u0196", "2": "\u1105", "3": "\u0190", "4": "\u3123", "6": "9", "7": "\u3125", "9": "6"
  };
  function upsideDown(text) {
    var chars = text.split("").reverse();
    var out = "";
    for (var i = 0; i < chars.length; i++) {
      var lower = chars[i].toLowerCase();
      out += FLIP[lower] || chars[i];
    }
    return out;
  }

  function strikethrough(text) {
    if (!text) return "";
    return text.split("").join("\u0336") + "\u0336";
  }
  function underline(text) {
    if (!text) return "";
    return text.split("").join("\u0332") + "\u0332";
  }
  function wideSpaced(text) {
    return text.split("").join(" ");
  }

  /* ---------------- style list ---------------- */

  var bold = mathStyle("bold", "bold");
  var italic = mathStyle("italic", null);
  var boldItalic = mathStyle("boldItalic", null);
  var script = mathStyle("script", null);
  var boldScript = mathStyle("boldScript", null);
  var fraktur = mathStyle("fraktur", null);
  var boldFraktur = mathStyle("boldFraktur", null);
  var doubleStruck = mathStyle("doubleStruck", "doubleStruck");
  var sans = mathStyle("sans", "sans");
  var sansBold = mathStyle("sansBold", "sansBold");
  var sansItalic = mathStyle("sansItalic", null);
  var sansBoldItalic = mathStyle("sansBoldItalic", null);
  var monospace = mathStyle("monospace", "monospace");

  var STYLES = [
    { label: "Bold", run: bold },
    { label: "Italic", run: italic },
    { label: "Bold Italic", run: boldItalic },
    { label: "Script", run: script },
    { label: "Bold Script", run: boldScript },
    { label: "Fraktur", run: fraktur },
    { label: "Bold Fraktur", run: boldFraktur },
    { label: "Double-Struck", run: doubleStruck },
    { label: "Sans-Serif", run: sans },
    { label: "Sans Bold", run: sansBold },
    { label: "Sans Italic", run: sansItalic },
    { label: "Sans Bold Italic", run: sansBoldItalic },
    { label: "Monospace", run: monospace },
    { label: "Small Caps", run: smallCaps },
    { label: "Circled", run: circled },
    { label: "Circled Dark", run: circledDark },
    { label: "Squared", run: squared },
    { label: "Squared Dark", run: squaredDark },
    { label: "Fullwidth", run: fullwidth },
    { label: "Upside Down", run: upsideDown },
    { label: "Strikethrough", run: strikethrough },
    { label: "Underline", run: underline },
    { label: "Wide Spaced", run: wideSpaced },
    { label: "Crown", run: function (t) { return "『♛" + bold(t) + "♛』"; } },
    { label: "Skull", run: function (t) { return "☠" + smallCaps(t) + "☠"; } },
    { label: "Leaf", run: function (t) { return "❀" + t + "❀"; } },
    { label: "Blade", run: function (t) { return "▄︻デ══━一 " + t; } },
    { label: "Star Flow", run: function (t) { return "☆彡" + t + "彡☆"; } },
    { label: "Boxed", run: function (t) { return "『" + t + "』"; } }
  ];

  /* ---------------- render ---------------- */

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function copyIconSVG() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';
  }

  function copyText(text, btn) {
    function done() {
      btn.classList.add("is-copied");
      setTimeout(function () { btn.classList.remove("is-copied"); }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      done();
    }
  }

  function renderFonts(name) {
    fontList.innerHTML = "";
    if (!name) {
      fontList.innerHTML = '<p class="tool-empty">Type a name above to see it in different fonts.</p>';
      return;
    }
    STYLES.forEach(function (style) {
      var text;
      try { text = style.run(name); } catch (e) { text = name; }

      var row = document.createElement("div");
      row.className = "font-row";
      row.innerHTML =
        '<div class="font-row__meta">' +
        '<span class="font-row__label">' + escapeHTML(style.label) + "</span>" +
        '<span class="font-row__text">' + escapeHTML(text) + "</span>" +
        "</div>" +
        '<button class="copy-btn" type="button" aria-label="Copy ' + escapeHTML(style.label) + '">' + copyIconSVG() + "</button>";

      var btn = row.querySelector(".copy-btn");
      btn.addEventListener("click", function () { copyText(text, btn); });
      fontList.appendChild(row);
    });
  }

  input.addEventListener("input", function () {
    renderFonts(input.value.trim());
  });

  /* ---------------- tabs ---------------- */

  var tabBtns = document.querySelectorAll(".tab-btn");
  var panels = document.querySelectorAll(".tab-panel");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var target = btn.getAttribute("data-tab");
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== target;
      });
    });
  });

  /* ---------------- symbol copy ---------------- */

  var symbolsPanel = document.getElementById("symbolsPanel");
  if (symbolsPanel) {
    symbolsPanel.addEventListener("click", function (e) {
      var btn = e.target.closest(".symbol-btn");
      if (!btn) return;
      copyText(btn.textContent, btn);
    });
  }
})();
