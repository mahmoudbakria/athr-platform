import { ContactForm } from "@/components/contact/ContactForm"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata = {
    title: 'اتصل بنا | خير',
    description: 'تواصل مع فريق منصة خير.',
}

export default function ContactPage() {
    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

                {/* Left Column: Information */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">اتصل بنا</h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            نحن هنا للمساعدة! إذا كان لديك أي أسئلة حول التبرعات، أو قوائم الأغراض، أو كيفية المشاركة، من فضلك لا تتردد في التواصل معنا.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-right">البريد الإلكتروني</h3>
                                <p className="text-muted-foreground text-right">support@athrk.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-right">الهاتف</h3>
                                <p className="text-muted-foreground text-right">0525485457,0522030697</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-right">العنوان</h3>
                                <p className="text-muted-foreground text-right">
                                    عرابة<br />
                                    
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div>
                    <ContactForm />
                </div>
            </div>
        </div>
    )
}
