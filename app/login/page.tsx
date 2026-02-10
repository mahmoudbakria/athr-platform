
import { AuthForm } from "@/components/auth/AuthForm"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams
    return <AuthForm initialMode="login" errorMessage={params.error} />
}
