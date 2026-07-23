import nodemailer from 'nodemailer'
import { responses } from '../utlies/response.js'

export const checkMail = (res) => {
    const isEmail = process.env.SMTP_USER
    const email = isEmail.trim().toLowerCase()
    if (!/^[a-zA-Z0-9.#+-]+@[a-zA-z.+-]+\.[a-zA-z]{2,}$/.test(email)) return responses(res, 400 ,false, "Sender email not vaild formot ")
    return nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port : process.env.SMTP_PORT,
        family: 4,
        auth: {
            user: email,
            pass: process.env.SMTP_PASS
        },
    });
}
