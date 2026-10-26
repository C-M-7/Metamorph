import React, { useState, useEffect } from "react"
import {
  Lock,
  Mail,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  UserPlus,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoggedInUser } from "@/types"

interface AuthModalProps {
  isOpen: boolean
  initialMode: "signin" | "signup"
  onClose: () => void
  onSuccess: (user: LoggedInUser) => void
}

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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode)

  // Form states
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Synchronize initial mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode)
      setErrorMessage(null)
      setSuccessMessage(null)
    }
  }, [isOpen, initialMode])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const trimmedEmail = signInEmail.trim()
    if (!trimmedEmail || !signInPassword.trim()) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, password: signInPassword }),
      })

      if (response.ok) {
        const data = await response.json()
        const emailFromToken = data.accessToken
          ? extractEmailFromJwt(data.accessToken)
          : null
        const finalEmail = emailFromToken || trimmedEmail

        localStorage.setItem("metamorph_email", finalEmail)
        onSuccess({
          email: finalEmail,
          accessToken: data.accessToken,
        })
        onClose()
      } else {
        const errData = await response.json().catch(() => null)
        const msg =
          errData?.message ||
          errData?.error ||
          (response.status === 401
            ? "Invalid email or password."
            : `Authentication failed (status: ${response.status})`)
        setErrorMessage(msg)
      }
    } catch {
      setErrorMessage(
        "Could not connect to /api/auth/login. Check if backend is running."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Sign Up: Registers, then redirects user to Login tab
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const emailTrimmed = signUpEmail.trim()
    const passwordTrimmed = signUpPassword.trim()

    if (!emailTrimmed || !passwordTrimmed) {
      setErrorMessage("Please enter an email and password.")
      return
    }

    if (passwordTrimmed.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password: passwordTrimmed }),
      })

      if (registerRes.ok) {
        setSuccessMessage("Account created successfully! Please sign in with your credentials.")
        setSignInEmail(emailTrimmed)
        setSignInPassword("")
        setAuthMode("signin")
      } else {
        const errData = await registerRes.json().catch(() => null)
        setErrorMessage(
          errData?.message ||
          errData?.error ||
          `Registration failed (status: ${registerRes.status})`
        )
      }
    } catch {
      setErrorMessage(
        "Could not connect to /api/auth/register. Check if backend is running."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback demo sign-in for testing when backend is offline
  const handleDemoSignIn = () => {
    const email = signInEmail.trim() || "demo@metamorph.io"
    localStorage.setItem("metamorph_email", email)
    onSuccess({ email })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md z-10 animate-in zoom-in-95 duration-200">
        <Card className="border-border shadow-2xl bg-card">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Metamorph Account
                </h2>
                <p className="text-xs text-muted-foreground">
                  Unlock transformation history and cloud storage
                </p>
              </div>
            </div>

            <Tabs
              value={authMode}
              onValueChange={(val) => {
                setAuthMode(val as "signin" | "signup")
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          {/* Feedback messages */}
          <div className="px-6">
            {errorMessage && (
              <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive mb-3">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                {errorMessage.includes("Could not connect") && (
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="self-start text-[11px] underline font-semibold text-primary hover:text-primary/80"
                  >
                    Bypass with demo sign-in &rarr;
                  </button>
                )}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary mb-3 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Sign In Form */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-signin-email"
                    className="text-xs font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="modal-signin-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-signin-password"
                    className="text-xs font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="modal-signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2.5 pt-2">
                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup")
                      setErrorMessage(null)
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up now
                  </button>
                </p>
              </CardFooter>
            </form>
          )}

          {/* Sign Up Form */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-signup-email"
                    className="text-xs font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="modal-signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-signup-password"
                    className="text-xs font-medium text-foreground"
                  >
                    Password <span className="text-muted-foreground">(min 8 characters)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="modal-signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="pl-9"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2.5 pt-2">
                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin")
                      setErrorMessage(null)
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AuthModal
