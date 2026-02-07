"use server"

import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation Schema
const schema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    phone: z.string().optional(),
    subject: z.string().min(3, "الموضوع يجب أن يكون 3 حروف على الأقل"),
    message: z.string().min(10, "الرسالة يجب أن تكون 10 حروف على الأقل"),
})

export type ContactState = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
}

export async function submitContactForm(prevState: ContactState, formData: FormData): Promise<ContactState> {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('_subject') || formData.get('subject'), // Handle legacy name
        message: formData.get('message'),
    }

    // Validate
    const validated = schema.safeParse(rawData)

    if (!validated.success) {
        return {
            success: false,
            message: "يرجى التأكد من البيانات المدخلة",
            errors: validated.error.flatten().fieldErrors
        }
    }

    const { name, email, phone, subject, message } = validated.data

    try {
        if (!process.env.RESEND_API_KEY) {
            console.error("Missing RESEND_API_KEY")
            return {
                success: false,
                message: "خطأ في الخادم: لم يتم إعداد مفتاح API"
            }
        }

        // Send Email
        const { error } = await resend.emails.send({
            from: 'Athr Support <onboarding@resend.dev>', // Change this to your verified domain later
            to: ['mahmoud.bakria@gmail.com'], // The admin email
            replyTo: email,
            subject: `[Atahr Form] ${subject}`,
            html: `
                <h2>رسالة جديدة من نموذج التواصل</h2>
                <p><strong>الاسم:</strong> ${name}</p>
                <p><strong>البريد:</strong> ${email}</p>
                <p><strong>الهاتف:</strong> ${phone || 'غير محدد'}</p>
                <hr />
                <h3>الرسالة:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        })

        if (error) {
            console.error("Resend Error:", error)
            return { success: false, message: "فشل إرسال الرسالة، يرجى المحاولة لاحقاً" }
        }

        return { success: true, message: "تم إرسال رسالتك بنجاح! شكراً لتواصلك معنا." }

    } catch (e) {
        console.error("Server Action Error:", e)
        return { success: false, message: "حدث خطأ غير متوقع" }
    }
}
