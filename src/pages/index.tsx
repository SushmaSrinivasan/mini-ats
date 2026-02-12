import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const signUp = async () => {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    alert('Signup successful! You can now log in.')
    setLoading(false)
  }

  const signIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) alert(error.message)
  else router.push('/dashboard')
}

  return (
    <main style={{ padding: 40, maxWidth: 400 }}>
      <h1>Mini ATS</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <button onClick={signUp} disabled={loading}>
        {loading ? 'Signing up...' : 'Sign up'}
      </button>
      <button onClick={signIn}>Log in</button>
    </main>
  )
}
