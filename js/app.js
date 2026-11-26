(function () {
  "use strict";

  var CFG = window.ANIVERSARIO || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fechas ---------- */
  function parseDay(str) {
    var p = String(str || "").split("-");
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? null : d;
  }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function daysBetween(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); }
  var fmt = new Intl.NumberFormat("es-ES");
  function num(n) { return n >= 1000 && n < 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : fmt.format(n); }

  var inicio = parseDay(CFG.inicio) || new Date(2022, 10, 28);
  var viaje = parseDay(CFG.viaje) || new Date(2026, 10, 28);
  var hoy = today();
  var esHoy = daysBetween(hoy, viaje) === 0;

  /* ---------- Nombres y firma ---------- */
  if (CFG.nombres) $$("[data-nombres]").forEach(function (el) { el.textContent = CFG.nombres; });
  if (CFG.firma) { var f = $("[data-firma]"); f.textContent = CFG.firma; f.hidden = false; }

  /* ---------- Cuenta atrás y días juntos ---------- */
  var cuenta = $("[data-cuenta-atras]");
  var faltan = daysBetween(hoy, viaje);
  if (cuenta) {
    if (faltan > 1) cuenta.innerHTML = "Faltan <strong>" + num(faltan) + " días</strong> para el sábado 28 de noviembre.";
    else if (faltan === 1) cuenta.innerHTML = "<strong>Mañana</strong> es el día.";
    else if (faltan === 0) cuenta.innerHTML = "<strong>Hoy</strong> es el día. Feliz aniversario.";
    else cuenta.textContent = "Fue el sábado 28 de noviembre de 2026.";
  }
  var diasEl = $("[data-dias]");
  if (diasEl) diasEl.textContent = num(daysBetween(inicio, viaje));

  /* ---------- Imprimir ---------- */
  function eagerImages() { $$("img[loading='lazy']").forEach(function (img) { img.loading = "eager"; }); }
  window.addEventListener("beforeprint", eagerImages);
  $$("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () {
      eagerImages();
      var pending = $$(".leaves img").filter(function (i) { return !i.complete; });
      var done = 0, fired = false;
      var go = function () { if (!fired) { fired = true; window.print(); } };
      if (!pending.length) return go();
      pending.forEach(function (i) { i.addEventListener("load", function () { if (++done === pending.length) go(); }, { once: true }); i.addEventListener("error", function () { if (++done === pending.length) go(); }, { once: true }); });
      setTimeout(go, 2500);
    });
  });

  /* ---------- Tapa que se abre con el scroll ---------- */
  var stage = $(".stage");
  var cover = $(".cover");
  if (stage && cover && !reduceMotion) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var range = stage.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, window.scrollY / (range * 0.8)));
      var e = 1 - Math.pow(1 - p, 2);
      cover.style.transform = "rotateY(" + (-112 * e).toFixed(2) + "deg)";
      cover.style.setProperty("--shade", (e * 0.55).toFixed(3));
      cover.style.visibility = p >= 1 ? "hidden" : "visible";
      cover.style.pointerEvents = p > 0.4 ? "none" : "";
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
  var openLink = $("[data-open]");
  if (openLink) {
    openLink.addEventListener("click", function (ev) {
      ev.preventDefault();
      var target = reduceMotion ? $(".endpaper") : null;
      if (target) { target.scrollIntoView(); return; }
      var range = stage.offsetHeight - window.innerHeight;
      window.scrollTo({ top: range * 0.85, behavior: "smooth" });
    });
  }

  /* ---------- Paradas, raíl de horas y "ahora" ---------- */
  var stops = $$("[data-stop]");
  var railList = $("[data-rail]");
  var railNow = $("[data-rail-now]");
  var railLinks = [];

  stops.forEach(function (s) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + s.id;
    a.innerHTML = s.dataset.start + '<span class="rail__label"></span>';
    a.querySelector(".rail__label").textContent = s.dataset.name;
    li.appendChild(a);
    railList.appendChild(li);
    railLinks.push(a);
  });

  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  var nowIndex = -1;
  function markNow() {
    if (!esHoy) return;
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    var idx = -1;
    stops.forEach(function (s, i) {
      if (m >= toMin(s.dataset.start) && m < toMin(s.dataset.end)) idx = i;
    });
    if (idx === nowIndex) return;
    nowIndex = idx;
    stops.forEach(function (s, i) {
      s.classList.toggle("is-now", i === idx);
      railLinks[i].classList.toggle("is-now", i === idx);
      var old = s.querySelector(".now-badge"); if (old) old.remove();
      if (i === idx) {
        var b = document.createElement("span");
        b.className = "now-badge"; b.textContent = "Ahora";
        s.querySelector(".stop__time").appendChild(b);
      }
    });
  }
  markNow();
  if (esHoy) setInterval(markNow, 60000);

  function setCurrent(i) {
    stops.forEach(function (s, j) { s.classList.toggle("is-current", j === i); });
    railLinks.forEach(function (a, j) {
      a.classList.toggle("is-current", j === i);
      if (j === i) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current");
    });
    if (railNow && stops[i]) {
      var s = stops[i];
      railNow.innerHTML = s.dataset.start + " – " + s.dataset.end + " · <b></b>" + (i === nowIndex ? " · ahora" : "");
      railNow.querySelector("b").textContent = s.dataset.name;
    }
  }

  if ("IntersectionObserver" in window) {
    var openIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-open"); openIO.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -25% 0px", threshold: 0.15 });
    stops.forEach(function (s) { openIO.observe(s); });
    $$("[data-reveal]").forEach(function (el) { openIO.observe(el); });

    var visible = new Map();
    var curIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible.set(en.target, en.isIntersecting ? en.intersectionRatio : 0); });
      var best = -1, bestR = 0;
      stops.forEach(function (s, i) { var r = visible.get(s) || 0; if (r > bestR) { bestR = r; best = i; } });
      if (best >= 0) setCurrent(best);
    }, { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] });
    stops.forEach(function (s) { curIO.observe(s); });

    var rail = $(".rail");
    new IntersectionObserver(function (en) {
      var on = en[0].isIntersecting;
      rail.classList.toggle("is-visible", on);
      if (railNow) railNow.classList.toggle("is-visible", on);
    }, { rootMargin: "-60px 0px -60% 0px" }).observe($("#el-dia"));
  } else {
    $(".rail").classList.add("is-visible");
    stops.forEach(function (s) { s.classList.add("is-open"); });
    $$("[data-reveal]").forEach(function (el) { el.classList.add("is-open"); });
  }

  /* ---------- Almacenamiento local (IndexedDB) ---------- */
  var DB = (function () {
    var dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise(function (res, rej) {
        try {
          var r = indexedDB.open("aniversario-album", 1);
          r.onupgradeneeded = function () {
            var db = r.result;
            if (!db.objectStoreNames.contains("musica")) db.createObjectStore("musica");
          };
          r.onsuccess = function () { res(r.result); };
          r.onerror = function () { rej(r.error); };
        } catch (e) { rej(e); }
      });
      return dbp;
    }
    function tx(store, mode, fn) {
      return open().then(function (db) {
        return new Promise(function (res, rej) {
          var t = db.transaction(store, mode), st = t.objectStore(store), out;
          var req = fn(st);
          if (req) req.onsuccess = function () { out = req.result; };
          t.oncomplete = function () { res(out); };
          t.onerror = function () { rej(t.error); };
          t.onabort = function () { rej(t.error); };
        });
      });
    }
    return {
      get: function (s, k) { return tx(s, "readonly", function (st) { return st.get(k); }); },
      put: function (s, v, k) { return tx(s, "readwrite", function (st) { return st.put(v, k); }); }
    };
  })();

  /* ---------- Música ---------- */
  var player = $("[data-player]");
  var audio = $("[data-audio]");
  var toggle = $("[data-player-toggle]");
  var panel = $("#player-panel");
  var playBtn = $("[data-play]");
  var playIcon = $("[data-play-icon] use");
  var vol = $("[data-volume]");
  var trackEl = $("[data-track]");
  var audioInput = $("[data-audio-input]");
  var errEl = $("[data-audio-error]");
  var currentUrl = null;

  toggle.addEventListener("click", function () {
    var open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
  });

  try { var sv = localStorage.getItem("aniversario-volumen"); if (sv !== null) vol.value = sv; } catch (e) {}
  audio.volume = +vol.value;
  vol.addEventListener("input", function () {
    audio.volume = +vol.value;
    try { localStorage.setItem("aniversario-volumen", vol.value); } catch (e) {}
  });

  function showError(msg) { errEl.textContent = msg; errEl.hidden = !msg; }

  function setSource(src, name) {
    audio.pause();
    if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
    if (src instanceof Blob) { currentUrl = URL.createObjectURL(src); audio.src = currentUrl; }
    else audio.src = src;
    trackEl.textContent = name || "Canción elegida";
    trackEl.title = trackEl.textContent;
    playBtn.disabled = false;
    showError("");
  }

  function syncPlayState() {
    var playing = !audio.paused && !audio.ended;
    playIcon.setAttribute("href", playing ? "#i-pause" : "#i-play");
    playBtn.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
    player.classList.toggle("is-playing", playing);
  }
  audio.addEventListener("play", syncPlayState);
  audio.addEventListener("pause", syncPlayState);
  audio.addEventListener("ended", syncPlayState);
  audio.addEventListener("error", function () {
    if (!audio.getAttribute("src")) return;
    showError("No se ha podido leer este archivo de audio. Prueba con un MP3, M4A u OGG.");
    playBtn.disabled = true;
  });

  playBtn.addEventListener("click", function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { showError("El navegador no ha permitido reproducir. Vuelve a pulsar."); });
    } else audio.pause();
  });

  audioInput.addEventListener("change", function () {
    var f = audioInput.files && audioInput.files[0];
    audioInput.value = "";
    if (!f) return;
    if (!/^audio\//.test(f.type) && !/\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)$/i.test(f.name)) {
      showError("Ese archivo no parece de audio.");
      return;
    }
    var name = f.name.replace(/\.[^.]+$/, "");
    setSource(f, name);
    DB.put("musica", { blob: f, name: name, base: CFG.cancion || "" }, "actual").catch(function () {});
  });

  // Recupera la última canción elegida en este navegador (sin reproducirla).
  // Si en config.js se ha puesto (o cambiado) la canción, esa tiene prioridad.
  DB.get("musica", "actual").then(function (row) {
    var vigente = row && row.blob && (row.base || "") === (CFG.cancion || "");
    if (vigente) setSource(row.blob, row.name);
    else if (CFG.cancion) setSource(CFG.cancion, CFG.tituloCancion || "Nuestra canción");
  }).catch(function () {
    if (CFG.cancion) setSource(CFG.cancion, CFG.tituloCancion || "Nuestra canción");
  });
})();
