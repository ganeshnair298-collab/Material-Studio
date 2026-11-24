import { createElement as createReactElement, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, DragEvent, DragEventHandler, ReactNode } from "react";
import "@material/web/button/elevated-button.js";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";
import "@material/web/checkbox/checkbox.js";
import "@material/web/chips/assist-chip.js";
import "@material/web/chips/filter-chip.js";
import "@material/web/chips/input-chip.js";
import "@material/web/chips/suggestion-chip.js";
import "@material/web/dialog/dialog.js";
import "@material/web/divider/divider.js";
import "@material/web/fab/fab.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/labs/badge/badge.js";
import "@material/web/labs/card/elevated-card.js";
import "@material/web/labs/card/filled-card.js";
import "@material/web/labs/navigationbar/navigation-bar.js";
import "@material/web/labs/navigationdrawer/navigation-drawer.js";
import "@material/web/labs/navigationtab/navigation-tab.js";
import "@material/web/labs/segmentedbutton/outlined-segmented-button.js";
import "@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";
import "@material/web/progress/circular-progress.js";
import "@material/web/progress/linear-progress.js";
import "@material/web/radio/radio.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/slider/slider.js";
import "@material/web/switch/switch.js";
import "@material/web/tabs/primary-tab.js";
import "@material/web/tabs/secondary-tab.js";
import "@material/web/tabs/tabs.js";
import "@material/web/textfield/filled-text-field.js";
import "@material/web/textfield/outlined-text-field.js";
import {
  AlignLeft, ArrowDown, ArrowLeft, ArrowUp, Check, ChevronDown, ChevronRight,
  Clipboard, Code2, Copy, Download, Eye, EyeOff, FileCode2, ImagePlus, Layers2, Monitor, Moon,
  MoreHorizontal, Plus, Redo2, Search, Settings2, Smartphone, Sun, Trash2, Undo2, X,
} from "lucide-react";
import { formatNames, generateCode, type ExportFormat } from "./codegen";
import { componentDefinitions, getDefinition, type CanvasElement, type CanvasPosition, type ComponentKind } from "./types";

const STORAGE_KEY = "material-layout-studio-v1";
const THEME_STORAGE_KEY = "material-layout-studio-theme";
const exportFormats: ExportFormat[] = ["compose", "xml", "flet", "html"];
type DeviceSize = "phone" | "tablet" | "desktop";
const positionOptions: { value: CanvasPosition; label: string }[] = [
  { value: "flow", label: "Flow" },
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "center-left", label: "Center left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Center bottom" },
  { value: "bottom-right", label: "Bottom right" },
];

function createElement(type: ComponentKind): CanvasElement {
  const definition = getDefinition(type);
  return { ...definition.defaults, type, id: crypto.randomUUID() };
}

function readSavedElements(): CanvasElement[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed)
      ? (parsed as CanvasElement[]).map((element) => ({
        ...element,
        type: element.type === "progressIndicator" ? "circularProgressIndicator" : element.type,
        position: element.position ?? "flow",
      }))
      : [];
  } catch {
    return [];
  }
}

