import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export const getFirebaseAuth = () => {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Faltan credenciales de Firebase Admin en las variables de entorno')
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  }

  return getAuth()
}