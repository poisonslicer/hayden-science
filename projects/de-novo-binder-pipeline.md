# de novo binder pipeline

A one-command pipeline for designing proteins that have never existed — built from scratch to grip a chosen small molecule the way a key fits a lock.

## What it does

It wraps the modern protein-design stack into a single call:

- **RFdiffusion** hallucinates a protein backbone around the target ligand
- **LigandMPNN** designs an amino-acid sequence for that exact shape
- **AlphaFold** predicts each design and throws out anything that won't fold

```
> design_binder --target ligand.sdf --n 96
… diffusing backbones
… designing sequences
… predicting structures
✓ 7 / 96 designs pass (pAE < 5) — ordering DNA
```

## Why it matters

A clean binder is the first domino. Once a protein reliably grabs a molecule, you can turn it into a **biosensor**, a **diagnostic**, or the starting point for a **therapeutic**.

> The dream: type a molecule into a model, and a few weeks later hold a protein in your hand that grabs it. We're not all the way there — but it's getting eerily close.

## Status

Active in the **Linna An lab** at Rice, currently aimed at six clinically relevant targets.

*(Write-up is placeholder copy — easy to expand with real results and figures.)*
