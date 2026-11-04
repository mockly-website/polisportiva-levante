/* Polisportiva Levante — demo Mockly. Tutti i dati di partite e classifiche sono inventati. */
(function () {
  "use strict";

  var WA = "https://wa.me/393517578080";
  var riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GIORNI = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
  var GIORNI_LUNGHI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var MESI = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
  var MESI_LUNGHI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  var SETTIMANA = 7 * 864e5;

  /* ---------- Dati di esempio ---------- */
  var SPORT = {
    calcio: {
      nome: "Calcio", squadra: "Prima squadra", giorno: 0, ora: 15, minuti: 30,
      casa: "Campo di Via dell'Esempio 1",
      avversari: ["Real Esempio", "Esempio FC", "Atl. Esempio", "Virtus Prova", "Stella Demo", "Aurora Prova", "Sporting Demo"]
    },
    volley: {
      nome: "Volley", squadra: "Prima divisione", giorno: 6, ora: 18, minuti: 0,
      casa: "Palestra di Via dell'Esempio 1",
      avversari: ["Volley Prova", "Esempio PVC", "Demo Volley", "Aurora Demo", "Pall. Esempio", "Stella Prova", "Esempio VB"]
    },
    basket: {
      nome: "Basket", squadra: "Promozione", giorno: 5, ora: 21, minuti: 0,
      casa: "Palestra di Via dell'Esempio 1",
      avversari: ["Basket Prova", "Esempio BC", "Demo Basket", "Virtus Demo", "Real Prova", "Stella Esempio", "Aurora BC"]
    }
  };

  function seme(n) {
    var x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }

  function lunediDi(d) {
    var l = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var g = (l.getDay() + 6) % 7;
    l.setDate(l.getDate() - g);
    return l;
  }

  function generaPartite() {
    var ora = new Date();
    var lun = lunediDi(ora);
    var lista = [];
    Object.keys(SPORT).forEach(function (chiave, si) {
      var s = SPORT[chiave];
      var scarto = s.giorno === 0 ? 6 : s.giorno - 1;
      for (var k = -4; k <= 5; k++) {
        var d = new Date(lun.getFullYear(), lun.getMonth(), lun.getDate() + scarto + k * 7, s.ora, s.minuti);
        var sett = Math.floor(d.getTime() / SETTIMANA);
        var inCasa = sett % 2 === 0;
        var avv = s.avversari[(sett + si * 3) % s.avversari.length];
        var p = { sport: chiave, data: d, casa: inCasa, avversario: avv, luogo: inCasa ? s.casa : "In trasferta" };
        if (d.getTime() + 2 * 3600e3 < ora.getTime()) {
          var r1 = seme(sett + si * 100), r2 = seme(sett * 3 + si * 7 + 1);
          var noi, loro;
          if (chiave === "calcio") { noi = Math.floor(r1 * 4); loro = Math.floor(r2 * 3); }
          else if (chiave === "volley") { var vinto = r1 > 0.4; noi = vinto ? 3 : Math.floor(r2 * 3); loro = vinto ? Math.floor(r2 * 3) : 3; }
          else { noi = 58 + Math.floor(r1 * 30); loro = 55 + Math.floor(r2 * 30); if (noi === loro) noi += 3; }
          p.noi = noi; p.loro = loro;
          p.esito = noi > loro ? "v" : noi === loro ? "p" : "s";
        }
        lista.push(p);
      }
    });
    lista.sort(function (a, b) { return a.data - b.data; });
    return lista;
  }

  function prossime(lista) {
    var t = Date.now();
    return lista.filter(function (p) { return p.data.getTime() > t; });
  }

  function classifica(chiave) {
    var s = SPORT[chiave];
    var nomi = ["Levante"].concat(s.avversari);
    var pareggi = chiave === "calcio";
    var righe = nomi.map(function (n, i) {
      var g = 9;
      var v = Math.floor(seme(i * 11 + chiave.length * 5) * 7);
      if (v > g) v = g;
      var n2 = pareggi ? Math.min(g - v, Math.floor(seme(i * 13 + 2) * 3)) : 0;
      var pe = g - v - n2;
      var pt = chiave === "calcio" ? v * 3 + n2 : chiave === "volley" ? v * 3 : v * 2;
      return { nome: n, g: g, v: v, n: n2, p: pe, pt: pt, noi: i === 0 };
    });
    righe.sort(function (a, b) { return b.pt - a.pt || b.v - a.v || a.nome.localeCompare(b.nome); });
    return righe;
  }

  function nomeCasa(p) { return p.casa ? "Levante" : p.avversario; }
  function nomeOspite(p) { return p.casa ? p.avversario : "Levante"; }
  function due(n) { return (n < 10 ? "0" : "") + n; }
  function oraTesto(d) { return due(d.getHours()) + ":" + due(d.getMinutes()); }
  function dataLunga(d) { return GIORNI_LUNGHI[d.getDay()] + " " + d.getDate() + " " + MESI_LUNGHI[d.getMonth()]; }

  var PARTITE = generaPartite();

  /* ---------- Intestazione e menu ---------- */
  var testata = document.querySelector(".testata");
  if (testata) {
    var segnaTestata = function () { testata.classList.toggle("is-pieno", window.scrollY > 40); };
    segnaTestata();
    window.addEventListener("scroll", segnaTestata, { passive: true });
  }

  var menu = document.getElementById("menu");
  var velo = document.querySelector(".velo");
  var apri = document.querySelector(".btn-menu");
  if (menu && apri) {
    var chiudiBtn = menu.querySelector(".btn-chiudi");
    var ultimo = null;
    var apriMenu = function () {
      ultimo = document.activeElement;
      menu.classList.add("is-aperto");
      if (velo) velo.classList.add("is-aperto");
      menu.removeAttribute("inert");
      menu.setAttribute("aria-hidden", "false");
      apri.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("is-locked");
      setTimeout(function () { chiudiBtn.focus(); }, 30);
    };
    var chiudiMenu = function () {
      if (!menu.classList.contains("is-aperto")) return;
      menu.classList.remove("is-aperto");
      if (velo) velo.classList.remove("is-aperto");
      menu.setAttribute("inert", "");
      menu.setAttribute("aria-hidden", "true");
      apri.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("is-locked");
      if (ultimo && ultimo.focus) ultimo.focus();
    };
    apri.addEventListener("click", apriMenu);
    chiudiBtn.addEventListener("click", chiudiMenu);
    if (velo) velo.addEventListener("click", chiudiMenu);
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) chiudiMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") chiudiMenu();
      if (e.key === "Tab" && menu.classList.contains("is-aperto")) {
        var f = menu.querySelectorAll("a, button");
        var primo = f[0], ult = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); ult.focus(); }
        else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); primo.focus(); }
      }
    });
    window.matchMedia("(min-width: 64em)").addEventListener("change", function (m) { if (m.matches) chiudiMenu(); });
  }

  /* ---------- Ingressi in diagonale ---------- */
  var entranti = document.querySelectorAll(".entra");
  if ("IntersectionObserver" in window && !riduci) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add("is-dentro"); io.unobserve(v.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    entranti.forEach(function (el) { io.observe(el); });
  } else {
    entranti.forEach(function (el) { el.classList.add("is-dentro"); });
  }

  /* ---------- Tabellone a palette ---------- */
  var CARATTERI = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:./-";
  var LARGHEZZA = 12;

  function preparaTabellone(el) {
    var righe = el.querySelectorAll("[data-riga]");
    var celle = [];
    righe.forEach(function (riga, r) {
      riga.innerHTML = "";
      var lista = [];
      for (var i = 0; i < LARGHEZZA; i++) {
        var c = document.createElement("span");
        c.className = "cella" + (riga.hasAttribute("data-arancio") ? " cella--arancio" : "");
        var dentro = document.createElement("span");
        dentro.textContent = " ";
        c.appendChild(dentro);
        riga.appendChild(c);
        lista.push({ el: c, testo: dentro, ch: " ", giro: 0 });
      }
      celle.push(lista);
    });
    return celle;
  }

  function adatta(t) {
    t = t.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (t.length > LARGHEZZA) t = t.slice(0, LARGHEZZA);
    while (t.length < LARGHEZZA) t += " ";
    return t;
  }

  function scriviCella(c, ch) {
    c.ch = ch;
    c.testo.textContent = ch === " " ? " " : ch;
    c.giro = 1 - c.giro;
    c.el.classList.remove("flip-a", "flip-b");
    c.el.classList.add(c.giro ? "flip-a" : "flip-b");
  }

  var animazioneTab = null;
  var sicurezzaTab = null;
  function giraTabellone(celle, testi) {
    if (animazioneTab) cancelAnimationFrame(animazioneTab);
    var piano = [];
    var inizio = performance.now();
    var subito = riduci || document.hidden;
    celle.forEach(function (riga, r) {
      var obiettivo = adatta(testi[r] || "");
      riga.forEach(function (c, i) {
        var dest = obiettivo[i];
        if (subito) { c.ch = dest; c.testo.textContent = dest === " " ? " " : dest; return; }
        var passi = dest === " " && c.ch === " " ? 0 : 5 + Math.floor(Math.random() * 6);
        var t0 = r * 90 + i * 22;
        for (var p = 0; p < passi; p++) {
          piano.push({ c: c, t: t0 + p * 62, ch: CARATTERI[1 + Math.floor(Math.random() * (CARATTERI.length - 1))] });
        }
        piano.push({ c: c, t: t0 + passi * 62, ch: dest });
      });
    });
    if (subito) return;
    piano.sort(function (a, b) { return a.t - b.t; });
    var indice = 0;
    function passo(ora) {
      var trascorso = ora - inizio;
      while (indice < piano.length && piano[indice].t <= trascorso) {
        scriviCella(piano[indice].c, piano[indice].ch);
        indice++;
      }
      if (indice < piano.length) animazioneTab = requestAnimationFrame(passo);
    }
    animazioneTab = requestAnimationFrame(passo);
    var fine = piano.length ? piano[piano.length - 1].t : 0;
    clearTimeout(sicurezzaTab);
    sicurezzaTab = setTimeout(function () {
      if (indice >= piano.length) return;
      cancelAnimationFrame(animazioneTab);
      for (; indice < piano.length; indice++) {
        var x = piano[indice];
        x.c.ch = x.ch;
        x.c.testo.textContent = x.ch === " " ? "\u00a0" : x.ch;
      }
    }, fine + 500);
  }

  function testiPartita(p) {
    var d = p.data;
    return [
      nomeCasa(p),
      nomeOspite(p),
      GIORNI[d.getDay()] + " " + due(d.getDate()) + " " + MESI[d.getMonth()],
      oraTesto(d) + " " + SPORT[p.sport].nome
    ];
  }

  var elenco = prossime(PARTITE);
  var mostrata = 0;
  var tabellone = document.querySelector("[data-tabellone]");
  var celleTab = tabellone ? preparaTabellone(tabellone) : null;
  var annuncio = document.querySelector("[data-annuncio]");

  function mostraPartita(i) {
    elenco = prossime(PARTITE);
    if (!elenco.length) { PARTITE = generaPartite(); elenco = prossime(PARTITE); }
    mostrata = i % elenco.length;
    var p = elenco[mostrata];
    if (celleTab) giraTabellone(celleTab, testiPartita(p));
    document.querySelectorAll("[data-luogo]").forEach(function (el) { el.textContent = p.luogo; });
    document.querySelectorAll("[data-quando]").forEach(function (el) { el.textContent = dataLunga(p.data) + ", ore " + oraTesto(p.data); });
    document.querySelectorAll("[data-sfida]").forEach(function (el) { el.textContent = nomeCasa(p) + " – " + nomeOspite(p); });
    document.querySelectorAll("[data-sport-nome]").forEach(function (el) { el.textContent = SPORT[p.sport].nome + " · " + SPORT[p.sport].squadra; });
    document.querySelectorAll("[data-indice]").forEach(function (el) { el.textContent = (mostrata + 1) + " di " + Math.min(elenco.length, 6); });
    if (annuncio) annuncio.textContent = "Partita di esempio: " + nomeCasa(p) + " contro " + nomeOspite(p) + ", " + SPORT[p.sport].nome + ", " + dataLunga(p.data) + " alle " + oraTesto(p.data) + ".";
    aggiornaBarra(p);
    aggiornaConto();
  }

  if (tabellone) {
    tabellone.addEventListener("click", function () {
      var max = Math.min(elenco.length, 6);
      mostraPartita((mostrata + 1) % max);
    });
  }

  /* ---------- Barra del pollice ---------- */
  function aggiornaBarra(p) {
    var b = document.querySelector("[data-barra-partita]");
    if (!b) return;
    b.textContent = GIORNI[p.data.getDay()] + " " + oraTesto(p.data) + " · " + SPORT[p.sport].nome;
  }

  /* ---------- Conto alla rovescia ---------- */
  var contoEl = document.querySelector("[data-conto]");
  function aggiornaConto() {
    var p = elenco[mostrata];
    if (!p) return;
    var diff = p.data.getTime() - Date.now();
    if (diff <= 0) { mostraPartita(0); return; }
    var s = Math.floor(diff / 1000);
    var g = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    if (contoEl) {
      contoEl.querySelector("[data-g]").textContent = due(g);
      contoEl.querySelector("[data-h]").textContent = due(h);
      contoEl.querySelector("[data-m]").textContent = due(m);
      contoEl.querySelector("[data-s]").textContent = due(sec);
    }
    var fra = document.querySelector("[data-barra-fra]");
    if (fra) fra.textContent = g > 0 ? "Prossima · tra " + g + (g === 1 ? " giorno" : " giorni") : "Prossima · tra " + h + " h " + m + " min";
  }
  if (document.querySelector("[data-barra-partita]") || tabellone || contoEl) {
    mostraPartita(0);
    setInterval(aggiornaConto, 1000);
  }

  /* ---------- Righe partita ---------- */
  function rigaPartita(p) {
    var li = document.createElement("li");
    li.className = "partita" + (p.casa ? " partita--casa" : "");
    var d = p.data;
    var esito;
    if (p.esito) {
      var etichetta = { v: "Vinta", p: "Pari", s: "Persa" }[p.esito];
      var a = p.casa ? p.noi : p.loro, b = p.casa ? p.loro : p.noi;
      esito = '<span class="partita__esito esito-' + p.esito + '">' + a + "–" + b + "<small>" + etichetta + "</small></span>";
    } else {
      esito = '<span class="partita__esito">' + oraTesto(d) + "<small>" + (p.casa ? "In casa" : "Fuori") + "</small></span>";
    }
    li.innerHTML =
      '<span class="partita__data"><b>' + due(d.getDate()) + "</b><small>" + GIORNI[d.getDay()] + " " + MESI[d.getMonth()] + "</small></span>" +
      '<span class="partita__squadre"><strong>' + nomeCasa(p) + " – " + nomeOspite(p) + "</strong><span>" + SPORT[p.sport].nome + " · " + p.luogo + "</span></span>" +
      esito;
    return li;
  }

  /* ---------- Turno (home) ---------- */
  var turno = document.querySelector("[data-turno]");
  if (turno) {
    var lista = turno.querySelector(".partite");
    var bottoni = turno.querySelectorAll("[data-sport]");
    var mostraTurno = function (sport) {
      bottoni.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.sport === sport)); });
      var tutte = PARTITE.filter(function (p) { return p.sport === sport; });
      var passate = tutte.filter(function (p) { return p.esito; }).slice(-2);
      var future = tutte.filter(function (p) { return !p.esito; }).slice(0, 2);
      lista.innerHTML = "";
      passate.concat(future).forEach(function (p, i) {
        var li = rigaPartita(p);
        li.style.animationDelay = i * 40 + "ms";
        lista.appendChild(li);
      });
      var link = turno.querySelector("[data-turno-link]");
      if (link) link.href = "calendario.html#" + sport;
    };
    bottoni.forEach(function (b) { b.addEventListener("click", function () { mostraTurno(b.dataset.sport); }); });
    mostraTurno("calcio");
  }

  /* ---------- Calendario e classifica ---------- */
  var cal = document.querySelector("[data-calendario]");
  if (cal) {
    var stato = { sport: "tutti", tipo: "programma", luogo: "tutti" };
    var h = location.hash.replace("#", "");
    if (SPORT[h]) stato.sport = h;
    var listaCal = cal.querySelector(".partite");
    var conteggio = cal.querySelector("[data-conteggio]");
    var vuoto = cal.querySelector("[data-vuoto]");
    var disegna = function () {
      cal.querySelectorAll("[data-filtro]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(stato[b.dataset.filtro] === b.dataset.valore));
      });
      var sel = PARTITE.filter(function (p) {
        if (stato.sport !== "tutti" && p.sport !== stato.sport) return false;
        if (stato.tipo === "programma" && p.esito) return false;
        if (stato.tipo === "risultati" && !p.esito) return false;
        if (stato.luogo === "casa" && !p.casa) return false;
        if (stato.luogo === "fuori" && p.casa) return false;
        return true;
      });
      if (stato.tipo === "risultati") sel = sel.slice().reverse();
      listaCal.innerHTML = "";
      sel.forEach(function (p, i) {
        var li = rigaPartita(p);
        li.style.animationDelay = Math.min(i, 8) * 30 + "ms";
        listaCal.appendChild(li);
      });
      vuoto.hidden = sel.length > 0;
      conteggio.textContent = sel.length === 1 ? "1 partita" : sel.length + " partite";
    };
    cal.querySelectorAll("[data-filtro]").forEach(function (b) {
      b.addEventListener("click", function () {
        stato[b.dataset.filtro] = b.dataset.valore;
        disegna();
        if (b.dataset.filtro === "sport" && SPORT[b.dataset.valore]) mostraClassifica(b.dataset.valore);
      });
    });
    var reimposta = cal.querySelector("[data-reimposta]");
    if (reimposta) reimposta.addEventListener("click", function () { stato = { sport: "tutti", tipo: "tutte", luogo: "tutti" }; disegna(); });
    disegna();

    var tab = document.querySelector("[data-classifica]");
    var mostraClassifica = function (sport) {
      if (!tab) return;
      tab.querySelectorAll("[role=tab]").forEach(function (b) {
        var si = b.dataset.sport === sport;
        b.setAttribute("aria-selected", String(si));
        b.tabIndex = si ? 0 : -1;
      });
      var conPari = sport === "calcio";
      var corpo = tab.querySelector("tbody");
      var testa = tab.querySelector("thead tr");
      testa.innerHTML = '<th scope="col"><abbr title="Posizione">#</abbr></th><th scope="col">Squadra</th><th scope="col"><abbr title="Giocate">G</abbr></th><th scope="col"><abbr title="Vinte">V</abbr></th>' +
        (conPari ? '<th scope="col"><abbr title="Pareggiate">N</abbr></th>' : "") +
        '<th scope="col"><abbr title="Perse">P</abbr></th><th scope="col"><abbr title="Punti">Pt</abbr></th>';
      corpo.innerHTML = "";
      classifica(sport).forEach(function (r, i) {
        var tr = document.createElement("tr");
        if (r.noi) tr.className = "is-noi";
        tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + r.nome + "</td><td>" + r.g + "</td><td>" + r.v + "</td>" +
          (conPari ? "<td>" + r.n + "</td>" : "") + "<td>" + r.p + '</td><td class="punti">' + r.pt + "</td>";
        corpo.appendChild(tr);
      });
      var cap = tab.querySelector("caption");
      if (cap) cap.textContent = "Classifica di esempio, " + SPORT[sport].nome + " " + SPORT[sport].squadra + ": squadre e punti sono inventati.";
      tab.querySelector("[role=tabpanel]").setAttribute("aria-labelledby", "tab-" + sport);
    };
    if (tab) {
      var tabs = Array.prototype.slice.call(tab.querySelectorAll("[role=tab]"));
      tabs.forEach(function (b, i) {
        b.addEventListener("click", function () { mostraClassifica(b.dataset.sport); });
        b.addEventListener("keydown", function (e) {
          var n = null;
          if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
          if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
          if (n !== null) { e.preventDefault(); tabs[n].focus(); mostraClassifica(tabs[n].dataset.sport); }
        });
      });
      mostraClassifica(SPORT[stato.sport] ? stato.sport : "calcio");
    }
  }

  /* ---------- Categorie per età ---------- */
  function annoStagione() {
    var d = new Date();
    return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  }
  var CATEGORIE = {
    calcio: [
      [5, 6, "Piccoli amici"], [7, 8, "Primi calci"], [9, 10, "Pulcini"], [11, 12, "Esordienti"], [13, 14, "Giovanissimi"], [15, 16, "Allievi"], [17, 18, "Juniores"]
    ],
    volley: [[6, 11, "Minivolley"], [12, 13, "Under 14"], [14, 15, "Under 16"], [16, 17, "Under 18"]],
    basket: [[6, 11, "Minibasket"], [12, 13, "Under 14"], [14, 15, "Under 16"], [16, 17, "Under 18"]]
  };
  function categoriaPer(sport, anno) {
    var eta = annoStagione() - anno;
    var lista = CATEGORIE[sport] || [];
    for (var i = 0; i < lista.length; i++) {
      if (eta >= lista[i][0] && eta <= lista[i][1]) return { nome: lista[i][2], eta: eta, indice: i };
    }
    return { nome: eta >= 18 ? "Prima squadra" : null, eta: eta, indice: -1 };
  }

  document.querySelectorAll("[data-anni]").forEach(function (el) {
    var min = +el.dataset.min, max = +el.dataset.max;
    var y = annoStagione();
    el.textContent = min === max ? "nati nel " + (y - min) : "nati nel " + (y - max) + " e " + (y - min);
  });
  document.querySelectorAll("[data-stagione]").forEach(function (el) {
    var y = annoStagione();
    el.textContent = y + "/" + String(y + 1).slice(2);
  });

  var calcola = document.querySelector("[data-calcola]");
  if (calcola) {
    var inp = calcola.querySelector("input");
    var out = calcola.querySelector("[data-risposta]");
    var voci = document.querySelectorAll("[data-categoria]");
    var aggiorna = function () {
      var v = parseInt(inp.value, 10);
      voci.forEach(function (x) { x.classList.remove("is-tua"); });
      var y = annoStagione();
      if (!inp.value) { out.innerHTML = "Scrivi l'anno<small>Ti diciamo in che gruppo gioca e quando si allena.</small>"; return; }
      if (isNaN(v) || v < 1900 || v > y) { out.innerHTML = "Anno non valido<small>Scrivi quattro cifre, per esempio " + (y - 9) + ".</small>"; return; }
      var c = categoriaPer("calcio", v);
      if (c.eta < 5) { out.innerHTML = "Ancora un po' presto<small>Si comincia l'anno dei 5 anni. Intanto potete venire a vedere un allenamento.</small>"; return; }
      if (c.indice === -1) { out.innerHTML = "Prima squadra o amatori<small>Per chi ha " + c.eta + " anni c'è la prima squadra. Scrivici e ti diciamo quando provare.</small>"; return; }
      var voce = document.querySelector('[data-categoria="' + c.indice + '"]');
      if (voce) voce.classList.add("is-tua");
      out.innerHTML = c.nome + "<small>" + c.eta + " anni in questa stagione. Il gruppo è evidenziato in arancio nell'elenco.</small>";
    };
    inp.addEventListener("input", aggiorna);
    aggiorna();
  }

  /* ---------- Borsone ---------- */
  var borsone = document.querySelector("[data-borsone]");
  if (borsone) {
    var caselle = borsone.querySelectorAll("input");
    var statoB = document.querySelector("[data-borsone-stato]");
    var conta = function () {
      var n = 0;
      caselle.forEach(function (c) { if (c.checked) n++; });
      statoB.textContent = n === caselle.length ? "Borsone pronto. Ci vediamo al campo." : n + " su " + caselle.length + " nel borsone";
    };
    caselle.forEach(function (c) { c.addEventListener("change", conta); });
    conta();
  }

  /* ---------- Modulo di iscrizione ---------- */
  var modulo = document.querySelector("[data-iscrizione]");
  if (modulo) {
    var nascita = modulo.querySelector("#nascita");
    var catAuto = modulo.querySelector("[data-categoria-auto]");
    var campoGenitore = modulo.querySelector("[data-genitore]");
    var riepilogo = document.querySelector("[data-riepilogo]");
    var errori = modulo.querySelector("[data-errori]");
    var invio = modulo.querySelector("[type=submit]");

    var sportScelto = function () {
      var r = modulo.querySelector('input[name="sport"]:checked');
      return r ? r.value : null;
    };
    var aggiornaCategoria = function () {
      var s = sportScelto();
      if (!nascita.value || !s) { catAuto.textContent = ""; return; }
      var anno = new Date(nascita.value).getFullYear();
      var c = categoriaPer(s, anno);
      if (isNaN(anno) || c.eta < 0) { catAuto.textContent = ""; return; }
      catAuto.textContent = c.nome ? "Gruppo indicativo: " + c.nome + " (" + c.eta + " anni in questa stagione)" : "Per questa età non c'è ancora un gruppo: ne parliamo su WhatsApp.";
      var minore = c.eta < 18;
      campoGenitore.hidden = !minore;
      campoGenitore.querySelector("input").required = minore;
    };
    nascita.addEventListener("change", aggiornaCategoria);
    nascita.addEventListener("input", aggiornaCategoria);
    modulo.querySelectorAll('input[name="sport"]').forEach(function (r) { r.addEventListener("change", aggiornaCategoria); });

    var controlli = {
      atleta: function (v) { return v.trim().split(/\s+/).length >= 2 ? "" : "Scrivi nome e cognome dell'atleta."; },
      nascita: function (v) {
        if (!v) return "Inserisci la data di nascita.";
        var d = new Date(v);
        if (isNaN(d) || d > new Date()) return "Questa data non è valida.";
        if (annoStagione() - d.getFullYear() < 5) return "Si comincia dai 5 anni.";
        return "";
      },
      sport: function () { return sportScelto() ? "" : "Scegli uno sport."; },
      genitore: function (v, el) { return el.required && v.trim().length < 3 ? "Scrivi il nome di un genitore." : ""; },
      telefono: function (v) { var c = v.replace(/[\s.\-+]/g, ""); return /^\d{9,13}$/.test(c) ? "" : "Scrivi un numero di telefono valido (solo cifre)."; },
      certificato: function () { return modulo.querySelector('input[name="certificato"]:checked') ? "" : "Dicci se il certificato medico c'è già."; },
      consenso: function (v, el) { return el.checked ? "" : "Conferma di aver letto che è una dimostrazione."; }
    };

    var controlla = function (nome) {
      var el = modulo.elements[nome];
      var campo = modulo.querySelector('[data-campo="' + nome + '"]');
      if (!campo) return "";
      var singolo = el && el.length && !el.tagName ? el[0] : el;
      var msg = controlli[nome](singolo.type === "checkbox" ? "" : (singolo.value || ""), singolo);
      campo.classList.toggle("is-errore", !!msg);
      var p = campo.querySelector(".campo__errore");
      if (p) p.textContent = msg;
      var inputs = campo.querySelectorAll("input, select, textarea");
      inputs.forEach(function (i) { i.setAttribute("aria-invalid", msg ? "true" : "false"); });
      return msg;
    };

    Object.keys(controlli).forEach(function (n) {
      var campo = modulo.querySelector('[data-campo="' + n + '"]');
      if (!campo) return;
      campo.addEventListener("change", function () { if (campo.classList.contains("is-errore")) controlla(n); });
      campo.addEventListener("focusout", function (e) {
        if (e.target.type === "radio") return;
        if (e.target.value) controlla(n);
      });
    });

    modulo.addEventListener("submit", function (e) {
      e.preventDefault();
      var primo = null, n = 0;
      Object.keys(controlli).forEach(function (k) {
        var campo = modulo.querySelector('[data-campo="' + k + '"]');
        if (!campo || campo.hidden) return;
        if (controlla(k)) { n++; if (!primo) primo = campo.querySelector("input, select, textarea"); }
      });
      if (n) {
        errori.hidden = false;
        errori.textContent = n === 1 ? "Manca una cosa: è segnata in rosso qui sotto." : "Mancano " + n + " cose: sono segnate in rosso qui sotto.";
        if (primo) primo.focus();
        return;
      }
      errori.hidden = true;
      var f = modulo.elements;
      var s = sportScelto();
      var d = new Date(f.nascita.value);
      var cat = categoriaPer(s, d.getFullYear());
      var righe = [
        "DIMOSTRAZIONE: iscrizione di prova dal sito demo della Polisportiva Levante (realizzato da Mockly). La società è inventata.",
        "",
        "Atleta: " + f.atleta.value.trim(),
        "Nato il: " + d.toLocaleDateString("it-IT"),
        "Sport: " + SPORT[s].nome + (cat.nome ? " – " + cat.nome : ""),
        !campoGenitore.hidden ? "Genitore: " + f.genitore.value.trim() : null,
        "Telefono per le convocazioni: " + f.telefono.value.trim(),
        "Taglia del kit: " + f.taglia.value,
        "Certificato medico: " + modulo.querySelector('input[name="certificato"]:checked').value,
        f.note.value.trim() ? "Note: " + f.note.value.trim() : null
      ].filter(function (x) { return x !== null; });
      var testo = righe.join("\n");
      var url = WA + "?text=" + encodeURIComponent(testo);

      invio.setAttribute("aria-busy", "true");
      invio.querySelector("span").textContent = "Preparo il messaggio…";
      riepilogo.hidden = false;
      riepilogo.querySelector("[data-testo]").textContent = righe.slice(2).join("\n");
      riepilogo.querySelector("[data-wa]").href = url;
      var aperta = window.open(url, "_blank", "noopener");
      setTimeout(function () {
        invio.removeAttribute("aria-busy");
        invio.querySelector("span").textContent = "Prepara di nuovo il messaggio";
        riepilogo.querySelector("[data-esito]").textContent = aperta === null
          ? "Il telefono ha bloccato l'apertura automatica: tocca il bottone qui sotto."
          : "WhatsApp si è aperto in un'altra scheda. Se non lo vedi, tocca il bottone qui sotto.";
        riepilogo.scrollIntoView({ behavior: riduci ? "auto" : "smooth", block: "start" });
        riepilogo.focus();
      }, 450);
    });
  }

  /* ---------- Collegamenti WhatsApp generici ---------- */
  document.querySelectorAll("[data-wa-testo]").forEach(function (a) {
    a.href = WA + "?text=" + encodeURIComponent(a.dataset.waTesto);
  });

  /* ---------- Anno nel piede ---------- */
  document.querySelectorAll("[data-anno]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
