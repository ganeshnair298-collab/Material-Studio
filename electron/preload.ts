import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("materialStudio", {
    setTitleBarTheme: (theme: "light" | "dark") => ipcRenderer.send("titlebar-theme", theme),
});