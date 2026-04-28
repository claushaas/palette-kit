# Alpha

Alpha is present in the normalized OKLCH model as `alpha`.

In the current v0.4 implementation:

- resolved OKLCH colors use `alpha: 1`;
- `rgba` output maps alpha to `a`;
- overlays do not apply alpha/depth behavior yet;
- there is no public alpha strategy configuration.

Future resolver phases may add richer alpha behavior. The current public API
should be treated as structural and deterministic rather than visually tuned.
