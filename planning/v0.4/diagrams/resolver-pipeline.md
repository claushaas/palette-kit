<!-- markdownlint-disable -->
graph TD
  Input["Resolve Options"]

  Validate["Type Validation"]
  ApplyIntent["Apply Intent<br/>(Hue / Base Chroma)"]
  SelectStrategy["Select Usage Strategy"]
  ApplyLevel["Apply Level Curve"]
  ApplyRelation["Apply Relation<br/>(on / over / under)"]
  ApplyState["Apply State Deltas"]
  ApplyContext["Apply Context Curves"]
  Output["Resolved Color"]

  Input --> Validate
  Validate --> ApplyIntent
  ApplyIntent --> SelectStrategy
  SelectStrategy --> ApplyLevel
  ApplyLevel --> ApplyRelation
  ApplyRelation --> ApplyState
  ApplyState --> ApplyContext
  ApplyContext --> Output
