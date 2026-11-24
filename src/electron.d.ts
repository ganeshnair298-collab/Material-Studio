export { };

declare global {
    interface Window {
        materialStudio?: {
            setTitleBarTheme: (theme: "light" | "dark") => void;
        };
    }
}