import { Resend } from "resend";
import { success } from "zod";

export async function sendEmail({ to, subject, react }) {
    const resend = new Resend(process.env.RESEND_API_KEY || "");

    try {
        const data = await resend.emails.send({
            from: 'Stash <onboarding@resend.dev>',
            to,
            subject,
            react,
        });
        return {success: true,data};
    } catch (error) {
        return {success: false, error}
    }
}