import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Shield, BookOpen, Info, ExternalLink, Download, Upload, Search, Moon, Sun, Maximize2, Plus, ArrowRight, Zap, Globe, Laptop } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">NerdsNote</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/features" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Features</Button>
            </Link>
            <Link href="/notepad">
              <Button size="sm" className="font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                Open Notepad
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
      {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/5 blur-[100px]"></div>
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              No Login Required • Free Forever
            </div>
            
            <h1 className="max-w-4xl mx-auto text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent pb-2">
              The Distraction‑Free <br/> Online Notepad.
          </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
              Write immediately in your browser. Auto-saving, offline-capable, and privacy-first. 
              Just you and your words.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/notepad">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  Start Writing
                  <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/features">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                  See Features
              </Button>
            </Link>
          </div>

            {/* Browser Mockup */}
            <div className="relative max-w-5xl mx-auto rounded-xl border border-border bg-background shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Fake Browser Toolbar */}
              <div className="bg-muted/30 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="ml-4 flex-1 max-w-sm mx-auto bg-background/50 rounded-md h-6 w-full"></div>
              </div>
              
              {/* Fake Content */}
              <div className="p-8 md:p-12 text-left min-h-[300px] bg-background">
                <div className="h-8 w-3/4 bg-foreground/10 rounded mb-6 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-foreground/5 rounded animate-pulse delay-75"></div>
                  <div className="h-4 w-11/12 bg-foreground/5 rounded animate-pulse delay-100"></div>
                  <div className="h-4 w-5/6 bg-foreground/5 rounded animate-pulse delay-150"></div>
                  <div className="h-4 w-full bg-foreground/5 rounded animate-pulse delay-200"></div>
                </div>
                <div className="mt-8 p-4 border border-dashed border-border rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
                  Your distraction-free writing space looks like this
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need,<br/>nothing you don't.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built for speed and focus. We removed the clutter so you can focus on the content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "Private by Design",
                  description: "Notes live in your browser's local storage. No data is ever sent to our servers."
                },
                {
                  icon: Zap,
                  title: "Instant Auto-Save",
                  description: "Never lose a thought. Every keystroke is saved automatically to your device."
                },
                {
                  icon: Moon,
                  title: "Dark Mode Ready",
                  description: "Easy on the eyes day or night. Switch themes with a single click."
                },
                {
                  icon: Globe,
                  title: "Works Offline",
                  description: "No internet? No problem. Access and edit your notes anywhere."
                },
                {
                  icon: Search,
                  title: "Instant Search",
                  description: "Find any note in milliseconds with our lightning-fast search engine."
                },
                {
                  icon: Download,
                  title: "Export Anywhere",
                  description: "Your data is yours. Export individual notes or your entire collection anytime."
                }
              ].map((feature, i) => (
                <Card key={i} className="p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/60 bg-background/50 backdrop-blur-sm group">
                  <div className="mb-6 p-3 bg-primary/10 w-fit rounded-xl group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
              </p>
            </Card>
              ))}
          </div>
        </div>
      </section>

        {/* How it works */}
        <section className="py-24 border-y border-border/40">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Get Started in Seconds</h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10"></div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-background border-4 border-muted rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-sm">
                  <span className="text-4xl font-bold text-muted-foreground/50">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Open the App</h3>
                <p className="text-muted-foreground">No sign-up or login required. Just visit the URL.</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-sm">
                  <span className="text-4xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Start Typing</h3>
                <p className="text-muted-foreground">The editor is ready instantly. Just focus on your ideas.</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-background border-4 border-muted rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-sm">
                  <span className="text-4xl font-bold text-muted-foreground/50">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Auto-Saved</h3>
                <p className="text-muted-foreground">Close the tab anytime. Your work is safe for next time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ & Info Grid */}
        <section className="py-24 bg-background border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            
            {/* Tutorials / How to Use */}
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8 justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-center">How to Use NerdsNote</h2>
                </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-border/60 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Getting Started
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Click "New Note" or just start typing.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Notes auto-save instantly as you type.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Use the search bar to find specific texts.</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 border-border/60 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-primary" /> Keyboard Shortcuts
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex justify-between items-center">
                      <span>Create new note</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">Ctrl + N</kbd>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Auto-save</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">Automatic</kbd>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Focus Search</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">Ctrl + F</kbd>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 border-border/60 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-primary" /> Pro Features
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Distraction-Free:</strong> Use maximize button.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Theme:</strong> Toggle Dark/Light mode.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Font Size:</strong> Adjust with A+ / A-.</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* Main Content Grid: FAQ + About */}
            <div className="grid lg:grid-cols-3 gap-12 mb-20">
              
              {/* FAQ Section (Span 2) */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Frequently Asked Questions
                </h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                  {[
                    { q: "Is NerdsNote free?", a: "Yes. NerdsNote is completely free to use and does not require an account." },
                    { q: "Where are my notes stored?", a: "All notes are stored locally in your browser using localStorage. Clearing browser data will remove them, so export important notes regularly." },
                    { q: "Do I need an internet connection?", a: "No. After the first load, NerdsNote works offline in most modern browsers." },
                    { q: "How do I export a note?", a: "Click the Download button to save the active note as a .txt file." },
                    { q: "How do I import a .txt file?", a: "Use the Upload button and choose a .txt file. It will create a new note using the file name." },
                    { q: "Does NerdsNote support Markdown?", a: "NerdsNote is plain text. You can write Markdown syntax and export as .txt for use elsewhere." },
                    { q: "Can I change the font size or theme?", a: "Yes. Use A+ / A- to adjust text size and the Sun/Moon toggle to switch themes." },
                    { q: "Is there cloud sync?", a: "Not yet. All notes are stored locally on your device. Export notes to create backups." },
                    { q: "Which browsers are supported?", a: "NerdsNote supports recent versions of Chrome, Edge, Firefox, and Safari." },
                    { q: "Who built NerdsNote?", a: "NerdsNote is built by Khueon Studios. Visit khueonstudios.com to learn more." },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="font-semibold text-foreground">{item.q}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar: About & SEO (Span 1) */}
              <div className="space-y-8">
                {/* About Card */}
                <Card className="p-6 border-border/60 bg-primary/5">
                  <h3 className="text-lg font-bold mb-3">About NerdsNote</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>NerdsNote</strong> is a fast, privacy‑first online notepad built for developers, writers, and anyone who needs a distraction‑free place to jot ideas. It runs in the browser, requires no account, and saves notes locally so your writing remains on your device.
                    </p>
                    <p>
                      Designed for speed and clarity, NerdsNote supports dark mode, offline use, keyboard shortcuts, quick search, import/export, and adjustable font size.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <a href={`https://twitter.com/intent/tweet?text=Check out NerdsNote - a free online notepad!&url=https://nerdsnote.com`} target="_blank" rel="noopener noreferrer">
                      Share on Twitter
                    </a>
                  </Button>
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=https://nerdsnote.com`} target="_blank" rel="noopener noreferrer">
                      Share on Facebook
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

                {/* SEO Card */}
                <Card className="p-6 border-border/60">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" /> SEO Overview
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      NerdsNote is a free online notepad and minimal note‑taking app. Write instantly in your browser with auto‑save, no sign‑up, and no ads.
                    </p>
                    <p className="text-xs uppercase tracking-wide font-semibold text-foreground/50 pt-2">Keywords</p>
                    <p className="text-xs">
                      free online notepad, distraction‑free writing app, browser‑based notes, local notes, privacy‑friendly notepad, simple notepad for developers.
                    </p>
              </div>
            </Card>
              </div>
                </div>

            {/* Legal Section */}
            <div className="grid md:grid-cols-2 gap-8 border-t border-border/40 pt-16">
              
              {/* Privacy Policy */}
                <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Privacy Policy</h3>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground bg-muted/20 p-6 rounded-xl border border-border/50">
                  <p>
                    <strong className="text-foreground">Data Storage:</strong> All your notes are stored locally in your browser's localStorage. We don't collect, store, or transmit any of your data to our servers.
                  </p>
                  <p>
                    <strong className="text-foreground">No Tracking:</strong> We don't use cookies, analytics, or any tracking mechanisms. Your privacy is completely protected.
                  </p>
                  <p>
                    <strong className="text-foreground">Local Only:</strong> Your notes remain on your device and are never sent to external servers. You have complete control over your data.
                  </p>
                  <p>
                    <strong className="text-foreground">Browser Storage:</strong> Notes are saved in your browser's localStorage. Clearing your browser data will remove your notes.
                  </p>
                </div>
                </div>

              {/* Terms and Conditions */}
                <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Terms and Conditions</h3>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground bg-muted/20 p-6 rounded-xl border border-border/50">
                  <p>
                    <strong className="text-foreground">Use at Your Own Risk:</strong> This application is provided "as is" without any warranties. Use it at your own discretion.
                  </p>
                  <p>
                    <strong className="text-foreground">Data Responsibility:</strong> You are responsible for backing up your notes. We recommend exporting important notes regularly.
                  </p>
                  <p>
                    <strong className="text-foreground">No Guarantees:</strong> We don't guarantee data persistence. Browser updates, clearing data, or technical issues may result in data loss.
                  </p>
                  <p>
                    <strong className="text-foreground">Free Service:</strong> This is a free, open-source application. No payment or registration required.
                  </p>
                </div>
              </div>

              </div>
              </div>
        </section>

        {/* Built By Section (Sub-footer) */}
        <section className="py-12 border-t border-border/40 bg-muted/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold mb-4">Built by Khueon Studios</h3>
            <div className="max-w-2xl mx-auto text-muted-foreground space-y-4">
              <p>
                This project is crafted and maintained by <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline underline-offset-4 font-medium">Khueon Studios</a>. We create clean, performant, and user‑friendly tools for the web.
              </p>
              <div className="flex justify-center">
                <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                   Visit khueonstudios.com <ExternalLink className="h-4 w-4" />
                </a>
              </div>
          </div>
        </div>
      </section>
      </main>

      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary opacity-50" />
            <span className="font-semibold text-foreground">NerdsNote</span>
        </div>
          <p className="mb-4">&copy; {new Date().getFullYear()} NerdsNote. All rights reserved.</p>
          <p>
              A project by{" "}
            <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="underline decoration-muted-foreground/30 hover:decoration-primary underline-offset-4 transition-all">
                Khueon Studios
              </a>
            </p>
        </div>
      </footer>

      {/* Schema Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NerdsNote",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Free, private, distraction-free online notepad. Auto-saves to your browser.",
            "featureList": "Auto-save, Offline mode, Dark mode, File export, Local storage",
            "author": {
              "@type": "Organization",
              "name": "Khueon Studios",
              "url": "https://www.khueonstudios.com"
            }
          })
        }}
      />
    </div>
  )
}
