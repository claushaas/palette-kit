# Alpha

Alpha is present in the normalized OKLCH model as `alpha`.

In the current v0.4 implementation:

- base resolved OKLCH colors use `alpha: 1`;
- `rgba` output maps alpha to `a`;
- `over` and `under` relations apply configured alpha by level;
- state alpha deltas from `resolverConfig` apply only to `overlays`;
- non-overlay usages preserve resolved alpha and never use alpha to satisfy
  contrast.

Alpha behavior is explicit and deterministic.
