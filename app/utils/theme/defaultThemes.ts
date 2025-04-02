// themes.css should have 2 classes: .theme-{name} and .dark.theme-{name}
export const defaultTheme = "default";

// this array could be empty, it's only used by ThemeSelector
export const defaultThemes: { name: string; value: string }[] = [
  // { name: "Default", value: "default" },
  { name: "Zinc", value: "zinc" },
  { name: "Blue", value: "blue" },
  { name: "Violet", value: "violet" },
  { name: "Material", value: "material" },
  { name: "Default", value: "default" },
  // { name: "Slate", value: "slate" },
  // { name: "Stone", value: "stone" },
  // { name: "Gray", value: "gray" },
  // { name: "Neutral", value: "neutral" },
  // { name: "Red", value: "red" },
  // { name: "Rose", value: "rose" },
  // { name: "Orange", value: "orange" },
  // { name: "Green", value: "green" },
  // { name: "Yellow", value: "yellow" },
];
