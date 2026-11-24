export type ComponentKind =
  | "text"
  | "image"
  | "button"
  | "elevatedButton"
  | "tonalButton"
  | "outlinedButton"
  | "textButton"
  | "buttonGroup"
  | "extendedFab"
  | "fabMenu"
  | "fab"
  | "iconButton"
  | "segmentedButton"
  | "splitButton"
  | "checkbox"
  | "chip"
  | "filterChip"
  | "inputChip"
  | "suggestionChip"
  | "datePicker"
  | "select"
  | "menu"
  | "radioButton"
  | "search"
  | "slider"
  | "switch"
  | "textField"
  | "timePicker"
  | "appBar"
  | "navigationBar"
  | "navigationDrawer"
  | "navigationRail"
  | "tabs"
  | "toolbar"
  | "bottomSheet"
  | "card"
  | "carousel"
  | "dialog"
  | "divider"
  | "list"
  | "sideSheet"
  | "badge"
  | "loadingIndicator"
  | "circularProgressIndicator"
  | "wavyProgressIndicator"
  | "progressIndicator" // Legacy persisted type migrated to circular
  | "progressIndicator"
  | "snackbar"
  | "tooltip"
  | "xrAppBar"
  | "xrDialog"
  | "xrNavigationBar"
  | "xrNavigationRail"
  | "xrToolbar";

export type CanvasPosition =
  | "flow"
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ComponentCategory =
  | "Basics"
  | "Actions"
  | "Selection & Input"
  | "Navigation"
  | "Containment"
  | "Communication & Feedback"
  | "Extended Reality";

export interface CanvasElement {
  id: string;
  type: ComponentKind;
  label: string;
  width: number;
  height: number;
  fontSize: number;
  radius: number;
  color: string;
  position: CanvasPosition;
  checked?: boolean;
  fillWidth?: boolean;
  fillHeight?: boolean;
  imageSrc?: string;
}

export interface ComponentDefinition {
  type: ComponentKind;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string;
  defaults: Omit<CanvasElement, "id" | "type">;
}

const defaults = {
  fontSize: 14,
  radius: 12,
  color: "#6750a4",
  position: "flow" as const,
};

