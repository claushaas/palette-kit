import { createTheme, toReactNative } from "@claus/palette-kit";
import { useMemo } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

const theme = createTheme({
  neutral: { source: "seed", value: "#111827" },
  accent: { source: "seed", value: "#3d63dd" },
  semantic: {
    success: { source: "seed", value: "#16a34a" },
    warning: { source: "seed", value: "#f59e0b" },
    danger: { source: "seed", value: "#ef4444" },
  },
  tokens: { preset: "radix-like-ui" },
  alpha: { enabled: true },
  contrast: { textPrimary: 75, textSecondary: 60 },
  p3: true,
});

export default function App() {
  const colorScheme = useColorScheme();

  const palette = useMemo(() => toReactNative(theme), []);
  const colors = colorScheme === "dark" ? palette.dark.tokens : palette.light.tokens;

  return (
    <View style={[styles.container, { backgroundColor: colors["bg.app"] }]}>
      <Text style={[styles.title, { color: colors["text.primary"] }]}>Palette Kit</Text>
      <Text style={[styles.body, { color: colors["text.secondary"] }]}>
        Radix-like steps with OKLCH + APCA.
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors["surface.card"],
            borderColor: colors["border.subtle"],
          },
        ]}
      >
        <Text style={[styles.cardText, { color: colors["text.primary"] }]}>Card content</Text>
      </View>

      <View style={[styles.accent, { backgroundColor: colors["accent.solid"] }]}>
        <Text style={[styles.accentText, { color: colors["onSolid.primary"] }]}>Action</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
  },
  card: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardText: {
    fontSize: 16,
  },
  accent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  accentText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
