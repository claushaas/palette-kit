<!-- markdownlint-disable -->
graph TD
  ColorResolution["Color Resolution"]

  Usage["Usage<br/>(fill / visualVocabulary / lines / overlays)"]
  Intent["Intent<br/>(brand / neutral / success / ...)"]
  Level["Level<br/>(1–9)"]
  Relation["Relation<br/>(on / over / under)"]
  State["State<br/>(hover / active / ...)"]
  Context["Context<br/>(light / dark)"]

  ColorResolution --> Usage
  ColorResolution --> Intent
  ColorResolution --> Level
  ColorResolution --> Relation
  ColorResolution --> State
  ColorResolution --> Context
