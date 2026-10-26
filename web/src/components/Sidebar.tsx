import React, { useState } from "react"
import {
  Lock,
  History,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  FileCode,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  LogIn,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TransformationItem } from "@/types"

interface SidebarProps {
  isLoggedIn: boolean
  transformations: TransformationItem[]
  isOpen: boolean
  onToggle: () => void
  onOpenAuth: (mode: "signin" | "signup") => void
}

// Sample blurred preview items shown in locked state to give guests a preview of history
const PREVIEW_ITEMS: TransformationItem[] = [
  {
    id: "preview-1",
    name: "financial_report_q3.pdf",
    sourceType: "PDF",
    targetType: "DOCX",
    status: "COMPLETED",
    timestamp: "2 hours ago",
    size: "2.4 MB",
    duration: "1.2s",
  },
  {
    id: "preview-2",
    name: "user_database_export.json",
    sourceType: "JSON",
    targetType: "CSV",
    status: "COMPLETED",
    timestamp: "5 hours ago",
    size: "850 KB",
    duration: "0.4s",
  },
  {
    id: "preview-3",
    name: "brand_assets_retina.png",
    sourceType: "PNG",
    targetType: "WEBP",
    status: "COMPLETED",
    timestamp: "Yesterday",
    size: "4.1 MB",
    duration: "1.8s",
  },
  {
    id: "preview-4",
    name: "telemetry_logs_stream.log",
    sourceType: "LOG",
    targetType: "PARQUET",
    status: "COMPLETED",
    timestamp: "2 days ago",
    size: "18.2 MB",
    duration: "3.4s",
  },
]

export const Sidebar: React.FC<SidebarProps> = ({
  isLoggedIn,
  transformations,
  isOpen,
  onToggle,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = transformations.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFormatIcon = (format: string) => {
    const f = format.toUpperCase()
    if (["PNG", "JPG", "JPEG", "WEBP", "SVG", "GIF"].includes(f)) {
      return <ImageIcon className="h-4 w-4 text-emerald-400" />
    }
    if (["JSON", "CSV", "YAML", "XML", "PARQUET", "LOG"].includes(f)) {
      return <FileCode className="h-4 w-4 text-sky-400" />
    }
    return <FileText className="h-4 w-4 text-amber-400" />
  }

  const getStatusBadge = (status: TransformationItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Completed
          </span>
        )
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Clock className="h-2.5 w-2.5 animate-spin" />
            Processing
          </span>
        )
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-destructive/15 text-destructive border border-destructive/20">
            <AlertCircle className="h-2.5 w-2.5" />
            Failed
          </span>
        )
    }
  }

  return (
    <>
      {/* Floating Toggle Button when Sidebar is collapsed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          title="Open Saved Transformations Sidebar"
          className="fixed left-3 top-20 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/90 shadow-md backdrop-blur transition-all hover:bg-accent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <History className="h-4 w-4 text-primary" />
        </button>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 top-16 z-30 flex flex-col border-r border-border bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out md:static ${
          isOpen
            ? "w-80 translate-x-0"
            : "-translate-x-full md:w-0 md:translate-x-0 md:border-r-0 md:overflow-hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <History className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Saved Transformations
            </span>
            {isLoggedIn ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {transformations.length}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-400 bg-amber-500/10 flex items-center gap-1"
              >
                <Lock className="h-2.5 w-2.5" /> Locked
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────── */}
        {/* CASE 1: GUEST USER (LOCKED SIDEBAR) */}
        {/* ─────────────────────────────────────────────────── */}
        {!isLoggedIn ? (
          <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-4">
            {/* Locked Prompt Card */}
            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card to-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Feature Locked
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Past transformation logs and saved downloads are stored securely for registered accounts.
                  </p>
                </div>
              </div>

              {/* Action buttons inside lock notice */}
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => onOpenAuth("signin")}
                  className="w-full gap-2 text-xs font-medium"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In to Unlock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenAuth("signup")}
                  className="w-full gap-2 text-xs font-medium border-border/80 hover:bg-accent"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create Free Account
                </Button>
              </div>
            </div>

            {/* Ghost / Blurred Preview Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  History Preview
                </span>
                <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> Unlocks on login
                </span>
              </div>

              <div className="relative space-y-2">
                {/* Visual blur overlay */}
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/50 backdrop-blur-[2px]">
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1 text-[11px] font-medium text-foreground shadow-lg">
                    <Lock className="h-3 w-3 text-amber-400" />
                    <span>Sign in to view your logs</span>
                  </div>
                </div>

                {PREVIEW_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2.5 opacity-60"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-secondary">
                        {getFormatIcon(item.sourceType)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.sourceType} &rarr; {item.targetType} &bull; {item.timestamp}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {item.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────── */
          /* CASE 2: LOGGED-IN USER (UNLOCKED SIDEBAR) */
          /* ─────────────────────────────────────────────────── */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search filter */}
            <div className="border-b border-border/60 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search transformations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background/60"
                />
              </div>
            </div>

            {/* Transformation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <History className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    {searchQuery ? "No matching transformations" : "No saved transformations"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {searchQuery
                      ? "Try a different search query"
                      : "Transform files on the main screen to see logs here"}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-primary/40 hover:bg-accent/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary mt-0.5">
                          {getFormatIcon(item.sourceType)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="truncate text-xs font-semibold text-foreground"
                            title={item.name}
                          >
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <span className="font-mono uppercase font-medium text-foreground/80">
                              {item.sourceType}
                            </span>
                            <span>&rarr;</span>
                            <span className="font-mono uppercase font-medium text-primary">
                              {item.targetType}
                            </span>
                            <span>&bull;</span>
                            <span>{item.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">{getStatusBadge(item.status)}</div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{item.size}</span>
                        {item.duration && <span>&bull; {item.duration}</span>}
                      </div>

                      {item.status === "COMPLETED" && (
                        <button
                          type="button"
                          className="flex items-center gap-1 font-medium text-primary hover:text-primary/80 transition"
                          title="Download transformed file"
                          onClick={() => {
                            // Dummy download trigger or notification
                            alert(`Downloading transformed output for: ${item.name}`)
                          }}
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer status */}
            <div className="border-t border-border/60 p-3 bg-card/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Enabled
              </span>
              <span>{transformations.length} total</span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
export default Sidebar
