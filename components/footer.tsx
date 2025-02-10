import Link from "next/link"

const footerSections = [
  {
    title: "Services",
    links: [
      { name: "Plastic Surgery", href: "/services/plastic-surgery" },
      { name: "Dermatology", href: "/services/dermatology" },
      { name: "Medical Spa", href: "/services/medical-spa" },
      { name: "Functional Medicine", href: "/services/functional-medicine" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/team" },
      { name: "Gallery", href: "/gallery" },
      { name: "Articles", href: "/articles" },
    ],
  },
  {
    title: "Patient Info",
    links: [
      { name: "Financing", href: "/financing" },
      { name: "Out-of-Town Clients", href: "/out-of-town" },
      { name: "Gift Certificates", href: "/gift-certificates" },
      { name: "Membership", href: "/membership" },
    ],
  },
  {
    title: "Contact",
    links: [
      { name: "Schedule Consultation", href: "/appointment" },
      { name: "Location", href: "/location" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-cerebri font-normal uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors font-cerebri font-light"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="font-['lorimer-no-2-condensed'] font-semibold text-2xl">ALLURE MD</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <span>© 2024 Allure MD. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 