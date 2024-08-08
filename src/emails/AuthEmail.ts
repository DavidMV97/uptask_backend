import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name:  string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com',
            to: user.email,
            subject: 'Uptask  - Confirma tu cuenta',
            text: 'Uptask - Confirma  tu cuenta',
            html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta </p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account"> Confirmar cuenta </a>
                <p>E ingresa el siguiente código: <b>${user.token}</b></p>    
                <p>Este token expira en 10 minutos</p>
            `
        })

    }

    static sendPasswordResetToken = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com',
            to: user.email,
            subject: 'Uptask  -Reestablece tu contraseña',
            text: 'Uptask - Reestablece tu contraseña',
            html: `<p>Hola: ${user.name}, has solicitado reestablecer tu contraseña. </p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password"> Reestablecer contraseña </a>
                <p>E ingresa el siguiente código: <b>${user.token}</b></p>    
                <p>Este token expira en 10 minutos</p>
            `
        })

    }
}