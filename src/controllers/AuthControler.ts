import { Request, Response } from 'express';
import User from '../models/User';
import Token from '../models/Token';
import { hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';

export class AuthController {
    static createAccount = async (req:Request, res:Response) => {
        try {
            const { password, email } = req.body
            // Prevenir duplicados
            console.log(password, email);
            
            const userExists = await User.findOne({email})
            if (userExists) {
                const error = new Error('El email ingresado ya se encuentra registrado')
                return res.status(409).json({error: error.message})
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
                name: user.email,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()]) 
            res.send('Cuenta creada exitosamente, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error creando el usuario'})
        }      
    }
}