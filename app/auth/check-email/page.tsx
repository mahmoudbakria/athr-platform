
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
                    <CardDescription className="text-base mt-2">
                        We've sent a verification link to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Please click the link in the email to verify your account. Once verified, you can log in to access your dashboard.
                    </p>
                    <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-100">
                        <span className="font-semibold">Note:</span> If you don't see the email, check your spam folder.
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/auth/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
