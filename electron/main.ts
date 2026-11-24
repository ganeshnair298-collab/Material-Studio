import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

const createWindow = (): void => {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#f5f3fa",
    title: "Material Layout Studio",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#77727f",
      height: 62,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (!app.isPackaged) {
    void window.loadURL("http://127.0.0.1:5173");
  } else {
    void window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

ipcMain.on("titlebar-theme", (event, theme: "light" | "dark") => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window || (theme !== "light" && theme !== "dark")) return;
  window.setTitleBarOverlay({
    color: "#00000000",
    symbolColor: theme === "dark" ? "#b8b2bf" : "#77727f",
    height: 62,
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
