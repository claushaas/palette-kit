# Diagnostics

Palette Kit v0.4 does not expose a public diagnostics API.

Runtime misuse is reported through thrown errors. Core resolver/configuration
misuse uses structured internal `PaletteKitError` instances, but that class is
not part of the public API surface yet.

## Observable Error Areas

- unknown intent
- missing required level
- forbidden level on `visualVocabulary`
- missing `on` relation
- multiple relations
- unresolved context
- invalid or unsupported serialized output

## Current Recommendation

Catch errors at application boundaries and report the message. Do not depend on
internal error classes until they are explicitly exported.
