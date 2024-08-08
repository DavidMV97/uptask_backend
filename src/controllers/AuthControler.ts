import type { Request, Response } from 'express';
import User from '../models/User';
import Token from '../models/Token';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            // Prevenir duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El email ingresado ya se encuentra registrado')
                return res.status(409).json({ error: error.message })
            }

            // Crea un usuario
            const user = new User(req.body)
        
            // Hash Password
            user.password = await hashPassword(password)

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada exitosamente, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error creando el usuario' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                const error = new Error('Token no válido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }

            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmación')
                return res.status(401).json({ error: error.message })
            }

            // Revisar password 
            const isPasswordCorrect = await checkPassword(password, user.password)
            
            if (!isPasswordCorrect) {
                const error = new Error('Password Incorrecto')
                return res.status(404).json({ error: error.message })
            }

            res.send('Autenticado')
        
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El Usuario no está registrado')
                return res.status(404).json({ error: error.message })
            }

            if (user.confirmed) {
                const error = new Error('El Usuario ya está confirmado')
                return res.status(403).json({ error: error.message })
            }

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Se envió un nuevo token a tu email')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error creando el usuario' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El Usuario no está registrado')
                return res.status(404).json({ error: error.message })
            }

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })
            res.send('Revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error creando el usuario' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                const error = new Error('Token no válido')
                return res.status(404).json({ error: error.message })
            }
            res.send('Toekn válido, Define tu nueva contraseña')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body
            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                const error = new Error('Token no válido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])

            res.send('El password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

}