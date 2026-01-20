<!-- markdownlint-disable -->
graph LR
  Fill["fill"]
  VV["visualVocabulary"]
  Lines["lines"]
  Overlays["overlays"]

  On["on<br/>(contrast)"]
  Over["over<br/>(overlay)"]
  Under["under<br/>(shadow)"]

  Fill --> On
  Lines --> On
  VV --> On

  Overlays --> Over
  Overlays --> Under
