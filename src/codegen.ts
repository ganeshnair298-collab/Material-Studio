import type { CanvasElement, CanvasPosition } from "./types";

const escapeXml = (value: string): string =>
  value.replace(/[^\u0009\u000a\u000d\u0020-\uD7FF\uE000-\uFFFD]/g, "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const escapeHtml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const dp = (value: number): string => `${value}.dp`;
const pythonString = (value: string): string => JSON.stringify(value);
const composeAlignment: Partial<Record<CanvasPosition, string>> = {
  "top-left": "TopStart",
  "top-center": "TopCenter",
  "top-right": "TopEnd",
  "center-left": "CenterStart",
  center: "Center",
  "center-right": "CenterEnd",
  "bottom-left": "BottomStart",
  "bottom-center": "BottomCenter",
  "bottom-right": "BottomEnd",
};
const xmlGravity: Partial<Record<CanvasPosition, string>> = {
  "top-left": "top|start",
  "top-center": "top|center_horizontal",
  "top-right": "top|end",
  "center-left": "center_vertical|start",
  center: "center",
  "center-right": "center_vertical|end",
  "bottom-left": "bottom|start",
  "bottom-center": "bottom|center_horizontal",
  "bottom-right": "bottom|end",
};
const htmlPosition: Partial<Record<CanvasPosition, string>> = {
  "top-left": "top:0;left:0",
  "top-center": "top:0;left:50%;transform:translateX(-50%)",
  "top-right": "top:0;right:0",
  "center-left": "top:50%;left:0;transform:translateY(-50%)",
  center: "top:50%;left:50%;transform:translate(-50%,-50%)",
  "center-right": "top:50%;right:0;transform:translateY(-50%)",
  "bottom-left": "bottom:0;left:0",
  "bottom-center": "bottom:0;left:50%;transform:translateX(-50%)",
  "bottom-right": "bottom:0;right:0",
};

export type ExportFormat = "compose" | "xml" | "flet" | "html";

export const formatNames: Record<ExportFormat, string> = {
  compose: "Compose",
  xml: "XML",
  flet: "Flet",
  html: "HTML",
};

function normalizeComponentType(type: CanvasElement["type"]): CanvasElement["type"] {
  if (type === "progressIndicator") return "circularProgressIndicator";
  if (type.startsWith("xr")) {
    return `${type[2].toLowerCase()}${type.slice(3)}` as CanvasElement["type"];
  }
  return type;
}

export function generateCode(elements: CanvasElement[], format: ExportFormat): string {
  if (format === "compose") return generateCompose(elements);
  if (format === "xml") return generateXml(elements);
  if (format === "flet") return generateFlet(elements);
  return generateHtml(elements);
}

function generateCompose(elements: CanvasElement[]): string {
  const renderItem = (item: CanvasElement, positioned = false): string => {
    const text = JSON.stringify(item.label);
    const alignment = positioned ? composeAlignment[item.position] : undefined;
    const modifier = `${item.fillWidth ? "Modifier.fillMaxWidth()" : `Modifier.width(${dp(item.width)})`}${item.fillHeight ? ".fillMaxHeight()" : `.height(${dp(item.height)})`}${alignment ? `.align(Alignment.${alignment})` : ""}`;
    const textStyle = `fontSize = ${item.fontSize}.sp`;
    const color = `Color(0xFF${item.color.replace("#", "").toUpperCase()})`;
    switch (normalizeComponentType(item.type)) {
      case "text":
        return `                Text(${text}, color = ${color}, style = MaterialTheme.typography.titleLarge.copy(${textStyle}), modifier = ${modifier})`;
      case "image":
        return `                Box(modifier = ${modifier}.clip(RoundedCornerShape(${dp(item.radius)})).background(${color}), contentAlignment = Alignment.Center) { Text(${text}, ${textStyle}) }`;
      case "button":
        return `                Button(onClick = {}, modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)}), colors = ButtonDefaults.buttonColors(containerColor = ${color})) { Text(${text}, ${textStyle}) }`;
      case "elevatedButton":
        return `                ElevatedButton(onClick = {}, modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)})) { Text(${text}, ${textStyle}) }`;
      case "tonalButton":
        return `                FilledTonalButton(onClick = {}, modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)})) { Text(${text}, ${textStyle}) }`;
      case "outlinedButton":
        return `                OutlinedButton(onClick = {}, modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)}), colors = ButtonDefaults.outlinedButtonColors(contentColor = ${color})) { Text(${text}, ${textStyle}) }`;
      case "textButton":
        return `                TextButton(onClick = {}, modifier = ${modifier}) { Text(${text}, color = ${color}, ${textStyle}) }`;
      case "buttonGroup":
      case "segmentedButton":
        return `                Row(modifier = ${modifier}, horizontalArrangement = Arrangement.spacedBy(4.dp)) { listOf("Day", "Week", "Month").forEachIndexed { index, label -> OutlinedButton(onClick = {}, colors = ButtonDefaults.outlinedButtonColors(containerColor = if (index == 0) ${color} else Color.Transparent, contentColor = ${color})) { Text(label) } } }`;
      case "extendedFab":
        return `                ExtendedFloatingActionButton(onClick = {}, modifier = ${modifier}, icon = { Text("＋") }, text = { Text(${text}) })`;
      case "fab":
        return `                FloatingActionButton(onClick = {}, modifier = ${modifier}, containerColor = ${color}) { Text("＋") }`;
      case "fabMenu":
        return `                Column(modifier = ${modifier}, horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(8.dp)) { ExtendedFloatingActionButton(onClick = {}, icon = { Text("↑") }, text = { Text("Upload") }); ExtendedFloatingActionButton(onClick = {}, icon = { Text("▣") }, text = { Text("Scan") }); FloatingActionButton(onClick = {}, containerColor = ${color}) { Text("＋") } }`;
      case "iconButton":
        return `                IconButton(onClick = {}, modifier = ${modifier}) { Text("♥", color = ${color}) }`;
      case "splitButton":
        return `                Row(modifier = ${modifier}) { Button(onClick = {}, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = ${color})) { Text(${text}) }; IconButton(onClick = {}) { Text("▾") } }`;
      case "checkbox":
        return `                Row(modifier = ${modifier}, verticalAlignment = Alignment.CenterVertically) { Checkbox(checked = ${Boolean(item.checked)}, onCheckedChange = {}, colors = CheckboxDefaults.colors(checkedColor = ${color})); Text(${text}, ${textStyle}) }`;
      case "chip":
        return `                AssistChip(onClick = {}, modifier = ${modifier}, label = { Text(${text}) }, leadingIcon = { Text("✦") })`;
      case "filterChip":
        return `                FilterChip(selected = ${Boolean(item.checked)}, onClick = {}, modifier = ${modifier}, label = { Text(${text}) })`;
      case "inputChip":
        return `                InputChip(selected = ${Boolean(item.checked)}, onClick = {}, modifier = ${modifier}, label = { Text(${text}) })`;
      case "suggestionChip":
        return `                SuggestionChip(onClick = {}, modifier = ${modifier}, label = { Text(${text}) })`;
      case "datePicker":
        return `                OutlinedTextField(value = "", onValueChange = {}, modifier = ${modifier}, label = { Text("Date") }, singleLine = true)`;
      case "select":
        return `                ExposedDropdownMenuBox(expanded = false, onExpandedChange = {}) { OutlinedTextField(value = "Personal", onValueChange = {}, modifier = ${modifier}, readOnly = true, label = { Text(${text}) }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = false) }) }`;
      case "menu":
        return `                Column(modifier = ${modifier}) { DropdownMenuItem(text = { Text("Edit") }, onClick = {}); DropdownMenuItem(text = { Text("Share") }, onClick = {}); DropdownMenuItem(text = { Text("Move to") }, onClick = {}) }`;
      case "radioButton":
        return `                Row(modifier = ${modifier}, verticalAlignment = Alignment.CenterVertically) { RadioButton(selected = ${Boolean(item.checked)}, onClick = {}); Text(${text}, ${textStyle}) }`;
      case "search":
        return `                OutlinedTextField(value = "", onValueChange = {}, modifier = ${modifier}, label = { Text(${text}) }, leadingIcon = { Text("⌕") }, singleLine = true)`;
      case "slider":
        return `                Column(modifier = ${modifier}, verticalArrangement = Arrangement.Center) { Text(${text}, ${textStyle}); Slider(value = 0.55f, onValueChange = {}) }`;
      case "switch":
        return `                Row(modifier = ${modifier}, verticalAlignment = Alignment.CenterVertically) { Text(${text}, modifier = Modifier.weight(1f), ${textStyle}); Switch(checked = ${Boolean(item.checked)}, onCheckedChange = {}, colors = SwitchDefaults.colors(checkedTrackColor = ${color})) }`;
      case "textField":
        return `                OutlinedTextField(value = "", onValueChange = {}, label = { Text(${text}) }, modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)}), singleLine = true)`;
      case "timePicker":
        return `                Row(modifier = ${modifier}, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) { OutlinedTextField(value = "09", onValueChange = {}, label = { Text("Hour") }, modifier = Modifier.weight(1f), singleLine = true); Text(":"); OutlinedTextField(value = "30", onValueChange = {}, label = { Text("Minute") }, modifier = Modifier.weight(1f), singleLine = true); FilledTonalButton(onClick = {}) { Text("AM") } }`;
      case "appBar":
        return `                TopAppBar(modifier = ${modifier}, title = { Text(${text}) }, navigationIcon = { IconButton(onClick = {}) { Text("‹") } }, actions = { IconButton(onClick = {}) { Text("⋮") } })`;
      case "navigationBar":
        return `                NavigationBar(modifier = ${modifier}) { NavigationBarItem(selected = true, onClick = {}, icon = { Text("⌂") }, label = { Text("Home") }); NavigationBarItem(selected = false, onClick = {}, icon = { Text("▱") }, label = { Text("Saved") }); NavigationBarItem(selected = false, onClick = {}, icon = { Text("♙") }, label = { Text("Profile") }) }`;
      case "navigationDrawer":
        return `                Column(modifier = ${modifier}) { NavigationDrawerItem(label = { Text("Home") }, selected = true, onClick = {}); NavigationDrawerItem(label = { Text("Projects") }, selected = false, onClick = {}); NavigationDrawerItem(label = { Text("Settings") }, selected = false, onClick = {}) }`;
      case "navigationRail":
        return `                NavigationRail(modifier = ${modifier}) { NavigationRailItem(selected = true, onClick = {}, icon = { Text("⌂") }, label = { Text("Home") }); NavigationRailItem(selected = false, onClick = {}, icon = { Text("▱") }, label = { Text("Saved") }); NavigationRailItem(selected = false, onClick = {}, icon = { Text("♙") }, label = { Text("Profile") }) }`;
      case "tabs":
        return `                PrimaryTabRow(selectedTabIndex = 0, modifier = ${modifier}) { Tab(selected = true, onClick = {}, text = { Text("Overview") }); Tab(selected = false, onClick = {}, text = { Text("Details") }); Tab(selected = false, onClick = {}, text = { Text("Activity") }) }`;
      case "toolbar":
        return `                Row(modifier = ${modifier}, verticalAlignment = Alignment.CenterVertically) { TextButton(onClick = {}) { Text("↶") }; TextButton(onClick = {}) { Text("↷") }; Spacer(Modifier.weight(1f)); TextButton(onClick = {}) { Text("⋮") } }`;
      case "bottomSheet":
        return `                Surface(modifier = ${modifier}, shape = RoundedCornerShape(topStart = ${dp(item.radius)}, topEnd = ${dp(item.radius)}), tonalElevation = 3.dp) { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { Text(${text}, style = MaterialTheme.typography.titleMedium); HorizontalDivider(); Text("Share with a contact"); Text("Copy link") } }`;
      case "card":
        return `                Card(modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)}), colors = CardDefaults.cardColors(containerColor = ${color})) { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { Text(${text}, style = MaterialTheme.typography.titleMedium); Text("Supporting text and actions"); TextButton(onClick = {}) { Text("Open") } } }`;
      case "carousel":
        return `                Row(modifier = ${modifier}, horizontalArrangement = Arrangement.spacedBy(8.dp)) { listOf("For you", "Trending").forEach { title -> Card { Column(Modifier.padding(12.dp)) { Box(Modifier.fillMaxWidth().height(80.dp).background(${color})); Text(title) } } } }`;
      case "dialog":
        return `                AlertDialog(modifier = ${modifier}, onDismissRequest = {}, title = { Text(${text}) }, text = { Text("Your changes will not be saved.") }, confirmButton = { TextButton(onClick = {}) { Text("Discard") } }, dismissButton = { TextButton(onClick = {}) { Text("Cancel") } })`;
      case "circularProgressIndicator":
        return `                CircularProgressIndicator(progress = { 0.65f }, modifier = ${modifier}, color = ${color})`;
      case "wavyProgressIndicator":
        return `                LinearWavyProgressIndicator(progress = { 0.65f }, modifier = ${modifier}, color = ${color})`;
      case "divider":
        return `                HorizontalDivider(modifier = ${modifier}, color = ${color})`;
      case "list":
        return `                Column(modifier = ${modifier}) { ListItem(headlineContent = { Text("Design review") }, supportingContent = { Text("Today, 10:30 AM") }, leadingContent = { Text("◷") }); ListItem(headlineContent = { Text("Team meeting") }, supportingContent = { Text("Tomorrow, 2:00 PM") }, leadingContent = { Text("♧") }); ListItem(headlineContent = { Text("Project update") }, supportingContent = { Text("Friday, 9:00 AM") }, leadingContent = { Text("✓") }) }`;
      case "sideSheet":
        return `                Surface(modifier = ${modifier}, shape = RoundedCornerShape(${dp(item.radius)}), tonalElevation = 2.dp) { Column(Modifier.padding(16.dp)) { Text(${text}, style = MaterialTheme.typography.titleMedium); ListItem(headlineContent = { Text("Appearance") }, supportingContent = { Text("Theme and colors") }); ListItem(headlineContent = { Text("Notifications") }, supportingContent = { Text("Manage alerts") }) } }`;
      case "badge":
        return `                BadgedBox(badge = { Badge { Text(${text}.ifEmpty { "3" }) } }) { IconButton(onClick = {}) { Text("♧") } }`;
      case "loadingIndicator":
        return `                Column(modifier = ${modifier}, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) { CircularProgressIndicator(); Text(${text}) }`;
      case "snackbar":
        return `                Snackbar(modifier = ${modifier}, action = { TextButton(onClick = {}) { Text("Undo") } }) { Text(${text}) }`;
      case "tooltip":
        return `                Row(modifier = ${modifier}, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) { IconButton(onClick = {}) { Text("ⓘ") }; Surface(shape = RoundedCornerShape(${dp(item.radius)}), color = MaterialTheme.colorScheme.inverseSurface) { Text(${text}, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), color = MaterialTheme.colorScheme.inverseOnSurface) } }`;
      default:
        throw new Error(`Unsupported Compose component type: ${item.type}`);
    }
  };
  const appBar = elements.find((item) => normalizeComponentType(item.type) === "appBar" && item.position === "flow");
  const bodyElements = elements.filter((item) => item.id !== appBar?.id);
  const flowItems = bodyElements.filter((item) => item.position === "flow").map((item) => renderItem(item));
  const positionedItems = bodyElements.filter((item) => item.position !== "flow").map((item) => renderItem(item, true));
  const flowBody = flowItems.join("\n") || "                // Add components from the palette to populate this layout.";
  const topBar = appBar ? `topBar = { ${renderItem(appBar)} },` : "";
  const layout = `Scaffold(
            ${topBar}
        ) { innerPadding ->
            Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
                Column(
                    modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).padding(22.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
${flowBody}
                }
${positionedItems.join("\n")}
            }
        }`;
  return `// Material 3 Compose layout
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialLayout() {
    MaterialTheme {
        ${layout}
    }
}`;
}

function generateXml(elements: CanvasElement[]): string {
  const renderItem = (item: CanvasElement, positioned = false): string => {
    const label = escapeXml(item.label);
    const gravity = positioned ? xmlGravity[item.position] : undefined;
    const common = `android:layout_width="${item.fillWidth ? "match_parent" : `${item.width}dp`}" android:layout_height="${item.fillHeight ? "match_parent" : `${item.height}dp`}"${gravity ? ` android:layout_gravity="${gravity}"` : ""}`;
    const color = item.color;
    switch (item.type) {
      case "text": return `    <TextView ${common} android:text="${label}" android:textSize="${item.fontSize}sp" android:textColor="${color}" />`;
      case "button": return `    <com.google.android.material.button.MaterialButton ${common} android:text="${label}" android:textSize="${item.fontSize}sp" android:textColor="@android:color/white" android:backgroundTint="${color}" app:cornerRadius="${item.radius}dp" />`;
      case "outlinedButton": return `    <com.google.android.material.button.MaterialButton ${common} android:text="${label}" android:textSize="${item.fontSize}sp" android:textColor="${color}" style="@style/Widget.Material3.Button.OutlinedButton" app:strokeColor="${color}" app:cornerRadius="${item.radius}dp" />`;
      case "textField": return `    <com.google.android.material.textfield.TextInputLayout ${common} android:hint="${label}" app:boxCornerRadiusTopStart="${item.radius}dp" app:boxCornerRadiusTopEnd="${item.radius}dp" app:boxCornerRadiusBottomStart="${item.radius}dp" app:boxCornerRadiusBottomEnd="${item.radius}dp">\n        <com.google.android.material.textfield.TextInputEditText android:layout_width="match_parent" android:layout_height="match_parent" android:textSize="${item.fontSize}sp" />\n    </com.google.android.material.textfield.TextInputLayout>`;
      case "select": return `    <com.google.android.material.textfield.TextInputLayout ${common} android:hint="${label}">\n        <com.google.android.material.textfield.MaterialAutoCompleteTextView android:layout_width="match_parent" android:layout_height="match_parent" android:inputType="none" android:text="Personal" />\n    </com.google.android.material.textfield.TextInputLayout>`;
      case "card": return `    <com.google.android.material.card.MaterialCardView ${common} app:cardCornerRadius="${item.radius}dp" app:cardBackgroundColor="${color}">\n        <TextView android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center_vertical" android:padding="16dp" android:text="${label}" android:textSize="${item.fontSize}sp" />\n    </com.google.android.material.card.MaterialCardView>`;
      case "switch": return `    <com.google.android.material.materialswitch.MaterialSwitch ${common} android:text="${label}" android:textSize="${item.fontSize}sp" android:checked="${Boolean(item.checked)}" app:thumbTint="${color}" app:trackTint="${color}" />`;
      case "checkbox": return `    <com.google.android.material.checkbox.MaterialCheckBox ${common} android:text="${label}" android:textSize="${item.fontSize}sp" android:checked="${Boolean(item.checked)}" app:buttonTint="${color}" />`;
      case "slider": return `    <com.google.android.material.slider.Slider ${common} android:contentDescription="${label}" android:value="0.5" android:valueFrom="0" android:valueTo="1" />`;
      case "chip": return `    <com.google.android.material.chip.Chip ${common} android:text="${label}" android:textSize="${item.fontSize}sp" android:textColor="${color}" app:chipStrokeColor="${color}" app:chipCornerRadius="${item.radius}dp" />`;
      case "circularProgressIndicator": return `    <com.google.android.material.progressindicator.CircularProgressIndicator ${common} android:indeterminate="false" android:progress="65" app:indicatorColor="${color}" />`;
      case "wavyProgressIndicator": return `    <com.google.android.material.progressindicator.LinearProgressIndicator ${common} android:indeterminate="false" android:progress="65" app:indicatorColor="${color}" />`;
      case "divider": return `    <View ${common} android:background="${color}" />`;
      case "image": return `    <FrameLayout ${common} android:background="${color}" android:foreground="?attr/selectableItemBackground" android:contentDescription="${label}">\n        <TextView android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center" android:text="${label}" android:textSize="${item.fontSize}sp" />\n    </FrameLayout>`;
      default: return `    <com.google.android.material.card.MaterialCardView ${common} app:cardCornerRadius="${item.radius}dp">\n        <TextView android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center_vertical" android:padding="16dp" android:text="${label}" android:textSize="${item.fontSize}sp" />\n    </com.google.android.material.card.MaterialCardView>`;
    }
  };
  const flowElements = elements.filter((item) => item.position === "flow");
  const positionedElements = elements.filter((item) => item.position !== "flow");
  const rows = flowElements.map((item) => renderItem(item)).join("\n");
  const positionedRows = positionedElements.map((item) => renderItem(item, true)).join("\n");
  const layout = positionedElements.length
    ? `<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="24dp">
    <LinearLayout android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical">
${rows || "        <!-- Add flow components from the palette to populate this layout. -->"}
    </LinearLayout>
${positionedRows}
</FrameLayout>`
    : `<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">
${rows || "    <!-- Add components from the palette to populate this layout. -->"}
</LinearLayout>`;
  return `<?xml version="1.0" encoding="utf-8"?>
${layout}`;
}

function generateFlet(elements: CanvasElement[]): string {
  const renderControl = (item: CanvasElement): string => {
    const text = pythonString(item.label);
    const color = pythonString(item.color);
    switch (normalizeComponentType(item.type)) {
      case "text": return `ft.Text(${text}, size=${item.fontSize}, color=${color})`;
      case "image": return item.imageSrc
        ? `ft.Image(src_base64=${pythonString(item.imageSrc.split(",").pop() ?? "")}, fit=ft.BoxFit.COVER)`
        : `ft.Container(content=ft.Column([ft.Icon(ft.Icons.IMAGE), ft.Text(${text}, size=${item.fontSize})], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=8), bgcolor=${color}, border_radius=${item.radius}, alignment=ft.Alignment(0, 0))`;
      case "button": return `ft.FilledButton(content=ft.Text(${text}, size=${item.fontSize}), style=ft.ButtonStyle(bgcolor=${color}, color="#ffffff", shape=ft.RoundedRectangleBorder(radius=${item.radius})))`;
      case "elevatedButton": return `ft.ElevatedButton(content=ft.Text(${text}), style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=${item.radius})))`;
      case "tonalButton": return `ft.FilledTonalButton(content=ft.Text(${text}), style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=${item.radius})))`;
      case "outlinedButton": return `ft.OutlinedButton(content=ft.Text(${text}, size=${item.fontSize}), style=ft.ButtonStyle(color=${color}, shape=ft.RoundedRectangleBorder(radius=${item.radius})))`;
      case "textButton": return `ft.TextButton(content=ft.Text(${text}, color=${color}))`;
      case "buttonGroup":
      case "segmentedButton": return `ft.SegmentedButton(selected={"day"}, segments=[ft.Segment(value="day", label=ft.Text("Day")), ft.Segment(value="week", label=ft.Text("Week")), ft.Segment(value="month", label=ft.Text("Month"))])`;
      case "extendedFab": return `ft.FloatingActionButton(content=ft.Row([ft.Icon(ft.Icons.ADD), ft.Text(${text})], spacing=8), bgcolor=${color})`;
      case "fab": return `ft.FloatingActionButton(icon=ft.Icons.ADD, tooltip=${text}, bgcolor=${color})`;
      case "fabMenu": return `ft.Column([ft.FloatingActionButton(icon=ft.Icons.UPLOAD, mini=True, tooltip="Upload"), ft.FloatingActionButton(icon=ft.Icons.DOCUMENT_SCANNER, mini=True, tooltip="Scan"), ft.FloatingActionButton(content=ft.Row([ft.Icon(ft.Icons.ADD), ft.Text(${text})], spacing=8), bgcolor=${color})], horizontal_alignment=ft.CrossAxisAlignment.END, spacing=8)`;
      case "iconButton": return `ft.IconButton(icon=ft.Icons.FAVORITE, tooltip=${text}, icon_color=${color})`;
      case "splitButton": return `ft.Row([ft.FilledButton(content=ft.Text(${text}), style=ft.ButtonStyle(bgcolor=${color})), ft.IconButton(icon=ft.Icons.ARROW_DROP_DOWN, tooltip="More options")], spacing=0)`;
      case "checkbox": return `ft.Checkbox(label=${text}, value=${Boolean(item.checked)}, active_color=${color})`;
      case "chip": return `ft.Chip(label=ft.Text(${text}), leading=ft.Icon(ft.Icons.AUTO_AWESOME))`;
      case "filterChip": return `ft.Chip(label=ft.Text(${text}), selected=${Boolean(item.checked)}, leading=ft.Icon(ft.Icons.FILTER_LIST))`;
      case "inputChip": return `ft.Chip(label=ft.Text(${text}), leading=ft.CircleAvatar(content=ft.Text("A")))`;
      case "suggestionChip": return `ft.Chip(label=ft.Text(${text}), leading=ft.Icon(ft.Icons.LIGHTBULB_OUTLINE))`;
      case "datePicker": return `ft.Column([ft.TextField(label="Date", read_only=True, suffix=ft.Icon(ft.Icons.CALENDAR_MONTH)), ft.Row([ft.Text(day) for day in ["S", "M", "T", "W", "T", "F", "S"]], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)], spacing=4)`;
      case "select": return `ft.Dropdown(label=${text}, value="personal", options=[ft.DropdownOption(key="personal", text="Personal"), ft.DropdownOption(key="work", text="Work"), ft.DropdownOption(key="other", text="Other")])`;
      case "menu": return `ft.Column([ft.ListTile(title=ft.Text("Edit"), leading=ft.Icon(ft.Icons.EDIT)), ft.ListTile(title=ft.Text("Share"), leading=ft.Icon(ft.Icons.SHARE)), ft.ListTile(title=ft.Text("Move to"), leading=ft.Icon(ft.Icons.FOLDER))], spacing=0)`;
      case "radioButton": return `ft.RadioGroup(content=ft.Radio(value="option", label=${text}), value=${pythonString(item.checked ? "option" : "")})`;
      case "search": return `ft.SearchBar(bar_hint_text=${text}, bar_leading=ft.Icon(ft.Icons.SEARCH))`;
      case "slider": return `ft.Column([ft.Text(${text}), ft.Slider(value=0.55, min=0, max=1)], spacing=4)`;
      case "switch": return `ft.Switch(label=${text}, value=${Boolean(item.checked)}, active_color=${color})`;
      case "textField": return `ft.TextField(label=${text}, text_size=${item.fontSize}, border_radius=${item.radius})`;
      case "timePicker": return `ft.Row([ft.TextField(label="Hour", value="09", width=72), ft.Text(":"), ft.TextField(label="Minute", value="30", width=72), ft.FilledTonalButton(content=ft.Text("AM"))], alignment=ft.MainAxisAlignment.CENTER, spacing=4)`;
      case "appBar": return `ft.Row([ft.IconButton(icon=ft.Icons.ARROW_BACK, tooltip="Navigate back"), ft.Container(content=ft.Text(${text}, weight=ft.FontWeight.BOLD), expand=True), ft.IconButton(icon=ft.Icons.MORE_VERT, tooltip="More options")], vertical_alignment=ft.CrossAxisAlignment.CENTER)`;
      case "navigationBar": return `ft.NavigationBar(selected_index=0, destinations=[ft.NavigationBarDestination(icon=ft.Icons.HOME, label="Home"), ft.NavigationBarDestination(icon=ft.Icons.BOOKMARK, label="Saved"), ft.NavigationBarDestination(icon=ft.Icons.PERSON, label="Profile")])`;
      case "navigationDrawer": return `ft.Column([ft.ListTile(title=ft.Text("Home"), leading=ft.Icon(ft.Icons.HOME), selected=True), ft.ListTile(title=ft.Text("Projects"), leading=ft.Icon(ft.Icons.FOLDER)), ft.ListTile(title=ft.Text("Settings"), leading=ft.Icon(ft.Icons.SETTINGS))], spacing=0)`;
      case "navigationRail": return `ft.NavigationRail(selected_index=0, destinations=[ft.NavigationRailDestination(icon=ft.Icons.HOME, label="Home"), ft.NavigationRailDestination(icon=ft.Icons.BOOKMARK, label="Saved"), ft.NavigationRailDestination(icon=ft.Icons.PERSON, label="Profile")])`;
      case "tabs": return `ft.Row([ft.TextButton(content=ft.Text("Overview", weight=ft.FontWeight.BOLD)), ft.TextButton(content=ft.Text("Details")), ft.TextButton(content=ft.Text("Activity"))], alignment=ft.MainAxisAlignment.SPACE_AROUND)`;
      case "toolbar": return `ft.Row([ft.IconButton(icon=ft.Icons.UNDO, tooltip="Undo"), ft.IconButton(icon=ft.Icons.REDO, tooltip="Redo"), ft.Container(expand=True), ft.IconButton(icon=ft.Icons.MORE_VERT, tooltip="More options")], vertical_alignment=ft.CrossAxisAlignment.CENTER)`;
      case "bottomSheet": return `ft.Container(content=ft.Column([ft.Container(width=32, height=4, bgcolor="#79747e", border_radius=2), ft.Text(${text}, weight=ft.FontWeight.BOLD), ft.ListTile(title=ft.Text("Share with a contact")), ft.ListTile(title=ft.Text("Copy link"))], spacing=8), padding=16, bgcolor="#f7f2fa", border_radius=${item.radius})`;
      case "card": return `ft.Card(content=ft.Container(content=ft.Column([ft.Text(${text}, size=${item.fontSize}, weight=ft.FontWeight.BOLD), ft.Text("Supporting text and actions"), ft.TextButton(content=ft.Text("Open"))], spacing=8), padding=16, bgcolor=${color}, border_radius=${item.radius}))`;
      case "carousel": return `ft.Row([ft.Card(content=ft.Container(content=ft.Column([ft.Container(height=80, bgcolor=${color}), ft.Text("For you")]), padding=8)), ft.Card(content=ft.Container(content=ft.Column([ft.Container(height=80, bgcolor=${color}), ft.Text("Trending")]), padding=8))], spacing=8, scroll=ft.ScrollMode.AUTO)`;
      case "dialog": return `ft.Card(content=ft.Container(content=ft.Column([ft.Text(${text}, size=20, weight=ft.FontWeight.BOLD), ft.Text("Your changes will not be saved."), ft.Row([ft.TextButton(content=ft.Text("Cancel")), ft.TextButton(content=ft.Text("Discard"))], alignment=ft.MainAxisAlignment.END)], spacing=12), padding=20, bgcolor="#f7f2fa", border_radius=${item.radius}))`;
      case "divider": return `ft.Divider(height=${Math.max(item.height, 1)}, color=${color}, thickness=${Math.max(item.height, 1)})`;
      case "list": return `ft.Column([ft.ListTile(title=ft.Text("Design review"), subtitle=ft.Text("Today, 10:30 AM"), leading=ft.Icon(ft.Icons.EVENT)), ft.ListTile(title=ft.Text("Team meeting"), subtitle=ft.Text("Tomorrow, 2:00 PM"), leading=ft.Icon(ft.Icons.GROUPS)), ft.ListTile(title=ft.Text("Project update"), subtitle=ft.Text("Friday, 9:00 AM"), leading=ft.Icon(ft.Icons.TASK_ALT))], spacing=0)`;
      case "sideSheet": return `ft.Container(content=ft.Column([ft.Text(${text}, weight=ft.FontWeight.BOLD), ft.ListTile(title=ft.Text("Appearance"), subtitle=ft.Text("Theme and colors")), ft.ListTile(title=ft.Text("Notifications"), subtitle=ft.Text("Manage alerts"))], spacing=8), padding=16, bgcolor="#f7f2fa", border_radius=${item.radius})`;
      case "badge": return `ft.Stack(controls=[ft.Icon(ft.Icons.NOTIFICATIONS), ft.Container(content=ft.Text(${pythonString(item.label || "3")}, size=10, color="#ffffff"), left=24, top=0, padding=4, bgcolor=${color}, border_radius=12)], width=56, height=48)`;
      case "loadingIndicator": return `ft.Column([ft.ProgressRing(), ft.Text(${text})], horizontal_alignment=ft.CrossAxisAlignment.CENTER, alignment=ft.MainAxisAlignment.CENTER, spacing=8)`;
      case "circularProgressIndicator": return `ft.ProgressRing(value=0.65, color=${color})`;
      case "wavyProgressIndicator": return `ft.ProgressBar(value=0.65, color=${color})`;
      case "snackbar": return `ft.Container(content=ft.Row([ft.Text(${text}, expand=True), ft.TextButton(content=ft.Text("Undo"))]), padding=12, bgcolor="#313033", border_radius=${item.radius})`;
      case "tooltip": return `ft.Row([ft.Icon(ft.Icons.INFO_OUTLINE, color=${color}), ft.Container(content=ft.Text(${text}), padding=8, bgcolor="#313033", border_radius=${item.radius})], spacing=8)`;
      default: throw new Error(`Unsupported Flet component type: ${item.type}`);
    }
  };
  const appBar = elements.find((item) => normalizeComponentType(item.type) === "appBar" && item.position === "flow");
  const bodyElements = elements.filter((item) => item.id !== appBar?.id);
  const flowElements = bodyElements.filter((item) => item.position === "flow");
  const positionedElements = bodyElements.filter((item) => item.position !== "flow");
  const canvasWidth = 316;
  const canvasHeight = 616;
  const flowControls = flowElements.map((item) => `                ft.Container(content=${renderControl(item)}, width=${item.fillWidth ? canvasWidth : item.width}, height=${item.fillHeight ? canvasHeight : item.height}, alignment=ft.Alignment(0, 0))`).join(",\n");
  const positionedControls = positionedElements.map((item) => {
    const width = item.fillWidth ? canvasWidth : item.width;
    const height = item.fillHeight ? canvasHeight : item.height;
    const left = item.position.endsWith("left") ? 0 : item.position.endsWith("right") ? canvasWidth - width : (canvasWidth - width) / 2;
    const top = item.position.startsWith("top") ? 0 : item.position.startsWith("bottom") ? canvasHeight - height : (canvasHeight - height) / 2;
    return `                ft.Container(content=${renderControl(item)}, width=${width}, height=${height}, left=${left}, top=${top}, alignment=ft.Alignment(0, 0))`;
  }).join(",\n");
  const controls = positionedElements.length
    ? `ft.Stack(width=${canvasWidth}, height=${canvasHeight}, controls=[
            ft.Column(controls=[
${flowControls || "                # Add flow components from the palette to populate this layout."}
            ], width=${canvasWidth}, height=${canvasHeight}, spacing=14, scroll=ft.ScrollMode.AUTO),
${positionedControls}
        ])`
    : `ft.Column(
        controls=[
${flowControls || "                # Add components from the palette to populate this layout."}
        ],
        width=${canvasWidth},
        spacing=14,
        scroll=ft.ScrollMode.AUTO,
    )`;
  const appBarCode = appBar
    ? `    page.appbar = ft.AppBar(
        title=ft.Text(${pythonString(appBar.label)}),
        leading=ft.IconButton(icon=ft.Icons.ARROW_BACK, tooltip="Navigate back"),
        actions=[ft.IconButton(icon=ft.Icons.MORE_VERT, tooltip="More options")],
        toolbar_height=${appBar.height},
        color=${pythonString(appBar.color)},
        color=${pythonString(appBar.color)},
    )
`
    : "";
  return `import flet as ft

def main(page: ft.Page):
    page.title = "Material 3 layout"
    page.padding = 0
    page.theme = ft.Theme(color_scheme_seed="#65558f", use_material3=True)
${appBarCode}    page.add(
        ft.Container(
            content=${controls},
            width=${canvasWidth + 44},
            padding=22,
        )
    )

ft.run(main, view=ft.AppView.WEB_BROWSER)`;
}

function generateHtml(elements: CanvasElement[]): string {
  const markup = elements.map((item) => {
    const label = escapeHtml(item.label);
    const positioning = item.position === "flow" ? "" : `position:absolute;${htmlPosition[item.position]};`;
    const style = `${positioning}width:${item.fillWidth ? "100%" : `${item.width}px`};height:${item.fillHeight ? "100%" : `${item.height}px`};font-size:${item.fontSize}px;border-radius:${item.radius}px;--accent:${item.color}`;
    switch (item.type) {
      case "text": return `      <div class="text" style="${style}">${label}</div>`;
      case "button": return `      <button class="filled" style="${style}">${label}</button>`;
      case "elevatedButton": return `      <button class="elevated" style="${style}">${label}</button>`;
      case "tonalButton": return `      <button class="tonal" style="${style}">${label}</button>`;
      case "outlinedButton": return `      <button class="outlined" style="${style}">${label}</button>`;
      case "textButton": return `      <button class="text-button" style="${style}">${label}</button>`;
      case "textField": return `      <label class="field" style="${style}"><span>${label}</span><input aria-label="${label}" /></label>`;
      case "select": return `      <label class="field" style="${style}"><span>${label}</span><select aria-label="${label}"><option>Personal</option><option>Work</option><option>Other</option></select></label>`;
      case "card": return `      <article class="card" style="${style}">${label}</article>`;
      case "switch": return `      <label class="choice" style="${style}"><span>${label}</span><input type="checkbox" role="switch" ${item.checked ? "checked" : ""} /></label>`;
      case "checkbox": return `      <label class="choice" style="${style}"><input type="checkbox" ${item.checked ? "checked" : ""} /><span>${label}</span></label>`;
      case "slider": return `      <label class="slider" style="${style}"><span>${label}</span><input type="range" min="0" max="100" value="50" /></label>`;
      case "chip": return `      <button class="chip" style="${style}">${label}</button>`;
      case "circularProgressIndicator": return `      <div class="circular-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65" style="${style}"><svg viewBox="0 0 48 48" aria-hidden="true"><circle class="progress-track" cx="24" cy="24" r="20" /><circle class="progress-indicator" cx="24" cy="24" r="20" /></svg></div>`;
      case "wavyProgressIndicator": return `      <div class="wavy-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65" style="${style}"><svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path class="progress-track" d="M 0 12 C 4 4, 8 4, 12 12 S 20 20, 24 12 S 32 4, 36 12 S 44 20, 48 12 S 56 4, 60 12 S 68 20, 72 12 S 80 4, 84 12 S 92 20, 96 12 S 100 4, 104 12" /><path class="progress-indicator" pathLength="100" stroke-dasharray="65 35" d="M 0 12 C 4 4, 8 4, 12 12 S 20 20, 24 12 S 32 4, 36 12 S 44 20, 48 12 S 56 4, 60 12 S 68 20, 72 12 S 80 4, 84 12 S 92 20, 96 12 S 100 4, 104 12" /></svg></div>`;
      case "divider": return `      <hr style="width:${item.width}px;border-color:${item.color}" />`;
      case "image": return `      <div class="image" role="img" aria-label="${label}" style="${style}">${item.imageSrc ? `<img src="${escapeHtml(item.imageSrc)}" alt="${label}" />` : `<span class="image-placeholder-icon" aria-hidden="true">▧</span><span>${label}</span>`}</div>`;
      case "navigationBar":
      case "xrNavigationBar": return `      <nav class="navigation-bar" aria-label="Primary navigation" style="${style}"><a class="active" href="#"><span>⌂</span>Home</a><a href="#"><span>▱</span>Saved</a><a href="#"><span>♙</span>Profile</a></nav>`;
      case "navigationRail":
      case "xrNavigationRail": return `      <nav class="navigation-rail" aria-label="Primary navigation" style="${style}"><a class="active" href="#"><span>⌂</span>Home</a><a href="#"><span>▱</span>Saved</a><a href="#"><span>♙</span>Profile</a></nav>`;
      case "appBar":
      case "xrAppBar": return `      <header class="app-bar" style="${style}"><span aria-hidden="true">‹</span><strong>${label}</strong><span aria-hidden="true">⋮</span></header>`;
      default: return `      <section class="m3-component m3-${item.type}" style="${style}">${label}</section>`;
    }
  }).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Material 3 layout</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font: 14px Arial, sans-serif; color: #292532; background: #f5f3fa; }
    main { position: relative; min-height: 616px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
    button, input { font: inherit; }
    .text { display: flex; align-items: center; font-weight: 600; }
    .filled, .elevated, .tonal, .outlined, .text-button, .chip { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600; }
    .filled { border: 0; color: white; background: var(--accent); }
    .elevated { border: 0; color: var(--accent); background: #f7f2fa; box-shadow: 0 2px 4px #0003; }
    .tonal { border: 0; color: #332d41; background: color-mix(in srgb, var(--accent) 16%, white); }
    .outlined, .chip { color: var(--accent); border: 1px solid var(--accent); background: transparent; }
    .text-button { border: 0; color: var(--accent); background: transparent; }
    .field, .choice, .slider { display: flex; align-items: center; gap: 12px; }
    .field { flex-direction: column; align-items: flex-start; justify-content: center; border: 1px solid #79747e; padding: 8px 12px; }
    .field input, .field select { width: 100%; border: 0; outline: 0; background: transparent; }
    .card, .image { display: flex; align-items: center; padding: 16px; background: var(--accent); }
    .image { position: relative; flex-direction: column; justify-content: center; gap: 8px; overflow: hidden; color: #49454f; border: 1px dashed #79747e; background: color-mix(in srgb, var(--accent) 18%, white); }
    .image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .image-placeholder-icon { font-size: 28px; }
    .navigation-bar { display: flex; align-items: center; justify-content: space-around; padding: 8px 12px; background: #f7f2fa; }
    .navigation-bar a, .navigation-rail a { display: flex; min-width: 64px; flex-direction: column; align-items: center; gap: 4px; color: #49454f; font-size: 12px; text-decoration: none; }
    .navigation-bar a span, .navigation-rail a span { min-width: 56px; padding: 4px 0; border-radius: 18px; font-size: 20px; text-align: center; }
    .navigation-bar a.active, .navigation-rail a.active { color: var(--accent); }
    .navigation-bar a.active span, .navigation-rail a.active span { background: color-mix(in srgb, var(--accent) 18%, white); }
    .navigation-rail { display: flex; flex-direction: column; justify-content: space-around; padding: 12px 4px; background: #f7f2fa; }
    .app-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 12px; background: #f7f2fa; }
    .choice input, .slider input { accent-color: var(--accent); }
    .slider { flex-direction: column; align-items: stretch; justify-content: center; }
    .circular-progress, .wavy-progress { position: relative; display: flex; align-items: center; justify-content: center; }
    .circular-progress { background: transparent; }
    .circular-progress svg { width: 48px; height: 48px; transform: rotate(-90deg); }
    .wavy-progress svg { width: 100%; height: 24px; overflow: visible; }
    .progress-track, .progress-indicator { fill: none; stroke-width: 3; stroke-linecap: round; }
    .progress-track { stroke: color-mix(in srgb, var(--accent) 18%, transparent); }
    .progress-indicator { stroke: var(--accent); }
    .circular-progress .progress-track, .circular-progress .progress-indicator { stroke-width: 4; }
    .circular-progress .progress-track { stroke-dasharray: 126; }
    .circular-progress .progress-indicator { stroke-dasharray: 82 44; }
    hr { margin: 0; border: 0; border-top: 1px solid; }
    @media (prefers-color-scheme: dark) { body { color: #f2eff6; background: #1c1b20; } .navigation-bar, .navigation-rail, .app-bar { background: #302d37; } .navigation-bar a, .navigation-rail a { color: #e6e1e9; } .elevated { color: #eaddff; background: #302d37; } .image { color: #e6e1e9; background: color-mix(in srgb, var(--accent) 25%, #24212b); } }
  </style>
</head>
<body>
  <main>
${markup || "    <!-- Add components from the palette to populate this layout. -->"}
  </main>
</body>
</html>`;
}
