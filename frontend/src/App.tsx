import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "@/components/theme/theme-provider";

function App() {

  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App
