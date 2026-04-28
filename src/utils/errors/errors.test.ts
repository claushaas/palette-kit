import { describe, expect, it } from "vitest";

import {
  createForbiddenAxisCombinationError,
  createMissingRequiredAxisError,
  createUnknownIntentError,
  createUnsupportedOutputError,
  PaletteKitError,
} from "./errors.js";

describe("PaletteKitError", () => {
  it("preserves message, code, category, and details", () => {
    const error = new PaletteKitError("UNKNOWN_INTENT", "configuration", "Unknown intent.", {
      intent: "refund",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PaletteKitError);
    expect(error.name).toBe("PaletteKitError");
    expect(error.message).toBe("Unknown intent.");
    expect(error.code).toBe("UNKNOWN_INTENT");
    expect(error.category).toBe("configuration");
    expect(error.details).toEqual({ intent: "refund" });
    expect(Object.isFrozen(error.details)).toBe(true);
  });

  it("creates unknown intent errors with the existing message", () => {
    const error = createUnknownIntentError("refund");

    expect(error).toBeInstanceOf(PaletteKitError);
    expect(error.code).toBe("UNKNOWN_INTENT");
    expect(error.category).toBe("configuration");
    expect(error.message).toBe(
      'Unknown intent "refund". Did you forget to register it in the Intent Registry?',
    );
  });

  it("creates missing axis errors as resolver input errors", () => {
    const error = createMissingRequiredAxisError("Level", "fill");

    expect(error).toBeInstanceOf(PaletteKitError);
    expect(error.code).toBe("MISSING_REQUIRED_AXIS");
    expect(error.category).toBe("resolver-input");
    expect(error.message).toBe('Level is required for usage "fill".');
  });

  it("creates forbidden axis combination errors as resolver input errors", () => {
    const error = createForbiddenAxisCombinationError("Level", "visualVocabulary");

    expect(error).toBeInstanceOf(PaletteKitError);
    expect(error.code).toBe("FORBIDDEN_AXIS_COMBINATION");
    expect(error.category).toBe("resolver-input");
    expect(error.message).toBe('Level is not allowed for usage "visualVocabulary".');
  });

  it("creates unsupported output errors as serialization errors", () => {
    const error = createUnsupportedOutputError("p3");

    expect(error).toBeInstanceOf(PaletteKitError);
    expect(error.code).toBe("UNSUPPORTED_OUTPUT");
    expect(error.category).toBe("serialization");
    expect(error.message).toBe('Unsupported color output "p3" in Phase 10 serializer.');
  });
});
