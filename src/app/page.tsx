import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Shield, BookOpen, Info, ExternalLink, Download, Upload, Search, Moon, Sun, Maximize2, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">NerdsNote</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/features">
              <Button variant="ghost" size="sm">Features</Button>
            </Link>
            <Link href="/notepad">
              <Button size="sm">
                Open Notepad
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Free Online Notepad for Distraction‑Free Writing
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            NerdsNote is a free online notepad for distraction‑free writing. No login, no ads.
            Auto‑save to your device, dark mode, import/export, search, and offline support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/notepad">
              <Button size="lg" className="text-lg px-8 py-6">
                <FileText className="h-5 w-5 mr-2" />
                Start Writing Now - It's Free
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Explore Features
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No registration required • Works offline • Privacy-first
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose NerdsNote Online Notepad?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Privacy-First Storage</h3>
              <p className="text-muted-foreground">
                All notes stored locally in your browser. No servers, no tracking, complete privacy for your writing.
              </p>
            </Card>

            <Card className="p-6">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Auto-Save Notes</h3>
              <p className="text-muted-foreground">
                Your notes are automatically saved as you type. Never lose your work in this note taking app.
              </p>
            </Card>

            <Card className="p-6">
              <Moon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Dark Mode Support</h3>
              <p className="text-muted-foreground">
                Switch between light and dark themes for comfortable writing in any environment.
              </p>
            </Card>

            <Card className="p-6">
              <Maximize2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Distraction-Free Mode</h3>
              <p className="text-muted-foreground">
                Full-screen mode removes all distractions so you can focus on your writing.
              </p>
            </Card>

            <Card className="p-6">
              <Search className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Quick Search</h3>
              <p className="text-muted-foreground">
                Find any note instantly with our fast, built-in search functionality.
              </p>
            </Card>

            <Card className="p-6">
              <Download className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Export & Import</h3>
              <p className="text-muted-foreground">
                Easily download your notes as text files or import existing files.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal & Tutorials Section - ALL ORIGINAL CONTENT PRESERVED */}
      <section className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-8">

          <div className="py-6 space-y-6 max-w-6xl mx-auto">
            {/* Tutorials */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">How to Use NerdsNote Online Notepad for Note Taking</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Getting Started</h4>
                  <p>• Click &quot;New Note&quot; to create your first note</p>
                  <p>• Start typing in the editor - your notes auto-save as you type</p>
                  <p>• Use the search bar to find specific notes</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Keyboard Shortcuts</h4>
                  <p>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + N</kbd> - Create new note</p>
                  <p>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + S</kbd> - Auto-save (automatic)</p>
                  <p>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + F</kbd> - Focus search bar</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Features</h4>
                  <p>• <strong>Distract-free mode:</strong> Click the maximize button for full-screen writing</p>
                  <p>• <strong>Dark/Light theme:</strong> Toggle between themes with the moon/sun button</p>
                  <p>• <strong>Font size:</strong> Adjust text size with A+ and A- buttons</p>
                  <p>• <strong>Export:</strong> Download your notes as text files</p>
                  <p>• <strong>Import:</strong> Upload text files to create new notes</p>
                  <p className="mt-2"><Link href="/features" className="text-primary underline">See all features</Link></p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Tips</h4>
                  <p>• Hover over notes in the sidebar to see the delete button</p>
                  <p>• Use descriptive titles to easily find your notes later</p>
                  <p>• Export important notes regularly as a backup</p>
                  <p>• The app works offline - no internet connection required</p>
                </div>
              </div>
            </Card>

            {/* About NerdsNote */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">About NerdsNote: Free Online Notepad and Note Taking App</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>NerdsNote</strong> is a fast, privacy‑first online notepad built for developers, writers, and anyone who needs a distraction‑free place to jot ideas. It runs in the browser, requires no account, and saves notes locally so your writing remains on your device.</p>
                <p>Designed for speed and clarity, NerdsNote supports dark mode, offline use, keyboard shortcuts, quick search, import/export, and adjustable font size for long writing sessions.</p>
                <p>Built with a minimal UI so you can focus on what matters most: your words.</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://twitter.com/intent/tweet?text=Check out NerdsNote - a free online notepad!&url=https://nerdsnote.com`} target="_blank" rel="noopener noreferrer">
                      Share on Twitter
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=https://nerdsnote.com`} target="_blank" rel="noopener noreferrer">
                      Share on Facebook
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

            {/* SEO‑Optimized Overview */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Free Online Notepad for Distraction‑Free Note Taking</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>NerdsNote is a free online notepad and minimal note‑taking app. Write instantly in your browser with auto‑save, no sign‑up, and no ads. It is perfect for quick notes, drafting blog posts, code snippets, and study plans.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Privacy‑first: notes are saved in localStorage on your device</li>
                  <li>Works offline with fast load times</li>
                  <li>Dark mode and adjustable font size for comfort</li>
                  <li>Import .txt files and export any note with one click</li>
                  <li>Search across all notes to find ideas quickly</li>
                </ul>
                <p>Relevant keywords: free online notepad, distraction‑free writing app, browser‑based notes, local notes, privacy‑friendly notepad, simple notepad for developers, quick notes app, no login notes.</p>
              </div>
            </Card>

            {/* FAQ */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Frequently Asked Questions about Online Notepad and Note Taking</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground">Is NerdsNote free?</p>
                  <p>Yes. NerdsNote is completely free to use and does not require an account.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Where are my notes stored?</p>
                  <p>All notes are stored locally in your browser using localStorage. Clearing browser data will remove them, so export important notes regularly.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Do I need an internet connection?</p>
                  <p>No. After the first load, NerdsNote works offline in most modern browsers.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">How do I export a note?</p>
                  <p>Click the Download button to save the active note as a .txt file.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">How do I import a .txt file?</p>
                  <p>Use the Upload button and choose a .txt file. It will create a new note using the file name.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Does NerdsNote support Markdown?</p>
                  <p>NerdsNote is plain text. You can write Markdown syntax and export as .txt for use elsewhere.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Can I change the font size or theme?</p>
                  <p>Yes. Use A+ / A- to adjust text size and the Sun/Moon toggle to switch themes.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Is there cloud sync?</p>
                  <p>Not yet. All notes are stored locally on your device. Export notes to create backups.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Which browsers are supported?</p>
                  <p>NerdsNote supports recent versions of Chrome, Edge, Firefox, and Safari.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Who built NerdsNote?</p>
                  <p>NerdsNote is built by Khueon Studios. Visit khueonstudios.com to learn more.</p>
                </div>
              </div>
            </Card>

            {/* Built By */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Built by Khueon Studios - Creators of Online Notepad Tools</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>This project is crafted and maintained by <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Khueon Studios</a>. We create clean, performant, and user‑friendly tools for the web.</p>
                <p className="flex items-center gap-1"><a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">Visit khueonstudios.com <ExternalLink className="h-3 w-3" /></a></p>
              </div>
            </Card>

            {/* Privacy Policy */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Privacy Policy for NerdsNote Online Notepad</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Data Storage:</strong> All your notes are stored locally in your browser&apos;s localStorage. We don&apos;t collect, store, or transmit any of your data to our servers.</p>
                <p><strong>No Tracking:</strong> We don&apos;t use cookies, analytics, or any tracking mechanisms. Your privacy is completely protected.</p>
                <p><strong>Local Only:</strong> Your notes remain on your device and are never sent to external servers. You have complete control over your data.</p>
                <p><strong>Browser Storage:</strong> Notes are saved in your browser&apos;s localStorage. Clearing your browser data will remove your notes.</p>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Terms and Conditions for Free Note Taking App</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Use at Your Own Risk:</strong> This application is provided &quot;as is&quot; without any warranties. Use it at your own discretion.</p>
                <p><strong>Data Responsibility:</strong> You are responsible for backing up your notes. We recommend exporting important notes regularly.</p>
                <p><strong>No Guarantees:</strong> We don&apos;t guarantee data persistence. Browser updates, clearing data, or technical issues may result in data loss.</p>
                <p><strong>Free Service:</strong> This is a free, open-source application. No payment or registration required.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-primary/5 rounded-lg p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Writing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who trust NerdsNote for their daily writing needs.
          </p>
          <Link href="/notepad">
            <Button size="lg" className="text-lg px-8 py-6">
              <FileText className="h-5 w-5 mr-2" />
              Open Notepad Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NerdsNote. Built with Next.js and deployed on Vercel.</p>
            <p className="mt-2">
              A project by{" "}
              <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="underline">
                Khueon Studios
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Add FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is NerdsNote free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. NerdsNote is completely free to use and does not require an account."
                }
              },
              {
                "@type": "Question",
                "name": "Where are my notes stored?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "All notes are stored locally in your browser using localStorage. Clearing browser data will remove them, so export important notes regularly."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need an internet connection?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. After the first load, NerdsNote works offline in most modern browsers."
                }
              },
              {
                "@type": "Question",
                "name": "How do I export a note?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Click the Download button to save the active note as a .txt file."
                }
              },
              {
                "@type": "Question",
                "name": "How do I import a .txt file?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use the Upload button and choose a .txt file. It will create a new note using the file name."
                }
              },
              {
                "@type": "Question",
                "name": "Does NerdsNote support Markdown?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NerdsNote is plain text. You can write Markdown syntax and export as .txt for use elsewhere."
                }
              },
              {
                "@type": "Question",
                "name": "Can I change the font size or theme?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Use A+ / A- to adjust text size and the Sun/Moon toggle to switch themes."
                }
              },
              {
                "@type": "Question",
                "name": "Is there cloud sync?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not yet. All notes are stored locally on your device. Export notes to create backups."
                }
              },
              {
                "@type": "Question",
                "name": "Which browsers are supported?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NerdsNote supports recent versions of Chrome, Edge, Firefox, and Safari."
                }
              },
              {
                "@type": "Question",
                "name": "Who built NerdsNote?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NerdsNote is built by Khueon Studios. Visit khueonstudios.com to learn more."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}