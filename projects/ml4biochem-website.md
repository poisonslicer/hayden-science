# ML4BioChem website

The website for **ML4BioChem** — a Houston-area seminar series on machine learning in biochemistry — that quietly updates itself.

## The trick

The talk schedule lives in a Google Sheet so any organizer can edit it. A **GitHub Actions** job runs once a day, pulls the latest rows, rebuilds the site's schedule, and redeploys — no one ever touches HTML.

```
$ gh workflow run sync-schedule.yml
✓ 13 speakers parsed
✓ schedule.json rebuilt
✓ deployed — 300+ subscribers notified
```

## What it powers

- A seminar series co-founded with **Prof. Linna An** and **Prof. Cameron Glasscock**
- Speakers including **Gabriel Corso** (MIT, Boltz/DiffDock), **Kevin Yang** (Microsoft Research), and **Pranam Chatterjee** (Duke)
- A mailing list that passed **300 subscribers** in its first semester

> I like things that quietly maintain themselves. This site is cut from the same cloth.

*(Placeholder write-up — swap in the live link and screenshots when ready.)*
