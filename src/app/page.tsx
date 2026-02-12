import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Shield, BookOpen, Info, ExternalLink, Download, Upload, Search, Moon, Sun, Maximize2, Plus, ArrowRight, Zap, Globe, Laptop } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { LanguageSwitcher } from "@/components/language-switcher"

export const metadata: Metadata = {
  title: "NerdsNote | Distraction-Free Online Notepad",
  description: "Write immediately in your browser. Auto-saving, offline-capable, and privacy-first.",
}

export default async function HomePage() {
  const t = await getTranslations("Landing")

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
            <LanguageSwitcher />
            <Link href="/features" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t("seeFeatures")}</Button>
            </Link>
            <Link href="/notepad">
              <Button size="sm" className="font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                {t("startWriting")}
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
              {t("noLogin")}
            </div>

            <h1 className="max-w-4xl mx-auto text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent pb-2" dangerouslySetInnerHTML={{ __html: t.raw("heroTitle") }}>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
              {t("heroDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/notepad">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  {t("startWriting")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                  {t("seeFeatures")}
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
                  {t("heroMockupText")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: t.raw("featuresTitle") }}></h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("featuresDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: t("privateDesignTitle"),
                  description: t("privateDesignDesc")
                },
                {
                  icon: Zap,
                  title: t("autoSaveTitle"),
                  description: t("autoSaveDesc")
                },
                {
                  icon: Moon,
                  title: t("darkModeTitle"),
                  description: t("darkModeDesc")
                },
                {
                  icon: Globe,
                  title: t("offlineTitle"),
                  description: t("offlineDesc")
                },
                {
                  icon: Search,
                  title: t("searchTitle"),
                  description: t("searchDesc")
                },
                {
                  icon: Download,
                  title: t("exportTitle"),
                  description: t("exportDesc")
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
            <h2 className="text-3xl font-bold text-center mb-16">{t("getStartedTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10"></div>

              <div className="text-center">
                <div className="w-24 h-24 bg-background border-4 border-muted rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-sm">
                  <span className="text-4xl font-bold text-muted-foreground/50">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t("step1Title")}</h3>
                <p className="text-muted-foreground">{t("step1Desc")}</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-sm">
                  <span className="text-4xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t("step2Title")}</h3>
                <p className="text-muted-foreground">{t("step2Desc")}</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-background border-4 border-muted rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-sm">
                  <span className="text-4xl font-bold text-muted-foreground/50">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t("step3Title")}</h3>
                <p className="text-muted-foreground">{t("step3Desc")}</p>
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
                <h2 className="text-3xl font-bold text-center">{t("howToUseTitle")}</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-border/60 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> {t("gettingStartedTitle")}
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{t("gettingStarted1")}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{t("gettingStarted2")}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{t("gettingStarted3")}</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 border-border/60 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-primary" /> {t("shortcutsTitle")}
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex justify-between items-center">
                      <span>{t("shortcutNew")}</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">Ctrl + N</kbd>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>{t("shortcutSave")}</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">{t("automatic")}</kbd>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>{t("shortcutSearch")}</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">Ctrl + F</kbd>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 border-border/60 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-primary" /> {t("proFeaturesTitle")}
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: t.raw("proFeature1") }}></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: t.raw("proFeature2") }}></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: t.raw("proFeature3") }}></span>
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
                  {t("faqTitle")}
                </h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                  {[
                    { q: t("faq1Q"), a: t("faq1A") },
                    { q: t("faq2Q"), a: t("faq2A") },
                    { q: t("faq3Q"), a: t("faq3A") },
                    { q: t("faq4Q"), a: t("faq4A") },
                    { q: t("faq5Q"), a: t("faq5A") },
                    { q: t("faq6Q"), a: t("faq6A") },
                    { q: t("faq7Q"), a: t("faq7A") },
                    { q: t("faq8Q"), a: t("faq8A") },
                    { q: t("faq9Q"), a: t("faq9A") },
                    { q: t("faq10Q"), a: t("faq10A") },
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
                  <h3 className="text-lg font-bold mb-3">{t("aboutTitle")}</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      {t("aboutDesc1")}
                    </p>
                    <p>
                      {t("aboutDesc2")}
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={`https://twitter.com/intent/tweet?text=Check out NerdsNote - a free online notepad!&url=https://nerdsnote.com`} target="_blank" rel="noopener noreferrer">
                          {t("shareTwitter")}
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=https://nerdsnote.com`} target="_blank" rel="noopener noreferrer">
                          {t("shareFacebook")}
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* SEO Card */}
                <Card className="p-6 border-border/60">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" /> {t("seoTitle")}
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      {t("seoDesc")}
                    </p>
                    <p className="text-xs uppercase tracking-wide font-semibold text-foreground/50 pt-2">{t("keywordsLabel")}</p>
                    <p className="text-xs">
                      {t("keywords")}
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
                  <h3 className="text-lg font-semibold">{t("privacyPolicyTitle")}</h3>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground bg-muted/20 p-6 rounded-xl border border-border/50">
                  <p>
                    {t("privacyDataStorage")}
                  </p>
                  <p>
                    {t("privacyShareLinks")}
                  </p>
                  <p>
                    {t("privacyNoTracking")}
                  </p>
                  <p>
                    {t("privacyLocalOnly")}
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{t("termsTitle")}</h3>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground bg-muted/20 p-6 rounded-xl border border-border/50">
                  <p>
                    {t("termsRisk")}
                  </p>
                  <p>
                    {t("termsShareLinks")}
                  </p>
                  <p>
                    {t("termsDataResp")}
                  </p>
                  <p>
                    {t("termsNoGuarantees")}
                  </p>
                  <p>
                    {t("termsFreeService")}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Built By Section (Sub-footer) */}
        <section className="py-12 border-t border-border/40 bg-muted/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold mb-4">{t("builtByTitle")}</h3>
            <div className="max-w-2xl mx-auto text-muted-foreground space-y-4">
              <p>
                {t("builtByDesc")}
              </p>
              <div className="flex justify-center">
                <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  {t("visitLink")} <ExternalLink className="h-4 w-4" />
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
          <p className="mb-4">{t("footerRights", { year: new Date().getFullYear() })}</p>
          <p>
            {t("footerProjectBy")}{" "}
            <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="underline decoration-muted-foreground/30 hover:decoration-primary underline-offset-4 transition-all">
              Khueon Studios
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
