<!-- markdownlint-disable -->
graph TD
  ResolverCall["Resolver Call"]

  ResolverContext["Resolver Context<br/>(optional override)"]
  PaletteContext["Palette Context<br/>(default)"]
  SystemContext["System Default"]

  ResolverCall --> ResolverContext
  ResolverContext -->|if undefined| PaletteContext
  PaletteContext -->|if undefined| SystemContext
