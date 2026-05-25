import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <ThemeProvider>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            boxShadow: "0 18px 45px rgb(15 23 42 / 0.18)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      />
    </ThemeProvider>
  )
}

export default App
