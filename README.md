# River Mining Explorer

A visual dissertation: Md Sadiul Alam Chyon’s thesis on sand and gravel extraction, river response and livelihoods in northern Bangladesh, told as nine short chapters in three acts.

## Open locally

Open `index.html` directly in a browser. All narrative, figure, source and interaction data are local; the site makes no third-party requests and requires no build or installed packages.

For a local HTTP preview, use either of these from this folder:

```sh
python3 scripts/serve.py
```

```sh
npm start
```

Then open `http://127.0.0.1:4187`. Stop the server with Ctrl+C. The Python server needs nothing installed on macOS; `npm start` needs Node.js 18 or newer. `npm run check` verifies source references, image paths, chapter/figure coverage and JavaScript syntax. If the port is occupied, add `--port 4188` (`npm start -- --port 4188`) and open the printed address.

## How the site reads

The whole thesis is one page that scrolls from the cover to a closing recap. There is one path through it and one way to go deeper at each step.

**Cover and contents.** The cover opens on former gravel pits on the Lubha floodplain. Directly below, “Nine chapters, three acts” puts the whole thesis on one screen: each chapter as a plain question with its headline number. The same nine numbered dots sit in the header, grouped by act, and show where the reader is.

**Three acts.** Act I, *The setup* (Chapters 1–3): why sand and gravel, why these rivers, how anyone can know. Act II, *What the rivers show* (Chapters 4–7): the regional footprint, recovery on the Lubha, the impact chain on the Someshwari, and four more rivers. Act III, *Why it continues* (Chapters 8–9): people and power, and better management. Each act has its own accent colour.

**Every chapter has the same four parts.**

1. A field photograph, the chapter number and one plain question. Five chapters (2, 4, 5, 6 and 8) invite a quick guess before the answer; guessing is optional.
2. One headline number with the chapter’s takeaway in a sentence.
3. One interactive visual. Tabs inside it hold related views, including the two rotatable 3D cutaways (channel incision in Chapter 6, pit infill in Chapter 5). Each visual keeps its note on limits, an “Evidence & limits” panel and links to the original figures.
4. “Go deeper”, closed by default: the chapter summary, key findings, approach and its key figures.

A one-line hand-off then leads into the next chapter.

The **Figures** view (header, top right) searches all 81 numbered main-text figures. The viewer supports multipart figures, zoom, pan, original captions and full-resolution files. The evidence panels retain supporting excerpts and selected tables.

Deep links use hashes and work from a local file and on GitHub Pages project sites: `#chapter-6`, `#contents`, `#figures`, `#figure-6.6`. Links from the earlier version (`#story-bed`, `#question-effects` and so on) land on the matching chapter.

### What changed from the earlier version

The earlier site offered four parallel modes (a six-stop field story, eight questions, nine chapters, figures). The same material is now arranged on the thesis’s own nine chapters: the field photographs and guesses open the chapters, the question visuals sit inside them, and the figure library stays as a separate view. Low-contrast text in the charts was darkened and the charts were enlarged. The earlier code is kept beside this folder in `dashboard-previous/` and can be opened the same way.

## Source and provenance

The dashboard was adapted from the supplied `Thesis-Draft_Sadiul.docx`, last modified 16 November 2026, and the supplied `figs/` directory. The draft remains the source of all reported findings; this website is not live monitoring. `sources.js` holds selected verbatim source excerpts and tables. It does not include the whole manuscript, raw agency records, survey data, interview transcripts or field forms.

All 63 separately supplied images were matched to the document’s embedded figures by image similarity and checked against the figure captions. Filenames do not always match figure numbering: for example, `ch4_08.png` is Figure 4.6. `figures.js` records the actual figure number, full caption, source filename, dimensions, origin and SHA-256 for every image part. Complementary parts and absent figures were recovered from the thesis document. The library contains the 81 numbered main-text figures; supplementary appendix figures are outside this first library.

