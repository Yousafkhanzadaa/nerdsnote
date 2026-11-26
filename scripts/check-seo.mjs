import assert from "node:assert/strict"
import { parse, parseFragment } from "parse5"

const production = "https://nerdsnote.com"
const preview = new URL(process.argv[2] || "http://localhost:3001")
assert(["localhost", "127.0.0.1", "[::1]"].includes(preview.hostname) &&
  ["http:", "https:"].includes(preview.protocol) && preview.href === preview.origin + "/",
  "Pass a loopback server origin, e.g. npm run check:seo -- http://localhost:3001")

async function get(path, status = 200) {
  const url = new URL(path, preview)
  assert.equal(url.origin, preview.origin, `Refusing a non-local request for ${path}`)
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30000) })
  assert.equal(response.status, status, `${path} returned HTTP ${response.status}, expected ${status}`)
  return response
}

function* elements(node) {
  for (const child of node.childNodes || []) {
    if (child.tagName) yield child
    yield* elements(child)
  }
}

const attr = (node, name) => node.attrs.find(a => a.name === name)?.value || ""
const text = node => node.nodeName === "#text" ? node.value : (node.childNodes || []).map(text).join("")
const words = value => value.toLowerCase().split(/[,\s]+/).filter(Boolean)
const normalized = value => value.trim().replace(/\s+/g, " ").toLowerCase()

function crawlRule(match) {
  const [, directive, pattern] = match
  const parts = pattern.replace(/\$$/, "").split("*")
  const literal = parts.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")
  return { allowed: directive.toLowerCase() === "allow", length: pattern.length, matcher: new RegExp("^" + literal + (pattern.endsWith("$") ? "$" : "")) }
}

