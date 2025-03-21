import { SignIn } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 p-6">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
              footerActionLink: 'text-purple-600 hover:text-purple-700',
            },
          }}
          afterSignInUrl="/dashboard"
          signUpUrl="/auth/sign-up"
        />
      </Card>
    </div>
  )
}
