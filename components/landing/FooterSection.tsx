'use client'

import Link from 'next/link'
import type { FooterProps, ColorPalette, DesignStyle } from '@/types/agents'

interface FooterSectionProps {
  props: FooterProps
  isPreview?: boolean
  palette?: ColorPalette
  style?: DesignStyle
}

const PALETTE_GRADIENTS: Record<ColorPalette, string> = {
  violet: 'from-violet-600 via-purple-600 to-indigo-700',
  ocean: 'from-cyan-500 via-blue-600 to-indigo-700',
  sunset: 'from-orange-500 via-rose-500 to-pink-600',
  forest: 'from-emerald-500 via-teal-600 to-cyan-700',
  midnight: 'from-slate-900 via-purple-900 to-slate-900',
  electric: 'from-blue-600 via-indigo-600 to-violet-700',
  rose: 'from-rose-400 via-pink-500 to-purple-600',
  aurora: 'from-green-400 via-cyan-500 to-blue-600',
}

const PALETTE_COLORS: Record<ColorPalette, { text: string; hover: string }> = {
  violet: { text: 'text-violet-500', hover: 'hover:text-violet-400' },
  ocean: { text: 'text-cyan-500', hover: 'hover:text-cyan-400' },
  sunset: { text: 'text-orange-500', hover: 'hover:text-orange-400' },
  forest: { text: 'text-emerald-500', hover: 'hover:text-emerald-400' },
  midnight: { text: 'text-purple-400', hover: 'hover:text-purple-300' },
  electric: { text: 'text-blue-500', hover: 'hover:text-blue-400' },
  rose: { text: 'text-rose-500', hover: 'hover:text-rose-400' },
  aurora: { text: 'text-green-500', hover: 'hover:text-green-400' },
}

export function FooterSection({ props, isPreview, palette = 'violet', style = 'gradient' }: FooterSectionProps) {
  const { companyName, links, socials } = props
  const gradient = PALETTE_GRADIENTS[palette]
  const colors = PALETTE_COLORS[palette]

  const LinkWrapper = isPreview
    ? ({ children, href }: { children: React.ReactNode; href: string }) => (
        <span className="cursor-pointer">{children}</span>
      )
    : ({ children, href }: { children: React.ReactNode; href: string }) => (
        <Link href={href}>{children}</Link>
      )

  // Glassmorphic/Dark Style
  if (style === 'glassmorphic' || style === 'dark') {
    return (
      <footer className="py-12 px-4 md:px-8 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {companyName}
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link, index) => (
                <LinkWrapper key={index} href={link.href}>
                  <span className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </span>
                </LinkWrapper>
              ))}
            </nav>
            {socials && (
              <div className="flex items-center gap-4">
                {socials.twitter && (
                  <LinkWrapper href={socials.twitter}>
                    <svg
                      className="h-5 w-5 text-slate-400 hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </LinkWrapper>
                )}
                {socials.github && (
                  <LinkWrapper href={socials.github}>
                    <svg
                      className="h-5 w-5 text-slate-400 hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </LinkWrapper>
                )}
                {socials.linkedin && (
                  <LinkWrapper href={socials.linkedin}>
                    <svg
                      className="h-5 w-5 text-slate-400 hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </LinkWrapper>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    )
  }

  // Bold Style
  if (style === 'bold') {
    return (
      <footer className="py-12 px-4 md:px-8 bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-black text-white">{companyName}</div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link, index) => (
                <LinkWrapper key={index} href={link.href}>
                  <span className={`text-slate-300 ${colors.hover} transition-colors font-medium`}>
                    {link.label}
                  </span>
                </LinkWrapper>
              ))}
            </nav>
            {socials && (
              <div className="flex items-center gap-4">
                {socials.twitter && (
                  <LinkWrapper href={socials.twitter}>
                    <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center ${colors.hover} transition-colors`}>
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                  </LinkWrapper>
                )}
                {socials.github && (
                  <LinkWrapper href={socials.github}>
                    <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center ${colors.hover} transition-colors`}>
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                  </LinkWrapper>
                )}
                {socials.linkedin && (
                  <LinkWrapper href={socials.linkedin}>
                    <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center ${colors.hover} transition-colors`}>
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                  </LinkWrapper>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    )
  }

  // Minimal Style
  if (style === 'minimal') {
    return (
      <footer className="py-12 px-4 md:px-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-semibold text-slate-900 dark:text-white">{companyName}</div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link, index) => (
                <LinkWrapper key={index} href={link.href}>
                  <span className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {link.label}
                  </span>
                </LinkWrapper>
              ))}
            </nav>
            {socials && (
              <div className="flex items-center gap-4">
                {socials.twitter && (
                  <LinkWrapper href={socials.twitter}>
                    <svg className="h-5 w-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </LinkWrapper>
                )}
                {socials.github && (
                  <LinkWrapper href={socials.github}>
                    <svg className="h-5 w-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </LinkWrapper>
                )}
                {socials.linkedin && (
                  <LinkWrapper href={socials.linkedin}>
                    <svg className="h-5 w-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </LinkWrapper>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    )
  }

  // Default Gradient Style
  return (
    <footer className="py-12 px-4 md:px-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {companyName}
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {links.map((link, index) => (
              <LinkWrapper key={index} href={link.href}>
                <span className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {link.label}
                </span>
              </LinkWrapper>
            ))}
          </nav>
          {socials && (
            <div className="flex items-center gap-4">
              {socials.twitter && (
                <LinkWrapper href={socials.twitter}>
                  <svg
                    className={`h-5 w-5 text-slate-500 ${colors.hover} transition-colors`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </LinkWrapper>
              )}
              {socials.github && (
                <LinkWrapper href={socials.github}>
                  <svg
                    className={`h-5 w-5 text-slate-500 ${colors.hover} transition-colors`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </LinkWrapper>
              )}
              {socials.linkedin && (
                <LinkWrapper href={socials.linkedin}>
                  <svg
                    className={`h-5 w-5 text-slate-500 ${colors.hover} transition-colors`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </LinkWrapper>
              )}
            </div>
          )}
        </div>
        <div className="mt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
