'use client'

import { AuthForm } from "@/components/auth/AuthForm"

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
    return <AuthForm initialMode="login" errorMessage={searchParams.error} />
}
