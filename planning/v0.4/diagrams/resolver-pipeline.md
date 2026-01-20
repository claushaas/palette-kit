<!-- markdownlint-disable -->
graph TD
  Input["Resolve Options"]

  Validate["Type Validation"]
  SelectStrategy["Select Usage Strategy"]
  ApplyIntent["Apply Intent<br/>(Hue / Base Chroma)"]
  ApplyLevel["Apply Level Curve"]
  ApplyRelation["Apply Relation<br/>(on / over / under)"]
  ApplyState["Apply State Deltas"]
  ApplyContext["Apply Context Curves"]
  Output["Resolved Color"]

  Input --> Validate
  Validate --> SelectStrategy
  SelectStrategy --> ApplyIntent
  ApplyIntent --> ApplyLevel
  ApplyLevel --> ApplyRelation
  ApplyRelation --> ApplyState
  ApplyState --> ApplyContext
  ApplyContext --> Output
