import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl text-neutral-900 dark:text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            {siteConfig.name}
          </Link>
        </div>
        <div className="w-full max-w-md px-4">{children}</div>
        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
