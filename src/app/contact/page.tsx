import type { Metadata } from "next"

import { ReadingPage, ReadingSection } from "@/components/reading-page"
import { websiteOpenGraph } from "@/lib/structured-data"

const contactEmail = "khueonstudios@gmail.com"

export const metadata: Metadata = {
  title: "Contact - NerdsNote",
  description:
    "Contact NerdsNote by email for support, feedback, questions, or product inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    ...websiteOpenGraph,
    title: "Contact - NerdsNote",
    description:
      "Contact NerdsNote by email for support, feedback, questions, or product inquiries.",
    url: "https://nerdsnote.com/contact",
  },
}

export default function ContactPage() {
  return (
    <ReadingPage
      name="Contact"
      path="/contact"
      title="Get in touch with NerdsNote."
      lead="Send feedback, support questions, product suggestions, or business inquiries by email."
    >
      <ReadingSection title="Email" body="We read messages sent to this inbox.">
        <a className="paper-link mt-3 inline-block break-all" href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
      </ReadingSection>
    </ReadingPage>
  )
}
