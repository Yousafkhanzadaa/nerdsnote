"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { FileText, Moon, Sun, Download, Upload, Search, Maximize2, Shield, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FeaturesClient() {
  const features = [
    {
      title: "Distraction-Free Writing",
      description: "Focus on your notes with a clean, minimal interface. Perfect for online notepad users seeking simplicity.",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: "Private and Local Storage",
      description: "All notes saved locally in your browser - no servers, no tracking. Ideal for private note taking.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Dark Mode Support",
      description: "Switch between light and dark themes for comfortable note taking anytime.",
      icon: <Moon className="h-6 w-6" />,
    },
    {
      title: "Full-Screen Mode",
      description: "Enter distraction-free full-screen for immersive writing in your online notepad.",
      icon: <Maximize2 className="h-6 w-6" />,
    },
    {
      title: "Export Notes",
      description: "Easily download your notes as text files from this free note taking app.",
      icon: <Download className="h-6 w-6" />,
    },
    {
      title: "Import Files",
      description: "Upload text files to create new notes in your browser notepad.",
      icon: <Upload className="h-6 w-6" />,
    },
    {
      title: "Quick Search",
      description: "Search across all your notes instantly in this online note taking tool.",
      icon: <Search className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">NerdsNote Features</h1>
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
          <h2 className="text-2xl font-semibold mb-4">Discover why NerdsNote is the best free online notepad for your note taking needs.</h2>
          <Button size="lg" asChild>
            <Link href="/notepad">Start Writing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
