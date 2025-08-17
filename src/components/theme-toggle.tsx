"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = React.useState(theme === "dark")

  React.useEffect(() => {
    setIsDarkMode(theme === "dark")
  }, [theme])

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    setTheme(newTheme)
    setIsDarkMode(checked)
  }

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
