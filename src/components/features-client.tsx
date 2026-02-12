"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { FileText, Moon, Sun, Download, Upload, Search, Maximize2, Shield, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FeaturesClient() {
  const t = useTranslations("Features")
  const tLanding = useTranslations("Landing")

  const features = [
    {
      title: t("distractionFreeTitle"),
      description: t("distractionFreeDescription"),
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: t("privateStorageTitle"),
      description: t("privateStorageDescription"),
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: t("darkModeTitle"),
      description: t("darkModeDescription"),
      icon: <Moon className="h-6 w-6" />,
    },
    {
      title: t("fullScreenTitle"),
      description: t("fullScreenDescription"),
      icon: <Maximize2 className="h-6 w-6" />,
    },
    {
      title: t("exportNotesTitle"),
      description: t("exportNotesDescription"),
      icon: <Download className="h-6 w-6" />,
    },
    {
      title: t("importFilesTitle"),
      description: t("importFilesDescription"),
      icon: <Upload className="h-6 w-6" />,
    },
    {
      title: t("quickSearchTitle"),
      description: t("quickSearchDescription"),
      icon: <Search className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">{t("title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-border">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-primary/10 rounded-full text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">{t("footerText")}</h2>
          <Button size="lg" asChild>
            <Link href="/notepad">{tLanding("startWriting")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