async function main() {
  const robots = await (await get("/robots.txt")).text()
  const groups = robots.split(/\r?\n\s*\r?\n/)
  const wildcard = groups.find(group => /^user-agent:\s*\*\s*$/im.test(group))
  assert(wildcard, "robots.txt needs a rule group for all crawlers")
  assert.match(wildcard, /^allow:\s*\/\s*$/im)
  assert.match(wildcard, /^disallow:\s*\/api\/\s*$/im)
  const rules = [...wildcard.matchAll(/^(allow|disallow):[ \t]*(\/[^\s#]*)/gim)].map(crawlRule)
    .sort((a, b) => b.length - a.length || Number(b.allowed) - Number(a.allowed))
  assert(robots.split(/\r?\n/).some(line => line.trim().toLowerCase() === `sitemap: ${production}/sitemap.xml`),
    "robots.txt must advertise the production sitemap")

  const sitemap = parseFragment(await (await get("/sitemap.xml")).text())
  const root = sitemap.childNodes.find(n => n.tagName === "urlset")
  assert(root && attr(root, "xmlns") === "http://www.sitemaps.org/schemas/sitemap/0.9", "Invalid sitemap urlset")
  const paths = new Set()
  for (const entry of root.childNodes.filter(n => n.tagName === "url")) {
    const locations = entry.childNodes.filter(n => n.tagName === "loc")
    assert.equal(locations.length, 1, "Each sitemap entry must have one loc")
    const location = text(locations[0]).trim()
    const { pathname } = new URL(location)
    assert(rules.find(rule => rule.matcher.test(pathname))?.allowed, `robots.txt blocks sitemap entry: ${pathname}`)
    assert.equal(location, production + pathname, `Noncanonical sitemap location: ${location}`)
    assert(!/^\/(api|s)(\/|$)/.test(pathname), `Private sitemap entry: ${pathname}`)
    assert(!paths.has(pathname), `Duplicate sitemap entry: ${pathname}`)
    paths.add(pathname)
  }
  for (const path of ["/", "/notepad", "/features", "/blog"]) assert(paths.has(path), `Missing sitemap entry: ${path}`)
  assert([...paths].some(path => path.startsWith("/blog/")), "No published guide articles in the sitemap")

  const unique = { title: new Map(), description: new Map(), socialTitle: new Map() }
  const links = new Map()
  for (const path of paths) {
    const response = await get(path)
    const nodes = [...elements(parse(await response.text()))]
    const tags = tag => nodes.filter(n => n.tagName === tag && n.namespaceURI === "http://www.w3.org/1999/xhtml")
    const meta = name => tags("meta").filter(n => attr(n, "name").toLowerCase() === name)
    const canonical = tags("link").filter(n => words(attr(n, "rel")).includes("canonical"))
    assert.deepEqual(canonical.map(n => new URL(attr(n, "href")).href), [production + path], `Incorrect canonical on ${path}`)
    const headings = tags("h1")
    assert(headings.length === 1 && text(headings[0]).trim(), `Expected one nonempty H1 on ${path}`)

    const og = name => tags("meta").find(n => attr(n, "property") === "og:" + name)
    const ogUrl = og("url")
    assert(ogUrl && new URL(attr(ogUrl, "content")).href === production + path, `Incorrect Open Graph URL on ${path}`)
    assert(og("image") && og("title") && og("type"), `Incomplete Open Graph preview on ${path}`)
    const values = {
      title: tags("title").map(text),
      description: meta("description").map(n => attr(n, "content")),
      socialTitle: meta("twitter:title").map(n => attr(n, "content")),
    }
    for (const [key, raw] of Object.entries(values)) {
      assert(raw.length === 1 && raw[0].trim(), `Expected one nonempty ${key} on ${path}`)
      const value = normalized(raw[0])
      assert(!unique[key].has(value), `Duplicate ${key} on ${path} and ${unique[key].get(value)}`)
      unique[key].set(value, path)
    }
    const directives = [response.headers.get("X-Robots-Tag") || "", ...[...meta("robots"), ...meta("googlebot")].map(n => attr(n, "content"))].flatMap(words)
    assert(!directives.includes("noindex") && !directives.includes("none"), `Indexing disabled on ${path}`)
    const schemas = tags("script").filter(n => attr(n, "type").toLowerCase() === "application/ld+json")
    assert(schemas.length, `Missing JSON-LD on ${path}`)
    for (const schema of schemas) {
      let data
      try { data = JSON.parse(text(schema)) } catch { throw new Error(`Malformed JSON-LD on ${path}`) }
      const items = Array.isArray(data) ? data : [data]
      assert(items.length && items.every(item => item?.["@context"] && (item["@type"] || Array.isArray(item["@graph"]))), `Missing JSON-LD context, type or graph on ${path}`)
    }
    const outbound = new Set()
    for (const anchor of tags("a")) {
      const href = attr(anchor, "href")
      if (!href || directives.includes("nofollow") || words(attr(anchor, "rel")).includes("nofollow")) continue
      const url = new URL(href, production + path)
      if (url.origin === production && !url.search && paths.has(url.pathname)) outbound.add(url.pathname)
    }
    links.set(path, outbound)
  }

  const reachable = new Set(["/"])
  for (const path of reachable) for (const next of links.get(path)) reachable.add(next)
  const orphaned = [...paths].filter(path => !reachable.has(path))
  assert(!orphaned.length, `No crawlable link path from the homepage to ${orphaned.join(", ")}`)

  // This slug fails format validation before the shared-note storage lookup.
  for (const [path, status] of [["/s/invalid!", 404], ["/notepad?openShared=invalid!", 200]]) {
    const response = await get(path, status)
    const header = words(response.headers.get("X-Robots-Tag") || "")
    for (const directive of ["noindex", "nofollow", "nosnippet"]) {
      assert(header.includes(directive), `Missing X-Robots-Tag ${directive} on ${path}`)
    }
    await response.body?.cancel()
  }
  console.log(`SEO checks passed for ${paths.size} public pages, robots.txt, sitemap.xml and both private URL checks.`)
}

main().catch(error => {
  console.error(`SEO check failed: ${error.message}`)
  process.exitCode = 1
})
