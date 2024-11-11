import {
    GMAIL_API_CLIENT_ID,
    GMAIL_API_CLIENT_SECRET,
    GMAIL_API_REDIRECT_URI,
    GMAIL_API_REFRESH_TOKEN,
    PROJECT_MAIL_ADDRESS,
} from "$env/static/private"
import {google} from "googleapis"
import nodemailer from "nodemailer"

const authConstants = {
    type: "OAuth2",
    user: PROJECT_MAIL_ADDRESS,
    clientId: GMAIL_API_CLIENT_ID,
    clientSecret: GMAIL_API_CLIENT_SECRET,
    refreshToken: GMAIL_API_REFRESH_TOKEN,
}

let oAuth2Client

export function initMail() {
    oAuth2Client = new google.auth.OAuth2(GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET, GMAIL_API_REDIRECT_URI)
    oAuth2Client.setCredentials({refresh_token: GMAIL_API_REFRESH_TOKEN})
}

export async function sendMail(to, subject, html) {
    try {
        const token = await oAuth2Client.getAccessToken(),
            transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    ...authConstants,
                    accessToken: token,
                },
            })

        await transport.sendMail({
            from: PROJECT_MAIL_ADDRESS,
            to,
            subject: `${subject} | Personel Takip Sistemi, Adıyaman Üniversitesi`,
            html
        })
    } catch (error) {
        return error.message
    }
}
