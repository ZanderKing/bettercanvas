/*
Classical theme builder
Marble-and-stone look for Canvas with selectable palettes (light + dark),
statue card images, sidebar style, typography, and an Auto mode that follows
the system light/dark setting (uses the dark_preset_light palette).
Images are bundled in img/classical (see CREDITS.md for sources/licenses).
*/

(() => {
    const img = (name) => chrome.runtime.getURL(`img/classical/${name}.jpg`);

    const STATUES = [
        { id: "david", name: "David" },
        { id: "caesar", name: "Caesar" },
        { id: "augustus", name: "Augustus" },
        { id: "aurelius", name: "Marcus Aurelius" },
        { id: "antinous", name: "Antinous" },
        { id: "germanicus", name: "Germanicus" },
        { id: "caesar2", name: "Caesar II" },
        { id: "laocoon", name: "Laocoön" },
        { id: "davidside", name: "David II" },
        { id: "nike", name: "Victory" },
    ];

    // background-0 page, background-1 surfaces, background-2 hover/inputs
    const PALETTES = {
        marble: { name: "Marble", mode: "light", b0: "#f3f0ea", b1: "#fcfbf8", b2: "#e8e3da", bd: "#dcd4c6", t0: "#211f1c", t1: "#4f4a43", t2: "#6e675d", ln: "#7d5f24" },
        travertine: { name: "Travertine", mode: "light", b0: "#ece4d6", b1: "#f7f2e9", b2: "#e0d5c2", bd: "#d1c3aa", t0: "#29231b", t1: "#564c3f", t2: "#6f6454", ln: "#874f22" },
        basalt: { name: "Basalt", mode: "dark", b0: "#121211", b1: "#1a1918", b2: "#242220", bd: "#34312c", t0: "#f2eee6", t1: "#d0c9bb", t2: "#a29a8c", ln: "#d2b16a" },
        porphyry: { name: "Porphyry", mode: "dark", b0: "#170f13", b1: "#21151b", b2: "#2c1c24", bd: "#402934", t0: "#f5ede7", t1: "#dbcbc2", t2: "#ad9890", ln: "#e0ba74" },
        verdigris: { name: "Verdigris", mode: "dark", b0: "#0e1513", b1: "#141e1b", b2: "#1b2925", bd: "#2b3d37", t0: "#eef2ec", t1: "#c9d4cc", t2: "#97aba2", ln: "#8fd0b9" },
    };

    const SIDEBARS = {
        marble: "Marble",
        statue: "Statue",
        solid: "Solid",
        gradient: "Gradient",
    };

    const FONTS = {
        imperial: { name: "Imperial", sample: "Cinzel", head: "'Cinzel', serif", link: "Inter:wght@400;500;600&family=Cinzel:wght@500;600;700" },
        renaissance: { name: "Renaissance", sample: "Cormorant Garamond", head: "'Cormorant Garamond', serif", link: "Inter:wght@400;500;600&family=Cormorant+Garamond:wght@500;600;700" },
        modern: { name: "Modern", sample: "Inter", head: "'Inter', sans-serif", link: "Inter:wght@400;500;600;700" },
    };

    const DEFAULTS = {
        mode: "auto",
        light: "marble",
        dark: "basalt",
        statues: STATUES.map(s => s.id),
        sidebar: "marble",
        font: "imperial",
        stone: true,
    };

    let prefs = { ...DEFAULTS };

    /* ---------- theme building ---------- */

    function sidebarFor(p, kind, firstStatue) {
        const light = p.mode === "light";
        switch (kind) {
            case "marble":
                return {
                    "sidebar": light
                        ? `linear-gradient(${p.b1}a6, ${p.b1}c2), url("${img("marble3")}") center / cover`
                        : `linear-gradient(${p.b0}d4, ${p.b0}eb), url("${img("marble3")}") center / cover`,
                    "sidebar-text": p.t0,
                };
            case "statue":
                return {
                    "sidebar": `linear-gradient(#0000008f, #000000d1), url("${img(firstStatue)}") center 20% / cover`,
                    "sidebar-text": "#f5f1ea",
                };
            case "gradient":
                return { "sidebar": `linear-gradient(${p.b2}, ${p.b0})`, "sidebar-text": p.t0 };
            default:
                return { "sidebar": p.b1, "sidebar-text": p.t0 };
        }
    }

    function presetFor(paletteId, kind, firstStatue) {
        const p = PALETTES[paletteId];
        return {
            "background-0": p.b0,
            "background-1": p.b1,
            "background-2": p.b2,
            "borders": p.bd,
            "text-0": p.t0,
            "text-1": p.t1,
            "text-2": p.t2,
            "links": p.ln,
            ...sidebarFor(p, kind, firstStatue),
        };
    }

    function stylesFor(fontId, stone) {
        const head = FONTS[fontId].head;
        return [
            `html body :is(h1,h2,h3,.ic-DashboardCard__header-title),html body :is(h1,h2,h3,.ic-DashboardCard__header-title) :is(span,a){font-family:${head}!important;letter-spacing:.03em}`,
            `.ic-DashboardCard{border-radius:14px!important;overflow:hidden!important;border:1px solid var(--bcborders)!important;box-shadow:0 1px 2px #0000000d,0 10px 24px -14px #00000059!important;transition:transform .2s ease,box-shadow .2s ease}`,
            `.ic-DashboardCard:hover{transform:translateY(-2px);box-shadow:0 2px 4px #00000014,0 18px 34px -16px #00000073!important}`,
            `.ic-DashboardCard__header_image{background-size:cover!important;background-position:center 25%!important${stone ? ";filter:grayscale(1) contrast(1.05) brightness(1.03)" : ""}}`,
            `.ic-DashboardCard__header-title,.ic-DashboardCard__header-title span{color:var(--bctext-0)!important;font-size:15px!important}`,
            `.ic-DashboardCard__header-subtitle,.ic-DashboardCard__header-term{color:var(--bctext-2)!important}`,
            `.ic-app-header{box-shadow:inset -1px 0 0 var(--bcborders)!important}`,
            `.ic-app-header__menu-list-item--active .ic-app-header__menu-list-link{background:#8080802e!important}`,
        ].join("");
    }

    function buildTheme(pr) {
        const statues = pr.statues.length ? pr.statues : [STATUES[0].id];
        const first = statues[0];
        const out = {
            dark_mode: true,
            disable_color_overlay: true,
            gradient_cards: false,
            custom_font: { family: "'Inter', sans-serif", link: FONTS[pr.font].link },
            custom_styles: stylesFor(pr.font, pr.stone),
            images: statues.map(img),
        };
        if (pr.mode === "light") {
            out.dark_preset = presetFor(pr.light, pr.sidebar, first);
            out.dark_preset_light = null;
        } else if (pr.mode === "dark") {
            out.dark_preset = presetFor(pr.dark, pr.sidebar, first);
            out.dark_preset_light = null;
        } else {
            out.dark_preset = presetFor(pr.dark, pr.sidebar, first);
            out.dark_preset_light = presetFor(pr.light, pr.sidebar, first);
        }
        return out;
    }

    function applyTheme() {
        const theme = buildTheme(prefs);
        const allOptions = syncedSwitches.concat(syncedSubOptions).concat(["dark_preset", "custom_cards", "custom_font", "card_colors"]);
        chrome.storage.sync.get(allOptions, sync => {
            chrome.storage.local.get(["previous_theme"], async local => {
                // remember what was there before so "Revert theme changes" still works
                if (local["previous_theme"] === null || local["previous_theme"] === undefined) {
                    try {
                        chrome.storage.local.set({ "previous_theme": await getExport(sync, allOptions) });
                    } catch (e) { console.log(e); }
                }

                const cards = sync["custom_cards"] || {};
                const keys = Object.keys(cards);
                keys.forEach((key, i) => {
                    cards[key] = { ...cards[key], img: theme.images[i % theme.images.length] };
                });

                chrome.storage.sync.set({
                    dark_mode: true,
                    dark_preset: theme.dark_preset,
                    dark_preset_light: theme.dark_preset_light,
                    disable_color_overlay: true,
                    gradient_cards: false,
                    custom_font: theme.custom_font,
                    custom_styles: theme.custom_styles,
                    custom_cards: cards,
                }, () => {
                    if (chrome.runtime.lastError) {
                        displayAlert(true, "Couldn't save the theme: " + chrome.runtime.lastError.message);
                    } else if (keys.length === 0) {
                        displayAlert(false, "Colors, font and sidebar applied. Open your Canvas dashboard once, then apply again to add statues to your course cards.");
                    } else {
                        displayAlert(false, "Classical theme applied. Refresh Canvas if it doesn't update straight away.");
                    }
                });
            });
        });
        chrome.storage.local.set({ classical_prefs: prefs });
    }

    /* ---------- popup UI ---------- */

    const $ = (sel) => document.querySelector(sel);

    function el(tag, attrs = {}, parent = null) {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => {
            if (k === "style") node.style.cssText = v;
            else if (k === "dataset") Object.assign(node.dataset, v);
            else node[k] = v;
        });
        if (parent) parent.appendChild(node);
        return node;
    }

    function segmented(container, options, current, onPick) {
        container.textContent = "";
        Object.entries(options).forEach(([id, label]) => {
            const btn = el("button", { className: "cl-seg" + (id === current ? " active" : ""), textContent: label, type: "button" }, container);
            btn.addEventListener("click", () => onPick(id));
        });
    }

    function renderPalettes() {
        ["light", "dark"].forEach(mode => {
            const box = $(`#cl-palettes-${mode}`);
            box.textContent = "";
            Object.entries(PALETTES).filter(([, p]) => p.mode === mode).forEach(([id, p]) => {
                const btn = el("button", { className: "cl-swatch" + (prefs[mode] === id ? " active" : ""), type: "button", title: p.name }, box);
                const chips = el("div", { className: "cl-swatch-chips" }, btn);
                [p.b0, p.b1, p.t0, p.ln].forEach(c => el("span", { style: `background:${c}` }, chips));
                el("span", { className: "cl-swatch-name", textContent: p.name }, btn);
                btn.addEventListener("click", () => { prefs[mode] = id; refresh(); });
            });
        });
        $("#cl-light-row").style.opacity = prefs.mode === "dark" ? ".45" : "1";
        $("#cl-dark-row").style.opacity = prefs.mode === "light" ? ".45" : "1";
    }

    function renderStatues() {
        const grid = $("#cl-statues");
        grid.textContent = "";
        STATUES.forEach(s => {
            const on = prefs.statues.includes(s.id);
            const btn = el("button", { className: "cl-statue" + (on ? " active" : ""), type: "button", title: s.name }, grid);
            btn.style.backgroundImage = `url("${img(s.id)}")`;
            el("span", { className: "cl-statue-name", textContent: s.name }, btn);
            el("span", { className: "cl-statue-check", textContent: on ? String(prefs.statues.indexOf(s.id) + 1) : "" }, btn);
            btn.addEventListener("click", () => {
                if (on) {
                    if (prefs.statues.length === 1) return; // keep at least one
                    prefs.statues = prefs.statues.filter(x => x !== s.id);
                } else {
                    prefs.statues = [...prefs.statues, s.id];
                }
                refresh();
            });
        });
    }

    function renderFonts() {
        const box = $("#cl-fonts");
        box.textContent = "";
        Object.entries(FONTS).forEach(([id, f]) => {
            const btn = el("button", { className: "cl-font" + (prefs.font === id ? " active" : ""), type: "button" }, box);
            el("span", { className: "cl-font-sample", textContent: "Aa", style: `font-family:${f.head}` }, btn);
            el("span", { className: "cl-font-name", textContent: f.name }, btn);
            el("span", { className: "cl-font-detail", textContent: f.sample + (id === "modern" ? "" : " + Inter") }, btn);
            btn.addEventListener("click", () => { prefs.font = id; refresh(); });
        });
    }

    function renderPreview() {
        const box = $("#cl-preview");
        box.textContent = "";
        const theme = buildTheme(prefs);
        const presets = prefs.mode === "auto"
            ? [["Light", theme.dark_preset_light], ["Dark", theme.dark_preset]]
            : [[prefs.mode === "light" ? "Light" : "Dark", theme.dark_preset]];
        presets.forEach(([label, p]) => {
            const frame = el("div", { className: "cl-frame", style: `background:${p["background-0"]};border-color:${p["borders"]}` }, box);
            el("div", { className: "cl-frame-side", style: `background:${p["sidebar"]}` }, frame);
            const main = el("div", { className: "cl-frame-main" }, frame);
            el("div", { className: "cl-frame-title", textContent: "Dashboard", style: `color:${p["text-0"]};font-family:${FONTS[prefs.font].head}` }, main);
            const cards = el("div", { className: "cl-frame-cards" }, main);
            for (let i = 0; i < 3; i++) {
                const card = el("div", { className: "cl-frame-card", style: `background:${p["background-1"]};border-color:${p["borders"]}` }, cards);
                el("div", { className: "cl-frame-img", style: `background-image:url("${theme.images[i % theme.images.length]}");${prefs.stone ? "filter:grayscale(1) contrast(1.05)" : ""}` }, card);
                el("div", { className: "cl-frame-line", style: `background:${p["text-0"]}` }, card);
                el("div", { className: "cl-frame-line short", style: `background:${p["links"]}` }, card);
            }
            el("span", { className: "cl-frame-label", textContent: label }, frame);
        });
    }

    function refresh() {
        segmented($("#cl-mode"), { auto: "Auto", light: "Light", dark: "Dark" }, prefs.mode, id => { prefs.mode = id; refresh(); });
        segmented($("#cl-sidebar"), SIDEBARS, prefs.sidebar, id => { prefs.sidebar = id; refresh(); });
        renderPalettes();
        renderStatues();
        renderFonts();
        $("#cl-stone").checked = prefs.stone;
        $("#cl-mode-hint").textContent = prefs.mode === "auto"
            ? "Follows your system: light palette by day, dark palette when your Mac or Zen is in dark mode."
            : prefs.mode === "light" ? "Always uses the light palette." : "Always uses the dark palette.";
        renderPreview();
        chrome.storage.local.set({ classical_prefs: prefs });
    }

    function open() {
        document.querySelector(".main").style.display = "none";
        document.querySelector(".classical-container").style.display = "block";
        refresh();
    }

    document.addEventListener("DOMContentLoaded", () => {
        const btn = $("#classical-btn");
        if (!btn) return;
        chrome.storage.local.get("classical_prefs", local => {
            const saved = local.classical_prefs || {};
            prefs = { ...DEFAULTS, ...saved };
            prefs.statues = (prefs.statues || []).filter(id => STATUES.some(s => s.id === id));
            if (prefs.statues.length === 0) prefs.statues = [...DEFAULTS.statues];
        });
        btn.addEventListener("click", open);
        $("#cl-apply").addEventListener("click", applyTheme);
        $("#cl-stone").addEventListener("change", e => { prefs.stone = e.target.checked; refresh(); });
        $("#cl-all").addEventListener("click", () => { prefs.statues = STATUES.map(s => s.id); refresh(); });
        $("#cl-shuffle").addEventListener("click", () => {
            prefs.statues = [...prefs.statues].sort(() => Math.random() - 0.5);
            refresh();
        });
        $("#cl-credits-toggle").addEventListener("click", () => {
            const c = $("#cl-credits");
            c.style.display = c.style.display === "none" ? "block" : "none";
        });
    });

    // exposed for testing
    window.__classical = { buildTheme, PALETTES, STATUES, FONTS, DEFAULTS };
})();
