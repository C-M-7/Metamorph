import React, { useState } from "react"
import { ArrowRight, Loader2, Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TransformationItem } from "@/types"

interface MetamorphStudioProps {
  isLoggedIn: boolean
  onAddTransformation: (item: TransformationItem) => void
  onOpenAuth: (mode: "signin" | "signup") => void
}

const CONVERSION_MAP: Record<string, string[]> = {
  PDF: ["DOCX", "TXT", "MD", "HTML"],
  DOCX: ["PDF", "TXT", "MD"],
  TXT: ["PDF", "DOCX", "MD"],
  MD: ["PDF", "HTML", "DOCX"],
  PNG: ["WEBP", "JPG", "AVIF", "SVG"],
  JPG: ["WEBP", "PNG", "AVIF"],
  WEBP: ["PNG", "JPG"],
  SVG: ["PNG", "WEBP"],
  JSON: ["CSV", "YAML", "PARQUET", "SQL"],
  CSV: ["JSON", "PARQUET", "SQL"],
  YAML: ["JSON", "CSV"],
  MP4: ["WEBM", "GIF", "MP3"],
  MOV: ["MP4", "GIF"],
  MP3: ["WAV", "AAC", "OGG"],
  WAV: ["MP3", "AAC"],
}

const ALL_SOURCE_FORMATS = Object.keys(CONVERSION_MAP)

export const MetamorphStudio: React.FC<MetamorphStudioProps> = ({
  onAddTransformation,
}) => {
  const [sourceFormat, setSourceFormat] = useState<string>("PDF")
  const [targetFormat, setTargetFormat] = useState<string>("DOCX")
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [convertedFile, setConvertedFile] = useState<{
    name: string
    downloadUrl?: string
  } | null>(null)

  const handleSourceChange = (newSource: string) => {
    setSourceFormat(newSource)
    const availableTargets = CONVERSION_MAP[newSource] || []
    if (availableTargets.length > 0) {
      setTargetFormat(availableTargets[0])
    }
    setConvertedFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      const ext = file.name.split(".").pop()?.toUpperCase()
      if (ext && CONVERSION_MAP[ext]) {
        handleSourceChange(ext)
      }
    }
    setConvertedFile(null)
  }

  const handleTransform = () => {
    setIsProcessing(true)
    setConvertedFile(null)

    setTimeout(() => {
      setIsProcessing(false)
      const baseName = selectedFileName
        ? selectedFileName.substring(0, selectedFileName.lastIndexOf(".")) || selectedFileName
        : `converted_document`
      const outputName = `${baseName}.${targetFormat.toLowerCase()}`

      setConvertedFile({ name: outputName })

      // Quietly log to transformation history
      onAddTransformation({
        id: "trans-" + Date.now(),
        name: outputName,
        sourceType: sourceFormat,
        targetType: targetFormat,
        status: "COMPLETED",
        timestamp: "Just now",
        size: "1.8 MB",
        duration: "0.6s",
      })
    }, 1000)
  }

  const availableTargets = CONVERSION_MAP[sourceFormat] || []

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full">
      <Card className="w-full border-border bg-card shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground text-center">
            Transform File
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Select File (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
          </div>

          {/* Dropdowns Row: Source File Format & Convert To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source Format Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="source-format" className="text-xs font-medium text-foreground">
                Source Format
              </label>
              <select
                id="source-format"
                value={sourceFormat}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-medium"
              >
                {ALL_SOURCE_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt} className="bg-card text-foreground">
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            {/* Convert To Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="target-format" className="text-xs font-medium text-foreground">
                Convert To
              </label>
              <select
                id="target-format"
                value={targetFormat}
                onChange={(e) => {
                  setTargetFormat(e.target.value)
                  setConvertedFile(null)
                }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-medium"
              >
                {availableTargets.map((fmt) => (
                  <option key={fmt} value={fmt} className="bg-card text-foreground">
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transform Button */}
          <Button
            type="button"
            onClick={handleTransform}
            disabled={isProcessing}
            className="w-full h-11 gap-2 font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <span>Convert {sourceFormat} to {targetFormat}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Simple Clean Result */}
          {convertedFile && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">
                  {convertedFile.name}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alert(`Downloading: ${convertedFile.name}`)}
                className="h-8 gap-1.5 text-xs font-medium shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MetamorphStudio
