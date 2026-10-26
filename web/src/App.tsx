import React, { useState, useEffect, useRef } from "react"
import {
  Sparkles,
  LogOut,
  ChevronDown,
  Loader2,
  Menu,
  LogIn,
  UserPlus,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/Sidebar"
import { AuthModal } from "@/components/AuthModal"
import { MetamorphStudio } from "@/components/MetamorphStudio"
import { LoggedInUser, TransformationItem } from "@/types"

// Initial sample saved transformations unlocked for logged-in accounts
const INITIAL_SAVED_TRANSFORMATIONS: TransformationItem[] = [
  {
    id: "trans-1",
    name: "Q3_Financial_Statement.docx",
    sourceType: "PDF",
    targetType: "DOCX",
    status: "COMPLETED",
    timestamp: "10 mins ago",
    size: "2.4 MB",
    duration: "1.2s",
  },
  {
    id: "trans-2",
    name: "customer_analytics_export.csv",
    sourceType: "JSON",
    targetType: "CSV",
    status: "COMPLETED",
    timestamp: "2 hours ago",
    size: "850 KB",
    duration: "0.4s",
  },
  {
    id: "trans-3",
    name: "marketing_hero_banner.webp",
    sourceType: "PNG",
    targetType: "WEBP",
    status: "COMPLETED",
    timestamp: "Yesterday",
    size: "4.1 MB",
    duration: "1.8s",
  },
  {
    id: "trans-4",
    name: "server_access_logs.parquet",
    sourceType: "LOG",
    targetType: "PARQUET",
    status: "COMPLETED",
    timestamp: "3 days ago",
    size: "18.2 MB",
    duration: "3.4s",
  },
  {
    id: "trans-5",
    name: "demo_walkthrough.mp4",
    sourceType: "MOV",
    targetType: "MP4",
    status: "COMPLETED",
    timestamp: "5 days ago",
    size: "45.0 MB",
    duration: "12.3s",
  },
]

// Helper to decode JWT payload safely in the browser to extract email
function extractEmailFromJwt(token: string): string | null {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const payload = JSON.parse(jsonPayload)
    return payload.email || null
  } catch {
    return null
  }
}

export const App: React.FC = () => {
  const [user, setUser] = useState<LoggedInUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true)

  // Navigation & User Nudge Dropdown state
  const [isNudgeOpen, setIsNudgeOpen] = useState<boolean>(false)
  const nudgeRef = useRef<HTMLDivElement>(null)

  // Left Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin")

  // Past saved transformation logs state
  const [savedTransformations, setSavedTransformations] = useState<TransformationItem[]>(
    INITIAL_SAVED_TRANSFORMATIONS
  )

  // Check for existing session using refreshToken cookie on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          const emailFromToken = data.accessToken
            ? extractEmailFromJwt(data.accessToken)
            : null
          const resolvedEmail =
            emailFromToken || localStorage.getItem("metamorph_email") || "user@metamorph.io"

          setUser({
            email: resolvedEmail,
            accessToken: data.accessToken,
          })
        } else {
          setUser(null)
        }
      } catch {
        // Backend offline or network error
        setUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkSession()
  }, [])

  // Close User Nudge dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nudgeRef.current && !nudgeRef.current.contains(event.target as Node)) {
        setIsNudgeOpen(false)
      }
    }
    if (isNudgeOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isNudgeOpen])

  // Open Auth Modal helper
  const handleOpenAuth = (mode: "signin" | "signup") => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem("metamorph_email")
    setUser(null)
    setIsNudgeOpen(false)
  }

  // Add new transformation item to history
  const handleAddTransformation = (item: TransformationItem) => {
    setSavedTransformations((prev) => [item, ...prev])
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ───────────────────────────────────────────────────────── */}
      {/* Top Header / Navigation Bar */}
      {/* ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
          {/* Left: Sidebar toggle + Metamorph Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
              title="Toggle Saved Transformations Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Metamorph
                </span>
                <span className="hidden sm:inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  Studio
                </span>
              </div>
            </div>
          </div>

          {/* Right: Guest Auth Buttons vs Logged-In User Nudge */}
          <div className="flex items-center gap-2">
            {!user ? (
              /* GUEST: Show Sign In and Sign Up buttons (No User Nudge) */
              <div className="flex items-center gap-2 animate-in fade-in duration-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAuth("signin")}
                  className="text-xs font-semibold hover:bg-accent gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleOpenAuth("signup")}
                  className="text-xs font-semibold gap-1.5 shadow-sm shadow-primary/20"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Button>
              </div>
            ) : (
              /* LOGGED IN: Show User Nudge with Avatar & Dropdown */
              <div className="relative animate-in fade-in duration-300" ref={nudgeRef}>
                <button
                  type="button"
                  onClick={() => setIsNudgeOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-full border border-border bg-card/90 py-1.5 pl-2 pr-3.5 shadow-sm transition-all hover:bg-accent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="User account menu"
                  aria-expanded={isNudgeOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs uppercase">
                    {user.email.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-foreground tracking-tight max-w-[140px] sm:max-w-[200px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isNudgeOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>

                {/* User Nudge Dropdown Menu */}
                {isNudgeOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-50 zoom-in-95 z-50">
                    <div className="px-3 py-2.5 border-b border-border/60">
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Signed in</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate" title={user.email}>
                        {user.email}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start gap-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Main Workspace Layout: Sidebar + Metamorph Studio Screen */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Past Saved Transformations (Locked for Guests, Unlocked for Logged-In) */}
        <Sidebar
          isLoggedIn={!!user}
          transformations={savedTransformations}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onOpenAuth={handleOpenAuth}
        />

        {/* Main Center Area: Metamorph Transformation Screen */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-background via-background to-secondary/15">
          <MetamorphStudio
            isLoggedIn={!!user}
            onAddTransformation={handleAddTransformation}
            onOpenAuth={handleOpenAuth}
          />
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Authentication Modal (Sign In / Sign Up) */}
      {/* ───────────────────────────────────────────────────────── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser)
          setIsNudgeOpen(false)
        }}
      />
    </div>
  )
}

export default App
