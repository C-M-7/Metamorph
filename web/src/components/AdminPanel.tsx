import React, { useState, useEffect, useCallback } from "react"
import {
  Users,
  ShieldCheck,
  RotateCw,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Mail,
  Hash,
  ShieldAlert,
  Sliders,
  Plus,
  Pencil,
  Eye,
  Power,
  PowerOff,
  Copy,
  Check,
  X,
  Trash2,
  Code2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  LoggedInUser,
  AdminUserItem,
  AppConfigurationItem,
  PageResponse,
} from "@/types"

interface AdminPanelProps {
  user: LoggedInUser
  onBackToStudio: () => void
  onUpdateAccessToken?: (newToken: string) => void
}

type AdminTab = "users" | "configs"
type ModalMode = "create" | "edit" | "view" | null

export const AdminPanel: React.FC<AdminPanelProps> = ({
  user,
  onBackToStudio,
  onUpdateAccessToken,
}) => {
  // Navigation tab state inside Admin Panel
  const [activeTab, setActiveTab] = useState<AdminTab>("users")

  // Users state
  const [userPage, setUserPage] = useState<number>(0)
  const [userPageData, setUserPageData] = useState<PageResponse<AdminUserItem> | null>(null)
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(true)
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState<string>("")

  // Configurations state
  const [configPage, setConfigPage] = useState<number>(0)
  const [configPageData, setConfigPageData] = useState<PageResponse<AppConfigurationItem> | null>(null)
  const [isConfigsLoading, setIsConfigsLoading] = useState<boolean>(true)
  const [configErrorMessage, setConfigErrorMessage] = useState<string | null>(null)
  const [configSearchQuery, setConfigSearchQuery] = useState<string>("")

  // Config Modal State (create, edit, view)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedConfig, setSelectedConfig] = useState<AppConfigurationItem | null>(null)
  const [modalIdentifier, setModalIdentifier] = useState<string>("")
  const [modalConfigText, setModalConfigText] = useState<string>("{}")
  const [modalDisabled, setModalDisabled] = useState<boolean>(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmittingModal, setIsSubmittingModal] = useState<boolean>(false)
  const [hasCopied, setHasCopied] = useState<boolean>(false)

  // ─────────────────────────────────────────────────────────────
  // Fetch Users
  // ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (pageToFetch: number, tokenOverride?: string) => {
      setIsUsersLoading(true)
      setUserErrorMessage(null)
      const activeToken = tokenOverride || user.accessToken

      try {
        const response = await fetch(`/api/admin/users?page=${pageToFetch}&size=15`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          credentials: "include",
        })

        if (response.ok) {
          const data: PageResponse<AdminUserItem> = await response.json()
          setUserPageData(data)
          setUserPage(pageToFetch)
        } else if (response.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          })
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            if (refreshData.accessToken) {
              onUpdateAccessToken?.(refreshData.accessToken)
              return fetchUsers(pageToFetch, refreshData.accessToken)
            }
          }
          setUserErrorMessage("Session expired. Please log in again.")
        } else if (response.status === 403) {
          setUserErrorMessage("Access denied (403 Forbidden). Admin privileges required.")
        } else {
          setUserErrorMessage(`Failed to load users (status code: ${response.status})`)
        }
      } catch {
        setUserErrorMessage("Network error: Could not connect to /api/admin/users.")
      } finally {
        setIsUsersLoading(false)
      }
    },
    [user.accessToken, onUpdateAccessToken]
  )

  // ─────────────────────────────────────────────────────────────
  // Fetch Configurations
  // ─────────────────────────────────────────────────────────────
  const fetchConfigs = useCallback(
    async (pageToFetch: number, tokenOverride?: string) => {
      setIsConfigsLoading(true)
      setConfigErrorMessage(null)
      const activeToken = tokenOverride || user.accessToken

      try {
        const response = await fetch(`/api/admin/configurations?page=${pageToFetch}&size=15`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          credentials: "include",
        })

        if (response.ok) {
          const data: PageResponse<AppConfigurationItem> = await response.json()
          setConfigPageData(data)
          setConfigPage(pageToFetch)
        } else if (response.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          })
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            if (refreshData.accessToken) {
              onUpdateAccessToken?.(refreshData.accessToken)
              return fetchConfigs(pageToFetch, refreshData.accessToken)
            }
          }
          setConfigErrorMessage("Session expired. Please log in again.")
        } else if (response.status === 403) {
          setConfigErrorMessage("Access denied (403 Forbidden). Admin privileges required.")
        } else {
          setConfigErrorMessage(`Failed to load configurations (status: ${response.status})`)
        }
      } catch {
        setConfigErrorMessage("Network error: Could not connect to /api/admin/configurations.")
      } finally {
        setIsConfigsLoading(false)
      }
    },
    [user.accessToken, onUpdateAccessToken]
  )

  // Trigger fetch on tab change or initial load
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(0)
    } else if (activeTab === "configs") {
      fetchConfigs(0)
    }
  }, [activeTab, fetchUsers, fetchConfigs])

  // ─────────────────────────────────────────────────────────────
  // Configuration CRUD Handlers
  // ─────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setSelectedConfig(null)
    setModalIdentifier("")
    setModalConfigText("{\n  \"exampleKey\": \"exampleValue\"\n}")
    setModalDisabled(false)
    setModalError(null)
    setModalMode("create")
  }

  const handleOpenViewModal = (cfg: AppConfigurationItem) => {
    setSelectedConfig(cfg)
    setModalIdentifier(cfg.identifier)
    setModalConfigText(
      typeof cfg.config === "string" ? cfg.config : JSON.stringify(cfg.config, null, 2)
    )
    setModalDisabled(cfg.disabled)
    setModalError(null)
    setModalMode("view")
  }

  const handleOpenEditModal = (cfg: AppConfigurationItem) => {
    setSelectedConfig(cfg)
    setModalIdentifier(cfg.identifier)
    setModalConfigText(
      typeof cfg.config === "string" ? cfg.config : JSON.stringify(cfg.config, null, 2)
    )
    setModalDisabled(cfg.disabled)
    setModalError(null)
    setModalMode("edit")
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(modalConfigText)
      setModalConfigText(JSON.stringify(parsed, null, 2))
      setModalError(null)
    } catch (err: any) {
      setModalError("Invalid JSON: " + err.message)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    const trimmedId = modalIdentifier.trim()
    if (!trimmedId) {
      setModalError("Identifier is required.")
      return
    }

    // Validate JSON
    let parsedJson: any
    try {
      parsedJson = JSON.parse(modalConfigText)
    } catch (err: any) {
      setModalError("Invalid JSON syntax: " + err.message)
      return
    }

    setIsSubmittingModal(true)

    try {
      const isEdit = modalMode === "edit" && selectedConfig
      const url = isEdit
        ? `/api/admin/configurations/${selectedConfig.id}`
        : "/api/admin/configurations"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: trimmedId,
          config: parsedJson,
          disabled: modalDisabled,
        }),
      })

      if (response.ok) {
        setModalMode(null)
        fetchConfigs(configPage)
      } else {
        const errData = await response.json().catch(() => null)
        const msg = errData?.message || `Failed to save configuration (status: ${response.status})`
        setModalError(msg)
      }
    } catch {
      setModalError("Network error: Could not save configuration.")
    } finally {
      setIsSubmittingModal(false)
    }
  }

  const handleToggleDisabled = async (cfg: AppConfigurationItem) => {
    try {
      const response = await fetch(`/api/admin/configurations/${cfg.id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        },
        credentials: "include",
      })

      if (response.ok) {
        fetchConfigs(configPage)
      } else {
        alert("Failed to toggle configuration status.")
      }
    } catch {
      alert("Network error: Could not toggle configuration.")
    }
  }

  const handleDeleteConfig = async (cfg: AppConfigurationItem) => {
    if (!window.confirm(`Are you sure you want to delete configuration "${cfg.identifier}"?`)) {
      return
    }
    try {
      const response = await fetch(`/api/admin/configurations/${cfg.id}`, {
        method: "DELETE",
        headers: {
          ...(user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        },
        credentials: "include",
      })

      if (response.ok || response.status === 204) {
        fetchConfigs(configPage)
      } else {
        alert("Failed to delete configuration.")
      }
    } catch {
      alert("Network error: Could not delete configuration.")
    }
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(modalConfigText)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  // Filtered Lists
  const usersList = userPageData?.content || []
  const filteredUsers = userSearchQuery.trim()
    ? usersList.filter(
        (u) =>
          u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          u.role.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          String(u.id).includes(userSearchQuery.trim())
      )
    : usersList

  const configsList = configPageData?.content || []
  const filteredConfigs = configSearchQuery.trim()
    ? configsList.filter(
        (c) =>
          c.identifier.toLowerCase().includes(configSearchQuery.toLowerCase()) ||
          String(c.id).includes(configSearchQuery.trim()) ||
          JSON.stringify(c.config).toLowerCase().includes(configSearchQuery.toLowerCase())
      )
    : configsList

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-background">
      {/* ───────────────────────────────────────────────────────── */}
      {/* Left Panel: Admin Navigation */}
      {/* ───────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 border-r border-border/80 bg-card/60 backdrop-blur-sm flex flex-col shrink-0">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Admin Console</h2>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Control Panel
              </span>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
            Admin
          </Badge>
        </div>

        {/* Navigation options */}
        <div className="flex-1 p-3 space-y-1">
          {/* Users Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </div>
            {userPageData && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === "users"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {userPageData.totalElements}
              </span>
            )}
          </button>

          {/* Configurations Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("configs")}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "configs"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="h-4 w-4" />
              <span>Configurations</span>
            </div>
            {configPageData && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  activeTab === "configs"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {configPageData.totalElements}
              </span>
            )}
          </button>
        </div>

        {/* Back to Studio action */}
        <div className="p-3 border-t border-border/80">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToStudio}
            className="w-full justify-center gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Studio</span>
          </Button>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Main Content Area */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col overflow-y-auto">
        {activeTab === "users" ? (
          /* ───────────────────────────────────────────────────────── */
          /* USERS TAB VIEW */
          /* ───────────────────────────────────────────────────────── */
          <>
            <div className="border-b border-border/80 bg-background/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>User Directory</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing latest registered accounts (15 users per page, sorted by ID descending).
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search email, id, role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-card"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(userPage)}
                  disabled={isUsersLoading}
                  className="h-8 gap-1.5 text-xs shrink-0"
                  title="Refresh users list"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isUsersLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 p-6">
              {userErrorMessage && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{userErrorMessage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(userPage)}
                    className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/20"
                  >
                    Retry
                  </Button>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-3 px-4 w-16">
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span>ID</span>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>User Email</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-32">
                          <div className="flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Role</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-48">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Created At</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {isUsersLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={`skeleton-${idx}`} className="animate-pulse">
                            <td className="py-3.5 px-4"><div className="h-4 w-8 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4"><div className="h-4 w-48 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4"><div className="h-4 w-16 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4"><div className="h-4 w-32 rounded bg-muted"></div></td>
                          </tr>
                        ))
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-muted-foreground">
                            <Users className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="font-medium">No users found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((userItem) => (
                          <tr key={userItem.id} className="hover:bg-accent/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-muted-foreground">
                              #{userItem.id}
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase">
                                  {userItem.email.charAt(0)}
                                </div>
                                <span className="truncate max-w-[240px] sm:max-w-md">
                                  {userItem.email}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {userItem.role === "ADMIN" ? (
                                <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 gap-1 text-[10px]">
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>ADMIN</span>
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] text-muted-foreground border-border">
                                  USER
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-[11px]">
                              {formatDate(userItem.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {userPageData && userPageData.totalPages > 0 && (
                  <div className="border-t border-border/80 px-4 py-3 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{userPageData.number + 1}</span> of{" "}
                      <span className="font-semibold text-foreground">{userPageData.totalPages}</span>{" "}
                      ({userPageData.totalElements} total users, 15 per page)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPageData.first || isUsersLoading}
                        onClick={() => fetchUsers(userPage - 1)}
                        className="h-8 gap-1 text-xs px-2.5"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPageData.last || isUsersLoading}
                        onClick={() => fetchUsers(userPage + 1)}
                        className="h-8 gap-1 text-xs px-2.5"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ───────────────────────────────────────────────────────── */
          /* CONFIGURATIONS TAB VIEW */
          /* ───────────────────────────────────────────────────────── */
          <>
            <div className="border-b border-border/80 bg-background/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-primary" />
                  <span>App Configurations</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage application settings, feature flags, and dynamic JSON configurations.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search identifier or config..."
                    value={configSearchQuery}
                    onChange={(e) => setConfigSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-card"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchConfigs(configPage)}
                  disabled={isConfigsLoading}
                  className="h-8 gap-1.5 text-xs shrink-0"
                  title="Refresh configurations"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isConfigsLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenCreateModal}
                  className="h-8 gap-1.5 text-xs font-semibold shadow-sm shadow-primary/20 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Config</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 p-6">
              {configErrorMessage && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{configErrorMessage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchConfigs(configPage)}
                    className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/20"
                  >
                    Retry
                  </Button>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-3 px-4 w-16">
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span>ID</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-52">
                          <div className="flex items-center gap-1.5">
                            <Sliders className="h-3.5 w-3.5" />
                            <span>Identifier</span>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Code2 className="h-3.5 w-3.5" />
                            <span>Config (JSON)</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-28">Status</th>
                        <th className="py-3 px-4 w-44 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {isConfigsLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={`cfg-skel-${idx}`} className="animate-pulse">
                            <td className="py-3.5 px-4"><div className="h-4 w-8 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4"><div className="h-4 w-32 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4"><div className="h-4 w-64 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4"><div className="h-4 w-16 rounded bg-muted"></div></td>
                            <td className="py-3.5 px-4 text-right"><div className="h-4 w-20 rounded bg-muted ml-auto"></div></td>
                          </tr>
                        ))
                      ) : filteredConfigs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-muted-foreground">
                            <Sliders className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="font-medium">No app configurations found</p>
                            <p className="text-[11px] text-muted-foreground/80 mt-1">
                              Click &quot;New Config&quot; to create your first application configuration.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredConfigs.map((cfg) => {
                          const jsonSnippet =
                            typeof cfg.config === "string"
                              ? cfg.config
                              : JSON.stringify(cfg.config)
                          return (
                            <tr key={cfg.id} className="hover:bg-accent/40 transition-colors">
                              {/* ID */}
                              <td className="py-3 px-4 font-mono font-medium text-muted-foreground">
                                #{cfg.id}
                              </td>

                              {/* Identifier */}
                              <td className="py-3 px-4 font-mono font-semibold text-foreground">
                                {cfg.identifier}
                              </td>

                              {/* JSON Snippet */}
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleOpenViewModal(cfg)}
                                  className="text-left font-mono text-[11px] text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2 py-1 rounded max-w-xs sm:max-w-md truncate block transition"
                                  title="Click to view full JSON"
                                >
                                  {jsonSnippet}
                                </button>
                              </td>

                              {/* Disabled Status */}
                              <td className="py-3 px-4">
                                {cfg.disabled ? (
                                  <Badge
                                    variant="outline"
                                    className="border-destructive/40 text-destructive bg-destructive/10 text-[10px] gap-1"
                                  >
                                    <PowerOff className="h-2.5 w-2.5" />
                                    <span>Disabled</span>
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 text-[10px] gap-1"
                                  >
                                    <Power className="h-2.5 w-2.5" />
                                    <span>Active</span>
                                  </Badge>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* View */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenViewModal(cfg)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                    title="View full JSON"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>

                                  {/* Edit */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEditModal(cfg)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                    title="Edit configuration"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>

                                  {/* Toggle Disable */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleDisabled(cfg)}
                                    className={`h-7 w-7 p-0 ${
                                      cfg.disabled
                                        ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        : "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                    }`}
                                    title={cfg.disabled ? "Enable configuration" : "Disable configuration"}
                                  >
                                    {cfg.disabled ? (
                                      <Power className="h-3.5 w-3.5" />
                                    ) : (
                                      <PowerOff className="h-3.5 w-3.5" />
                                    )}
                                  </Button>

                                  {/* Delete */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteConfig(cfg)}
                                    className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                    title="Delete configuration"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {configPageData && configPageData.totalPages > 0 && (
                  <div className="border-t border-border/80 px-4 py-3 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{configPageData.number + 1}</span> of{" "}
                      <span className="font-semibold text-foreground">{configPageData.totalPages}</span>{" "}
                      ({configPageData.totalElements} total configurations, 15 per page)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={configPageData.first || isConfigsLoading}
                        onClick={() => fetchConfigs(configPage - 1)}
                        className="h-8 gap-1 text-xs px-2.5"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={configPageData.last || isConfigsLoading}
                        onClick={() => fetchConfigs(configPage + 1)}
                        className="h-8 gap-1 text-xs px-2.5"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Configuration Modal (Create / Edit / View) */}
      {/* ───────────────────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {modalMode === "create" && "Create New Configuration"}
                  {modalMode === "edit" && `Edit Configuration: ${selectedConfig?.identifier}`}
                  {modalMode === "view" && `View Configuration: ${selectedConfig?.identifier}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-muted-foreground hover:text-foreground transition rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {modalError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalMode === "view" ? (
                /* VIEW DETAILS */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border/60">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                        Identifier
                      </span>
                      <span className="font-mono font-bold text-foreground text-xs">
                        {selectedConfig?.identifier}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                        Status
                      </span>
                      {selectedConfig?.disabled ? (
                        <span className="text-destructive font-semibold">Disabled</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">Active</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground font-semibold">Config JSON</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyJson}
                        className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground px-2"
                      >
                        {hasCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{hasCopied ? "Copied!" : "Copy JSON"}</span>
                      </Button>
                    </div>
                    <pre className="p-3 bg-background rounded-lg border border-border/80 font-mono text-xs overflow-x-auto max-h-72 text-foreground">
                      {modalConfigText}
                    </pre>
                  </div>
                </div>
              ) : (
                /* CREATE / EDIT FORM */
                <form id="cfg-form" onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Configuration Identifier <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. MAX_FILE_SIZE_MB, CONVERSION_FEATURE_FLAGS"
                      value={modalIdentifier}
                      onChange={(e) => setModalIdentifier(e.target.value.toUpperCase())}
                      className="font-mono text-xs h-9 uppercase"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Unique uppercase string used by services to look up this configuration.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-foreground">
                        Configuration JSON <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        Beautify / Validate JSON
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      value={modalConfigText}
                      onChange={(e) => setModalConfigText(e.target.value)}
                      placeholder='{ "maxSize": 50, "enabledFormats": ["PDF", "DOCX"] }'
                      className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="cfg-disabled"
                      checked={modalDisabled}
                      onChange={(e) => setModalDisabled(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="cfg-disabled" className="font-medium text-foreground cursor-pointer select-none">
                      Disable this configuration (services will ignore it or fall back to defaults)
                    </label>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
              {modalMode === "view" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalMode(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                  {selectedConfig && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenEditModal(selectedConfig)}
                      className="text-xs gap-1.5"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit Config</span>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setModalMode(null)}
                    disabled={isSubmittingModal}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    form="cfg-form"
                    type="submit"
                    size="sm"
                    disabled={isSubmittingModal}
                    className="text-xs gap-1.5"
                  >
                    {isSubmittingModal ? (
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>{modalMode === "create" ? "Create Configuration" : "Save Changes"}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
