# Alpha

Alpha is present in the normalized OKLCH model as `alpha`.

In the current v0.4 implementation:

- base resolved OKLCH colors use `alpha: 1`;
- `rgba` output maps alpha to `a`;
- `over` and `under` relations apply configured alpha by level;
- state alpha deltas exist in `resolverConfig` but are not applied to
  non-overlay usages.

Alpha behavior is explicit and deterministic.
