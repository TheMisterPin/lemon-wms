import { LoginPageClient } from '@/app/(auth)/login/login-page-client'

export default function LoginPage() {
  const isDemoEnabled = process.env.IS_DEMO === 'true'

  return <LoginPageClient isDemoEnabled={isDemoEnabled} />
}
