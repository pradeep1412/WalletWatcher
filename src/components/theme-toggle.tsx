"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) {
    // Render a placeholder or nothing on the server
    // to avoid hydration mismatch.
    return (
        <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <div className="h-6 w-11 rounded-full bg-input"></div>
            <Moon className="h-5 w-5" />
        </div>
    )
  }

  const isDarkMode = theme === "dark"

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-5 w-5" />
      <Switch
        id="theme-toggle"
        checked={isDarkMode}
        onCheckedChange={handleThemeChange}
        aria-label="Toggle theme"
      />
      <Moon className="h-5 w-5" />
    </div>
  )
}