Original images are in `assets/originals/`; optimized reading versions are in `assets/figures/`; gallery thumbnails are in `assets/thumbs/`. The originals are not overwritten or altered. Original credits and reproduction terms remain in the captions. No blanket license is applied to the site’s scientific figures or third-party material.

## Editorial choices

- The footprint is a conservative surface area, not annual extraction or volume. Four reported benchmarks are shown without inventing intervening annual data.
- National demand is consistent with extraction timing; source-to-market sediment flows were not measured. Chapter 4’s qualification about displacement versus independent growth is retained.
- Someshwari’s approximately 10 m bed change is a local maximum. The approximately 2.2 m stage fall at fixed low discharge is distinguished from the approximately 2.8 m observed dry-season stage fall.
- Someshwari’s 88% inundation decrease is one matched-discharge image pair. The four additional rivers’ two-monsoon comparison is distinguished from the non-significant comparison of two four-year periods.
- Unavailable groundwater evidence, the Ratnar bhanga survey disagreement, Dhalai’s missing gauge record and Lubha’s uncertain transient stage response remain visible.
- Social percentages describe non-probability samples. The 347 household respondents are distinguished from the 337 classified respondents, and complaint outcomes from the 97 who attempted complaints.
- The physical diagrams and simplified feedback pathways are explanatory schematics, not calibrated simulations. Chart animations start only when a reader changes a state or turns the block; chapter sections fade in as they scroll into view. The site respects reduced-motion preferences and has a motion control in the header.

## Add videos later

Edit `media.js`. Three named slots sit under the visual of their chapter: `lubha` (Chapter 5), `someshwari` (Chapter 6) and `governance` (Chapter 8). Empty slots render no placeholder. Supply a relative video path, a poster, an English WebVTT caption file, a title and a source caption. The player uses controls and never autoplays. Add files only when ready; the example in `media.js` shows the shape.

## Publish to GitHub Pages later

No repository was created and nothing was uploaded or deployed in this stage.

1. Create or select the intended GitHub repository and place this folder’s contents at its root.
2. Set the default branch to `main`, or adjust `.github/workflows/pages.yml`.
3. In the repository’s Pages settings, select **GitHub Actions** as the build source.
4. Push the completed site to `main` or run the deployment workflow manually.

The included workflow verifies the site and uploads a static Pages artifact. All asset paths are relative; there are no framework builds, API keys, analytics, accounts or hosting-specific services.

## Validation of this version

`npm run check` covers the three acts and nine chapter scenes, panel crops, both 3D comparisons, six rivers, 81 figures, 84 image parts, all 63 separately supplied images, source excerpts, tables and asset paths. Browser checks covered every chapter and every view inside each chapter’s visual, the guesses, “Go deeper”, the figure viewer, the figure library, earlier deep links and back/forward navigation. Layouts were checked at 1440, 1024, 375 and 320 CSS pixels, with no horizontal overflow.

## File guide

- `index.html`, `app.js`: page shell; chapter rendering, chart interactions, figure viewer and routing.
- `spine.js`: the three acts and, for each chapter, its question, photograph, headline number and hand-off line. Edit this file to reword a chapter opener.
- `spine.css`: cover, contents, act bands, chapter layout and responsive rules (classes prefixed `vd-`).
- `styles.css`, `field-atlas.css`: styles for the chart boards, figure library and dialogs, carried over from the earlier version.
- `field-guide.js`: photo crops in original-image coordinates and the guess prompts with their findings.
- `river-model.js`: projected 3D terrain with selectable states and camera angles. No external libraries.
- `questions.js`: chart data, chapter names and river photo crops.
- `content.js`: chapter summaries, river findings and evidence labels.
- `figures.js`: image inventory and complete original captions.
- `sources.js`: supporting source excerpts and selected tables.
- `media.js`: video slots for the next stage.
- `scripts/check.mjs`, `scripts/serve.mjs`, `scripts/serve.py`: dependency-free checks and local preview (Node or Python).
- `.github/workflows/pages.yml`: prepared GitHub Pages deployment.