function App() {
  const [elements, setElements] = useState<CanvasElement[]>(readSavedElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [format, setFormat] = useState<ExportFormat>("compose");
  const [query, setQuery] = useState("");
  const [device, setDevice] = useState<DeviceSize>("phone");
  const [darkTheme, setDarkTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) === "dark");
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [future, setFuture] = useState<CanvasElement[][]>([]);
  const [notice, setNotice] = useState("");
  const dragId = useRef<string | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, darkTheme ? "dark" : "light");
    window.materialStudio?.setTitleBarTheme(darkTheme ? "dark" : "light");
  }, [darkTheme]);

  const selected = elements.find((element) => element.id === selectedId) ?? null;
  const generatedCode = useMemo(() => generateCode(elements, format), [elements, format]);
  const filteredDefinitions = componentDefinitions.filter((definition) =>
    `${definition.name} ${definition.category} ${definition.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const groupedDefinitions = [
    "Basics",
    "Actions",
    "Selection & Input",
    "Navigation",
    "Containment",
    "Communication & Feedback",
    "Extended Reality",
  ] as const;

  function commit(next: CanvasElement[]) {
    setHistory((previous) => [...previous.slice(-39), elements]);
    setFuture([]);
    setElements(next);
  }

  function addElement(type: ComponentKind) {
    const item = createElement(type);
    commit([...elements, item]);
    setSelectedId(item.id);
  }

  function updateSelected(updates: Partial<CanvasElement>) {
    if (!selected) return;
    commit(elements.map((element) => element.id === selected.id ? { ...element, ...updates } : element));
  }

  function pickImage(file?: File) {
    if (!selected || selected.type !== "image" || !file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file to place in the placeholder.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setNotice("Choose an image smaller than 3 MB so it can be saved with this layout.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateSelected({ imageSrc: reader.result });
    };
    reader.onerror = () => setNotice("This image could not be opened.");
    reader.readAsDataURL(file);
  }

  function removeSelected() {
    if (!selected) return;
    commit(elements.filter((element) => element.id !== selected.id));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = { ...selected, id: crypto.randomUUID(), label: selected.label ? `${selected.label} copy` : "" };
    const index = elements.findIndex((element) => element.id === selected.id);
    const next = [...elements];
    next.splice(index + 1, 0, copy);
    commit(next);
    setSelectedId(copy.id);
  }

  function moveElement(id: string, direction: -1 | 1) {
    const index = elements.findIndex((element) => element.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= elements.length) return;
    const next = [...elements];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((items) => [...items, elements]);
    setElements(previous);
    setHistory((items) => items.slice(0, -1));
  }

  function redo() {
    const next = future.at(-1);
    if (!next) return;
    setHistory((items) => [...items, elements]);
    setElements(next);
    setFuture((items) => items.slice(0, -1));
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNotice("Clipboard access is unavailable. Select and copy the code manually.");
      window.setTimeout(() => setNotice(""), 3500);
    }
  }

  function downloadCode() {
    const extensions: Record<ExportFormat, string> = { compose: "kt", xml: "xml", flet: "py", html: "html" };
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `material-layout.${extensions[format]}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function dropOnCanvas(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const type = event.dataTransfer.getData("component-type") as ComponentKind;
    if (type && componentDefinitions.some((definition) => definition.type === type)) {
      addElement(type);
      return;
    }
    const movingId = event.dataTransfer.getData("element-id") || dragId.current;
    if (!movingId) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-element-id]");
    const targetId = target?.dataset.elementId;
    if (!targetId || movingId === targetId) return;
    const next = [...elements];
    const from = next.findIndex((item) => item.id === movingId);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  }

  return (
    <main className={`app-shell ${darkTheme ? "theme-dark" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><span /><span /><span /></div>
          <div className="brand-name">material<span>studio</span></div>
          <span className="saved-state"><span /> Saved</span>
        </div>
        <div className="top-actions">
          <div className="history-actions">
            <button className="icon-button" disabled={!history.length} onClick={undo} title="Undo"><Undo2 size={17} /></button>
            <button className="icon-button" disabled={!future.length} onClick={redo} title="Redo"><Redo2 size={17} /></button>
          </div>
          <div className="top-divider" />
          <button className="icon-button theme-toggle" onClick={() => setDarkTheme(!darkTheme)} title={darkTheme ? "Switch to light mode" : "Switch to dark mode"} aria-label={darkTheme ? "Switch to light mode" : "Switch to dark mode"}>{darkTheme ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="share-button" onClick={downloadCode}><Download size={15} /> Export</button>
        </div>
      </header>

      <div className="workspace">
        {showPalette && <aside className="left-panel panel">
          <div className="panel-heading">
            <div><h2>Components</h2><p>Drag onto your canvas</p></div>
            <button className="icon-button panel-close" onClick={() => setShowPalette(false)} title="Hide components"><X size={15} /></button>
          </div>
          <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a component" /><kbd>⌘ K</kbd></label>
          <div className="component-groups">
            {groupedDefinitions.map((group) => {
              const definitions = filteredDefinitions.filter((definition) => definition.category === group);
              if (!definitions.length) return null;
              return <section className="component-group" key={group}>
                <div className="group-title">{group}<span>{definitions.length}</span></div>
                <div className="component-grid">
                  {definitions.map((definition) => <button
                    className="component-tile"
                    key={definition.type}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("component-type", definition.type)}
                    onClick={() => addElement(definition.type)}
                    title={`${definition.description} — click or drag to add`}
                  >
                    <span className={`component-glyph glyph-${definition.type}`}>{definition.icon}</span>
                    <span className="tile-label">{definition.name}</span>
                  </button>)}
                </div>
              </section>;
            })}
            {!filteredDefinitions.length && <div className="empty-search">No components match “{query}”.</div>}
          </div>
          <div className="palette-tip"><span className="tip-icon">✦</span><div><strong>Quick tip</strong><p>Click a component or drag it to the canvas to get started.</p></div></div>
        </aside>}

        <section className="center-panel">
          <div className="canvas-toolbar">
            <div className="canvas-title"><strong>Canvas</strong><span className="canvas-count">{elements.length} {elements.length === 1 ? "element" : "elements"}</span></div>
            <div className="canvas-tools">
              <div className="device-switch" aria-label="Canvas device size">
                <button className={device === "phone" ? "active" : ""} onClick={() => setDevice("phone")} title="Phone canvas"><Smartphone size={15} /></button>
                <button className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")} title="Tablet canvas"><Monitor size={15} /></button>
                <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")} title="Desktop canvas"><Layers2 size={15} /></button>
              </div>
              <span className="toolbar-separator" />
              <button className="zoom-value" onClick={() => setZoom(zoom === 100 ? 75 : zoom === 75 ? 125 : 100)} title="Change zoom">{zoom}% <ChevronDown size={13} /></button>
            </div>
          </div>
          <div className={`canvas-stage ${darkTheme ? "dark-stage" : ""}`}>
            <div
              className={`artboard artboard-${device} ${elements.some((element) => element.fillHeight) ? "artboard-fill-height" : ""}`}
              style={{ transform: `scale(${zoom / 100})` }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={dropOnCanvas}
              onClick={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}
            >
              <div className="artboard-content">
                {!elements.length ? <div className="canvas-empty">
                  <div className="empty-illustration"><div className="illustration-sheet"><span /><span /><span /><i>+</i></div></div>
                  <h3>Your canvas is ready</h3>
                  <p>Drag a component here or choose one<br />from the panel to start designing.</p>
                  <button className="empty-add" onClick={() => addElement("text")}><Plus size={16} /> Add a text element</button>
                </div> : elements.map((element, index) => <CanvasItem
                  key={element.id}
                  element={element}
                  selected={element.id === selectedId}
                  onSelect={() => setSelectedId(element.id)}
                  onDragStart={(event) => {
                    dragId.current = element.id;
                    event.dataTransfer.setData("element-id", element.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onToggle={() => commit(elements.map((item) => item.id === element.id ? { ...item, checked: !item.checked } : item))}
                  index={index}
                />)}
              </div>
            </div>
          </div>
          <div className="canvas-footer">
            <button className="footer-link" onClick={() => setShowPalette(!showPalette)}>{showPalette ? <EyeOff size={14} /> : <Eye size={14} />} {showPalette ? "Hide components" : "Show components"}</button>
            <span className="footer-hint">Drag to reorder · Click to edit</span>
          </div>
        </section>

        {showInspector && <aside className="right-panel">
          <div className="inspector-section">
            <div className="inspector-title"><h2>Properties</h2><button className="icon-button" onClick={() => setShowInspector(false)} title="Hide properties"><X size={15} /></button></div>
            {selected ? <>
              <div className="selected-component"><span className={`component-glyph glyph-${selected.type}`}>{getDefinition(selected.type).icon}</span><div><strong>{getDefinition(selected.type).name}</strong><span>Material 3 component</span></div><button className="more-button" title="Duplicate component" onClick={duplicateSelected}><Copy size={15} /></button></div>
              <div className="property-block">
                <label className="field-label" htmlFor="component-label">Label</label>
                <input id="component-label" className="text-input" value={selected.label} onChange={(event) => updateSelected({ label: event.target.value })} placeholder="Enter text" />
              </div>
              {selected.type === "image" && <div className="property-block">
                <button className="pick-image-button" onClick={() => imageInput.current?.click()}><ImagePlus size={15} /> Pick a picture</button>
                <input ref={imageInput} className="visually-hidden" type="file" accept="image/*" onChange={(event) => {
                  pickImage(event.target.files?.[0]);
                  event.target.value = "";
                }} />
              </div>}
              <div className="property-block">
                <div className="field-label">Dimensions <span>dp</span></div>
                <div className="dimension-row">
                  <label><span>W</span><input type="number" min="1" max="1200" value={selected.width} disabled={selected.fillWidth} onChange={(event) => updateSelected({ width: boundedNumber(event.target.value, 1, 1200, selected.width) })} /></label>
                  <span className="dimension-x">×</span>
                  <label><span>H</span><input type="number" min="1" max="1200" value={selected.height} disabled={selected.fillHeight} onChange={(event) => updateSelected({ height: boundedNumber(event.target.value, 1, 1200, selected.height) })} /></label>
                </div>
                <div className="dimension-fill-options">
                  <button className={`fill-toggle ${selected.fillWidth ? "active" : ""}`} aria-pressed={Boolean(selected.fillWidth)} onClick={() => updateSelected({ fillWidth: !selected.fillWidth })}>Full width</button>
                  <button className={`fill-toggle ${selected.fillHeight ? "active" : ""}`} aria-pressed={Boolean(selected.fillHeight)} onClick={() => updateSelected({ fillHeight: !selected.fillHeight })}>Full height</button>
                </div>
              </div>
              <div className="property-block">
                <label className="field-label" htmlFor="component-position">Position</label>
                <select
                  id="component-position"
                  className="text-input"
                  value={selected.position}
                  onChange={(event) => updateSelected({ position: event.target.value as CanvasPosition })}
                >
                  {positionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              {selected.type !== "divider" && selected.type !== "switch" && selected.type !== "checkbox" && <div className="property-block">
                <div className="field-label">Corner radius <span>{selected.radius} dp</span></div>
                <input className="range-input" type="range" min="0" max="40" value={selected.radius} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} />
              </div>}
              {(selected.type === "text" || selected.type === "button" || selected.type === "outlinedButton" || selected.type === "textField" || selected.type === "card" || selected.type === "chip" || selected.type === "image") && <div className="property-block">
                <div className="field-label">Text size <span>{selected.fontSize} sp</span></div>
                <input className="range-input" type="range" min="10" max="36" value={selected.fontSize} onChange={(event) => updateSelected({ fontSize: Number(event.target.value) })} />
              </div>}
              <div className="property-block">
                <div className="field-label">Color</div>
                <div className="color-control">
                  <label className="color-swatch" style={{ backgroundColor: selected.color }}><input type="color" value={selected.color} onChange={(event) => updateSelected({ color: event.target.value })} aria-label="Choose component color" /></label>
                  <input className="text-input color-value" value={selected.color.toUpperCase()} onChange={(event) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) updateSelected({ color: event.target.value });
                  }} aria-label="Hex color" />
                  <button className="icon-button eyedropper" title="Choose color"><AlignLeft size={15} /></button>
                </div>
              </div>
              {(selected.type === "switch" || selected.type === "checkbox") && <div className="property-block">
                <div className="field-label">Initial state</div>
                <button className={`state-toggle ${selected.checked ? "on" : ""}`} onClick={() => updateSelected({ checked: !selected.checked })}><span />{selected.checked ? "Checked" : "Unchecked"}</button>
              </div>}
              <div className="inspector-actions">
                <button onClick={() => moveElement(selected.id, -1)} disabled={elements.findIndex((item) => item.id === selected.id) === 0} title="Move up"><ArrowUp size={15} /></button>
                <button onClick={() => moveElement(selected.id, 1)} disabled={elements.findIndex((item) => item.id === selected.id) === elements.length - 1} title="Move down"><ArrowDown size={15} /></button>
                <button onClick={duplicateSelected} title="Duplicate"><Copy size={15} /></button>
                <button className="delete-action" onClick={removeSelected} title="Delete"><Trash2 size={15} /></button>
              </div>
            </> : <div className="no-selection">
              <div className="selection-icon"><Settings2 size={20} /></div>
              <strong>Nothing selected</strong>
              <p>Select an element on the canvas to edit its properties.</p>
            </div>}
          </div>
          <div className="inspector-section layers-section">
            <div className="inspector-title"><h2>Layers <span>{elements.length}</span></h2><button className="icon-button" title="Layer options" onClick={() => setSelectedId(null)}><MoreHorizontal size={17} /></button></div>
            <div className="layer-list">
              {!elements.length ? <div className="layers-empty">Your layers will appear here</div> : [...elements].reverse().map((element) => <button className={`layer-row ${element.id === selectedId ? "selected" : ""}`} key={element.id} onClick={() => setSelectedId(element.id)}>
                <span className={`layer-icon glyph-${element.type}`}>{getDefinition(element.type).icon}</span>
                <span className="layer-name">{element.label || getDefinition(element.type).name}</span>
                <span className="layer-type">{getDefinition(element.type).name}</span>
              </button>)}
            </div>
          </div>
        </aside>}

        {!showPalette && <button className="reopen-panel reopen-left" onClick={() => setShowPalette(true)} title="Show components"><ChevronRight size={17} /></button>}
        {!showInspector && <button className="reopen-panel reopen-right" onClick={() => setShowInspector(true)} title="Show properties"><ChevronLeftIcon /></button>}
      </div>

      <section className={`code-panel ${showCode ? "" : "code-collapsed"}`}>
        <div className="code-header">
          <div className="code-heading"><Code2 size={17} /><strong>Code</strong><span className="code-live"><i /> Live preview</span></div>
          <div className="code-actions">
            <button className="code-action copy-action" onClick={copyCode}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "Copied" : "Copy code"}</button>
            <button className="icon-button" onClick={downloadCode} title="Download code"><Download size={15} /></button>
            <button className="icon-button code-collapse-button" onClick={() => setShowCode(!showCode)} title={showCode ? "Collapse code" : "Expand code"}>{showCode ? <ArrowDown size={15} /> : <ArrowUp size={15} />}</button>
          </div>
        </div>
        {showCode && <>
          <div className="code-tabs">
            {exportFormats.map((item) => <button key={item} className={`code-tab ${format === item ? "active" : ""}`} onClick={() => setFormat(item)}>
              {item === "compose" ? <span className="language-badge kotlin">K</span> : item === "xml" ? <span className="language-badge xml">&lt;/&gt;</span> : item === "flet" ? <span className="language-badge python">Py</span> : <span className="language-badge html">5</span>}
              {formatNames[item]}{format === item && <span className="tab-underline" />}
            </button>)}
            <div className="code-meta"><FileCode2 size={14} /> {format === "compose" ? "Kotlin" : format === "xml" ? "Android layout" : format === "flet" ? "Python · Flet" : "HTML5"} <span className="meta-dot">·</span> {generatedCode.split("\n").length} lines</div>
          </div>
          <pre className="code-content"><code>{generatedCode}</code></pre>
        </>}
      </section>
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}><X size={14} /></button></div>}
    </main>
  );
}

function boundedNumber(value: string, min: number, max: number, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function ChevronLeftIcon() {
  return <ArrowLeft size={16} />;
}

function material(tag: string, props: Record<string, unknown> = {}, ...children: ReactNode[]) {
  return createReactElement(tag, props as React.HTMLAttributes<HTMLElement>, ...children);
}

function materialIcon(name: string, slot?: string) {
  return material("md-icon", slot ? { slot } : {}, name);
}

function MaterialPreview({ element, onToggle }: { element: CanvasElement; onToggle: () => void }) {
  const isXr = element.type.startsWith("xr");
  const kind = isXr ? `${element.type[2].toLowerCase()}${element.type.slice(3)}` : element.type;
  const style: CSSProperties = {
    width: element.fillWidth ? "100%" : `${element.width}px`,
    height: element.fillHeight ? "100%" : `${element.height}px`,
    minHeight: `${Math.max(element.height, 1)}px`,
    "--component-color": element.color,
  } as CSSProperties;
  const mdStyle: CSSProperties = {
    "--md-sys-color-primary": element.color,
    "--md-filled-button-container-color": element.color,
  } as CSSProperties;
  const full = { style: { width: "100%", height: "100%", ...mdStyle } };
  const caption = <span className="material-preview-caption">{element.label}</span>;
  let content: ReactNode;

  switch (kind) {
    case "text":
      content = <span className="m3-preview-text" style={{ fontSize: element.fontSize, color: element.color === "#292532" ? "var(--md-sys-color-on-surface)" : element.color }}>{element.label}</span>;
      break;
    case "image":
      content = <div className="m3-image-placeholder" style={{ borderRadius: element.radius, backgroundColor: element.imageSrc ? "transparent" : undefined }}>
        {element.imageSrc ? <img src={element.imageSrc} alt={element.label} /> : <>{materialIcon("image")}<span>{element.label}</span></>}
      </div>;
      break;
    case "button": content = material("md-filled-button", full, element.label); break;
    case "elevatedButton": content = material("md-elevated-button", full, element.label); break;
    case "tonalButton": content = material("md-filled-tonal-button", full, element.label); break;
    case "outlinedButton": content = material("md-outlined-button", full, element.label); break;
    case "textButton": content = material("md-text-button", full, element.label); break;
    case "buttonGroup":
    case "segmentedButton":
      content = material("md-outlined-segmented-button-set", { className: "m3-segmented-set", style: mdStyle },
        material("md-outlined-segmented-button", { selected: true }, "Day"),
        material("md-outlined-segmented-button", {}, "Week"),
        material("md-outlined-segmented-button", {}, "Month"));
      break;
    case "extendedFab":
      content = material("md-fab", { label: element.label, lowered: true, style: mdStyle }, materialIcon("add", "icon"));
      break;
    case "fab":
      content = material("md-fab", { "aria-label": element.label, style: mdStyle }, materialIcon("add", "icon"));
      break;
    case "fabMenu":
      content = <div className="m3-fab-menu">
        <div className="m3-fab-menu-actions">
          {["Upload", "Scan"].map((label) => material("md-fab", { key: label, size: "small", label, style: mdStyle }, materialIcon(label === "Upload" ? "upload" : "document_scanner", "icon")))}
        </div>
        {material("md-fab", { label: element.label, style: mdStyle }, materialIcon("add", "icon"))}
      </div>;
      break;
    case "iconButton":
      content = material("md-icon-button", { "aria-label": element.label, style: mdStyle }, materialIcon("favorite"));
      break;
    case "splitButton":
      content = <div className="m3-split-button">
        {material("md-filled-button", { style: { ...mdStyle, flex: 1 } }, element.label)}
        {material("md-icon-button", { "aria-label": "More options", style: mdStyle }, materialIcon("arrow_drop_down"))}
      </div>;
      break;
    case "checkbox":
      content = <div className="m3-selection-row">
        {material("md-checkbox", { ...(element.checked ? { checked: true } : {}), onClick: (event: Event) => { event.stopPropagation(); onToggle(); } })}
        {caption}
      </div>;
      break;
    case "chip": content = material("md-assist-chip", { label: element.label }, materialIcon("auto_awesome", "icon")); break;
    case "filterChip":
      content = material("md-filter-chip", { label: element.label, ...(element.checked ? { selected: true } : {}), onClick: (event: Event) => { event.stopPropagation(); onToggle(); } });
      break;
    case "inputChip": content = material("md-input-chip", { label: element.label, avatar: true }, materialIcon("person", "icon")); break;
    case "suggestionChip": content = material("md-suggestion-chip", { label: element.label }); break;
    case "datePicker":
      content = <div className="m3-date-picker">
        {material("md-outlined-text-field", { label: "Date", type: "date", style: { width: "100%" } })}
        <div className="m3-calendar">
          {["S", "M", "T", "W", "T", "F", "S", "1", "2", "3", "4", "5", "6", "7"].map((day, index) => <span className={index === 9 ? "today" : ""} key={`${day}-${index}`}>{day}</span>)}
        </div>
      </div>;
      break;
    case "select":
      content = material("md-outlined-select", { label: element.label, style: { width: "100%" }, value: "personal" },
        material("md-select-option", { value: "personal", selected: true }, "Personal"),
        material("md-select-option", { value: "work" }, "Work"),
        material("md-select-option", { value: "other" }, "Other"));
      break;
    case "menu":
      content = <div className="m3-menu-preview">
        {["Edit", "Share", "Move to"].map((label, index) => material("md-menu-item", { key: label, headline: label }, materialIcon(["edit", "share", "folder"][index], "start")))}
      </div>;
      break;
    case "radioButton":
      content = <div className="m3-selection-row">
        {material("md-radio", { ...(element.checked ? { checked: true } : {}), name: `radio-${element.id}`, onClick: (event: Event) => { event.stopPropagation(); onToggle(); } })}
        {caption}
      </div>;
      break;
    case "search":
      content = material("md-outlined-text-field", { label: element.label, type: "search", style: { width: "100%" } }, materialIcon("search", "leading-icon"));
      break;
    case "slider":
      content = <div className="m3-slider-preview">{caption}{material("md-slider", { min: 0, max: 100, value: 55, style: { width: "100%" } })}</div>;
      break;
    case "switch":
      content = <div className="m3-selection-row m3-switch-row">{caption}{material("md-switch", { ...(element.checked ? { selected: true } : {}), onClick: (event: Event) => { event.stopPropagation(); onToggle(); } })}</div>;
      break;
    case "textField":
      content = material("md-outlined-text-field", { label: element.label, style: { width: "100%" } });
      break;
    case "timePicker":
      content = <div className="m3-time-picker">
        {material("md-outlined-text-field", { label: "Hour", value: "09", type: "number" })}
        <span>:</span>
        {material("md-outlined-text-field", { label: "Minute", value: "30", type: "number" })}
        {material("md-filled-tonal-button", {}, "AM")}
      </div>;
      break;
    case "appBar":
    case "xrAppBar":
      content = <div className="m3-app-bar">
        {material("md-icon-button", { "aria-label": "Navigate back" }, materialIcon("arrow_back"))}
        <strong>{element.label}</strong>
        {material("md-icon-button", { "aria-label": "More options" }, materialIcon("more_vert"))}
      </div>;
      break;
    case "navigationBar":
    case "xrNavigationBar":
      content = material("md-navigation-bar", { activeIndex: 0, className: "m3-navigation-bar" },
        ...[["Home", "home"], ["Saved", "bookmark"], ["Profile", "person"]].map(([label, icon], index) =>
          material("md-navigation-tab", { key: label, label, ...(index === 0 ? { active: true } : {}) }, materialIcon(icon, "inactive-icon"), materialIcon(icon, "active-icon"))));
      break;
    case "navigationDrawer":
      content = material("md-navigation-drawer", {
        className: "m3-navigation-drawer",
        opened: true,
        style: { width: "100%", height: "100%", flex: "0 0 100%", "--md-navigation-drawer-container-width": "100%", "--md-navigation-drawer-container-height": "100%" },
      },
        material("md-list", {},
          ...[["Home", "home"], ["Projects", "folder"], ["Settings", "settings"]].map(([label, icon], index) =>
            material("md-list-item", { key: label, headline: label, type: "button", ...(index === 0 ? { selected: true } : {}) }, materialIcon(icon, "start")))));
      break;
    case "navigationRail":
    case "xrNavigationRail":
      content = <div className="m3-navigation-rail">
        {["home", "bookmark", "person"].map((icon, index) => material("md-navigation-tab", { key: icon, label: ["Home", "Saved", "Profile"][index], ...(index === 0 ? { active: true } : {}) }, materialIcon(icon, "inactive-icon"), materialIcon(icon, "active-icon")))}
      </div>;
      break;
    case "tabs":
      content = material("md-tabs", { className: "m3-tabs" },
        ...["Overview", "Details", "Activity"].map((label, index) =>
          material(index === 0 ? "md-primary-tab" : "md-secondary-tab", { key: label, ...(index === 0 ? { active: true } : {}) }, label)));
      break;
    case "toolbar":
      content = <div className="m3-toolbar">
        {material("md-icon-button", { "aria-label": "Undo" }, materialIcon("undo"))}
        {material("md-icon-button", { "aria-label": "Redo" }, materialIcon("redo"))}
        <span />
        {material("md-icon-button", { "aria-label": "More options" }, materialIcon("more_vert"))}
      </div>;
      break;
    case "bottomSheet":
      content = <div className="m3-bottom-sheet">
        <span className="m3-drag-handle" />
        <strong>{element.label}</strong>
        {material("md-list-item", { headline: "Share with a contact" })}
        {material("md-list-item", { headline: "Copy link" })}
      </div>;
      break;
    case "card":
      content = material("md-elevated-card", { className: "m3-card", style: { width: "100%", height: "100%", padding: 16 } },
        <strong>{element.label}</strong>, <span>Supporting text and actions</span>,
        material("md-text-button", {}, "Open"));
      break;
    case "carousel":
      content = <div className="m3-carousel">
        {["For you", "Trending"].map((label) => material("md-elevated-card", { key: label, className: "m3-carousel-card" },
          <div className="m3-carousel-art" />, <strong>{label}</strong>))}
      </div>;
      break;
    case "dialog":
      content = <div className="m3-dialog-card">
        <strong>{element.label}</strong>
        <p>Your changes will not be saved.</p>
        <div>{material("md-text-button", {}, "Cancel")}{material("md-text-button", { style: mdStyle }, "Discard")}</div>
      </div>;
      break;
    case "divider": content = material("md-divider", { style: { width: "100%" } }); break;
    case "list":
      content = material("md-list", { className: "m3-preview-list" },
        ...["Design review", "Team meeting", "Project update"].map((label, index) =>
          material("md-list-item", { key: label, headline: label, supportingText: ["Today, 10:30 AM", "Tomorrow, 2:00 PM", "Friday, 9:00 AM"][index] },
            material("md-icon", { slot: "start" }, ["event", "groups", "task_alt"][index]))));
      break;
    case "sideSheet":
      content = <div className="m3-side-sheet">
        <strong>{element.label}</strong>
        {material("md-list-item", { headline: "Appearance", supportingText: "Theme and colors" })}
        {material("md-list-item", { headline: "Notifications", supportingText: "Manage alerts" })}
      </div>;
      break;
    case "badge":
      content = <div className="m3-badge-preview">
        {material("md-icon-button", { "aria-label": "Notifications" }, materialIcon("notifications"))}
        {material("md-badge", { value: element.label || "3" })}
      </div>;
      break;
    case "loadingIndicator":
      content = <div className="m3-loading-preview">{material("md-circular-progress", { indeterminate: true, "aria-label": element.label })}{caption}</div>;
      break;
    case "circularProgressIndicator":
      content = material("md-circular-progress", {
        value: 0.65,
        "aria-label": element.label,
        style: { width: 48, height: 48, ...mdStyle },
      });
      break;
    case "wavyProgressIndicator":
      content = <div className="m3-wavy-progress-preview">
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" role="progressbar" aria-label={element.label} aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}>
          <path className="m3-wavy-progress-track" pathLength={100} d="M 0 12 C 4 4, 8 4, 12 12 S 20 20, 24 12 S 32 4, 36 12 S 44 20, 48 12 S 56 4, 60 12 S 68 20, 72 12 S 80 4, 84 12 S 92 20, 96 12 S 100 4, 104 12" />
          <path className="m3-wavy-progress-indicator" pathLength={100} strokeDasharray="65 35" d="M 0 12 C 4 4, 8 4, 12 12 S 20 20, 24 12 S 32 4, 36 12 S 44 20, 48 12 S 56 4, 60 12 S 68 20, 72 12 S 80 4, 84 12 S 92 20, 96 12 S 100 4, 104 12" />
        </svg>
        {caption}
      </div>;
      break;
    case "snackbar":
      content = <div className="m3-snackbar">
        <span>{element.label}</span>
        {material("md-text-button", { style: mdStyle }, "Undo")}
      </div>;
      break;
    case "tooltip":
      content = <div className="m3-tooltip-preview">
        {material("md-icon-button", { "aria-label": element.label }, materialIcon("info"))}
        <span>{element.label}</span>
      </div>;
      break;
    default:
      content = material("md-elevated-card", { style: { width: "100%", height: "100%" } }, element.label);
  }

  return <div className={`material-preview ${isXr ? "material-preview-xr" : ""}`} style={style}>{content}</div>;
}

function CanvasItem({ element, selected, onSelect, onDragStart, onToggle, index }: {
  element: CanvasElement;
  selected: boolean;
  onSelect: () => void;
  onDragStart: DragEventHandler<HTMLDivElement>;
  onToggle: () => void;
  index: number;
}) {
  return <div
    data-element-id={element.id}
    className={`canvas-item ${selected ? "is-selected" : ""} ${element.fillWidth ? "fill-width" : ""} ${element.fillHeight ? "fill-height" : ""} ${element.position !== "flow" ? "positioned" : ""} position-${element.position}`}
    draggable
    onDragStart={onDragStart}
    onClick={(event) => { event.stopPropagation(); onSelect(); }}
  >
    <MaterialPreview element={element} onToggle={onToggle} />
    {selected && <><span className="selection-tag">{getDefinition(element.type).name}</span><span className="selection-handle handle-se" /></>}
    <span className="canvas-item-index">{index + 1}</span>
  </div>;
}

export default App;
