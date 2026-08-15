'use client'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '685809250674-bnqkpu84bjk8et5r1pa04o4dt06ujl0k.apps.googleusercontent.com'

export default function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}