export const componentDefinitions: ComponentDefinition[] = [
  { type: "text", name: "Text", category: "Basics", description: "Typography label", icon: "T", defaults: { ...defaults, label: "Headline", width: 280, height: 36, fontSize: 24, radius: 0, color: "#292532" } },
  { type: "image", name: "Image placeholder", category: "Basics", description: "Image content area", icon: "▧", defaults: { ...defaults, label: "Add an image", width: 280, height: 160, radius: 16, color: "#e9e5ee" } },
  { type: "button", name: "Filled button", category: "Actions", description: "High-emphasis action", icon: "▰", defaults: { ...defaults, label: "Continue", width: 132, height: 40, radius: 20 } },
  { type: "elevatedButton", name: "Elevated button", category: "Actions", description: "Raised action button", icon: "▱", defaults: { ...defaults, label: "Elevated", width: 132, height: 40, radius: 20 } },
  { type: "tonalButton", name: "Filled tonal button", category: "Actions", description: "Tonal emphasis action", icon: "▰", defaults: { ...defaults, label: "Learn more", width: 144, height: 40, radius: 20 } },
  { type: "outlinedButton", name: "Outlined button", category: "Actions", description: "Outlined action button", icon: "▱", defaults: { ...defaults, label: "Cancel", width: 132, height: 40, radius: 20 } },
  { type: "textButton", name: "Text button", category: "Actions", description: "Low-emphasis action", icon: "T", defaults: { ...defaults, label: "Learn more", width: 112, height: 40, radius: 20 } },
  { type: "buttonGroup", name: "Button group", category: "Actions", description: "Related actions in a connected group", icon: "☷", defaults: { ...defaults, label: "Option", width: 264, height: 40 } },
  { type: "extendedFab", name: "Extended FAB", category: "Actions", description: "Primary action with icon and label", icon: "✚", defaults: { ...defaults, label: "Create", width: 144, height: 56, radius: 16 } },
  { type: "fabMenu", name: "FAB menu", category: "Actions", description: "Expandable floating action menu", icon: "⋮", defaults: { ...defaults, label: "Create", width: 168, height: 220, radius: 16 } },
  { type: "fab", name: "Floating action button", category: "Actions", description: "Primary floating action", icon: "✚", defaults: { ...defaults, label: "Add", width: 56, height: 56, radius: 16 } },
  { type: "iconButton", name: "Icon button", category: "Actions", description: "Compact single-icon action", icon: "♥", defaults: { ...defaults, label: "Favorite", width: 48, height: 48, radius: 24 } },
  { type: "segmentedButton", name: "Segmented buttons", category: "Actions", description: "Choose between related options", icon: "☰", defaults: { ...defaults, label: "Day", width: 260, height: 40 } },
  { type: "splitButton", name: "Split button", category: "Actions", description: "Primary action with a dropdown", icon: "▾", defaults: { ...defaults, label: "Save", width: 176, height: 40, radius: 20 } },

  { type: "checkbox", name: "Checkbox", category: "Selection & Input", description: "Select one or more options", icon: "☑", defaults: { ...defaults, label: "Remember me", width: 220, height: 48, radius: 4, checked: true } },
  { type: "chip", name: "Assist chip", category: "Selection & Input", description: "Contextual suggestion or action", icon: "⬭", defaults: { ...defaults, label: "Get directions", width: 160, height: 40, radius: 20 } },
  { type: "filterChip", name: "Filter chip", category: "Selection & Input", description: "Refine a collection of results", icon: "▽", defaults: { ...defaults, label: "Filter", width: 112, height: 40, radius: 20 } },
  { type: "inputChip", name: "Input chip", category: "Selection & Input", description: "Represent entered information", icon: "●", defaults: { ...defaults, label: "Alex Morgan", width: 144, height: 40, radius: 20 } },
  { type: "suggestionChip", name: "Suggestion chip", category: "Selection & Input", description: "Offer a suggested action", icon: "✦", defaults: { ...defaults, label: "Try a suggestion", width: 168, height: 40, radius: 20 } },
  { type: "datePicker", name: "Date picker", category: "Selection & Input", description: "Select a date or date range", icon: "▦", defaults: { ...defaults, label: "Select date", width: 280, height: 56 } },
  { type: "select", name: "Select", category: "Selection & Input", description: "Choose an option from a list", icon: "▾", defaults: { ...defaults, label: "Choose an option", width: 280, height: 56 } },
  { type: "menu", name: "Menu", category: "Selection & Input", description: "Temporary list of choices", icon: "☰", defaults: { ...defaults, label: "Menu item", width: 220, height: 168, radius: 12 } },
  { type: "radioButton", name: "Radio button", category: "Selection & Input", description: "Choose one option from a set", icon: "◉", defaults: { ...defaults, label: "Option", width: 200, height: 48, radius: 24, checked: true } },
  { type: "search", name: "Search", category: "Selection & Input", description: "Search bar and search view", icon: "⌕", defaults: { ...defaults, label: "Search", width: 320, height: 56, radius: 28 } },
  { type: "slider", name: "Slider", category: "Selection & Input", description: "Select a value or range", icon: "━", defaults: { ...defaults, label: "Volume", width: 280, height: 64, radius: 24 } },
  { type: "switch", name: "Switch", category: "Selection & Input", description: "Toggle a setting on or off", icon: "◉", defaults: { ...defaults, label: "Notifications", width: 240, height: 48, radius: 24, checked: true } },
  { type: "textField", name: "Text field", category: "Selection & Input", description: "Enter and edit text", icon: "▤", defaults: { ...defaults, label: "Email address", width: 280, height: 56, radius: 4 } },
  { type: "timePicker", name: "Time picker", category: "Selection & Input", description: "Select a time using a clock or keyboard", icon: "◷", defaults: { ...defaults, label: "Select time", width: 260, height: 56 } },

  { type: "appBar", name: "App bar", category: "Navigation", description: "Top app bar with navigation and actions", icon: "▬", defaults: { ...defaults, label: "Page title", width: 320, height: 64, radius: 0 } },
  { type: "navigationBar", name: "Navigation bar", category: "Navigation", description: "Switch destinations on compact screens", icon: "▰", defaults: { ...defaults, label: "Home", width: 320, height: 80, radius: 0 } },
  { type: "navigationDrawer", name: "Navigation drawer", category: "Navigation", description: "Side navigation for app destinations", icon: "☰", defaults: { ...defaults, label: "Home", width: 240, height: 280, radius: 16 } },
  { type: "navigationRail", name: "Navigation rail", category: "Navigation", description: "Vertical navigation on larger screens", icon: "▥", defaults: { ...defaults, label: "Home", width: 80, height: 320, radius: 0 } },
  { type: "tabs", name: "Tabs", category: "Navigation", description: "Organize sibling views", icon: "▤", defaults: { ...defaults, label: "Overview", width: 320, height: 48, radius: 0 } },
  { type: "toolbar", name: "Toolbar", category: "Navigation", description: "Contextual actions and controls", icon: "☷", defaults: { ...defaults, label: "Edit", width: 320, height: 56, radius: 16 } },

  { type: "bottomSheet", name: "Bottom sheet", category: "Containment", description: "Supplementary content anchored to the bottom", icon: "▱", defaults: { ...defaults, label: "Sheet content", width: 320, height: 220, radius: 28 } },
  { type: "card", name: "Card", category: "Containment", description: "Group content about a single subject", icon: "▢", defaults: { ...defaults, label: "Card content", width: 280, height: 144, radius: 16 } },
  { type: "carousel", name: "Carousel", category: "Containment", description: "Browse a horizontally scrolling collection", icon: "▧", defaults: { ...defaults, label: "Featured", width: 320, height: 180, radius: 16 } },
  { type: "dialog", name: "Dialog", category: "Containment", description: "Focused modal confirmation or message", icon: "▣", defaults: { ...defaults, label: "Discard changes?", width: 320, height: 200, radius: 28 } },
  { type: "divider", name: "Divider", category: "Containment", description: "Separate content in a layout", icon: "—", defaults: { ...defaults, label: "", width: 280, height: 1, radius: 0, color: "#c9c5d0" } },
  { type: "list", name: "List", category: "Containment", description: "Vertical index of text, icons, and media", icon: "☷", defaults: { ...defaults, label: "List item", width: 280, height: 192, radius: 0 } },
  { type: "sideSheet", name: "Side sheet", category: "Containment", description: "Supplementary content anchored to the side", icon: "▥", defaults: { ...defaults, label: "Details", width: 280, height: 300, radius: 16 } },

  { type: "badge", name: "Badge", category: "Communication & Feedback", description: "Status descriptor or notification count", icon: "●", defaults: { ...defaults, label: "3", width: 56, height: 48, radius: 24 } },
  { type: "loadingIndicator", name: "Loading indicator", category: "Communication & Feedback", description: "Expressive indeterminate wait state", icon: "◌", defaults: { ...defaults, label: "Loading", width: 80, height: 80, radius: 40 } },
  { type: "circularProgressIndicator", name: "Circular progress indicator", category: "Communication & Feedback", description: "Show progress with a circular indicator", icon: "◔", defaults: { ...defaults, label: "Loading", width: 56, height: 56, radius: 28 } },
  { type: "wavyProgressIndicator", name: "Wavy progress indicator", category: "Communication & Feedback", description: "Show progress with an expressive wavy track", icon: "〰", defaults: { ...defaults, label: "Loading", width: 280, height: 56, radius: 28 } },
  { type: "snackbar", name: "Snackbar", category: "Communication & Feedback", description: "Temporary message with an optional action", icon: "▰", defaults: { ...defaults, label: "Message archived", width: 320, height: 56, radius: 8 } },
  { type: "tooltip", name: "Tooltip", category: "Communication & Feedback", description: "Informative label on hover or long press", icon: "▱", defaults: { ...defaults, label: "More information", width: 180, height: 48, radius: 8 } },

  { type: "xrAppBar", name: "XR app bar", category: "Extended Reality", description: "Spatial app bar adaptation", icon: "⌑", defaults: { ...defaults, label: "Spatial app", width: 320, height: 64, radius: 24 } },
  { type: "xrDialog", name: "XR dialog", category: "Extended Reality", description: "Spatial dialog adaptation", icon: "▣", defaults: { ...defaults, label: "Confirm action", width: 320, height: 200, radius: 28 } },
  { type: "xrNavigationBar", name: "XR navigation bar", category: "Extended Reality", description: "Spatial navigation bar adaptation", icon: "▰", defaults: { ...defaults, label: "Home", width: 320, height: 80, radius: 28 } },
  { type: "xrNavigationRail", name: "XR navigation rail", category: "Extended Reality", description: "Spatial navigation rail adaptation", icon: "▥", defaults: { ...defaults, label: "Home", width: 80, height: 320, radius: 24 } },
  { type: "xrToolbar", name: "XR toolbar", category: "Extended Reality", description: "Spatial toolbar adaptation", icon: "☷", defaults: { ...defaults, label: "Actions", width: 320, height: 64, radius: 24 } },
];

export const getDefinition = (type: ComponentKind): ComponentDefinition =>
  componentDefinitions.find((definition) => definition.type === type) ?? componentDefinitions[0];
