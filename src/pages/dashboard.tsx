import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [companyName, setCompanyName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role)

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (customerData) {
        setCustomer(customerData)
      }
    }

    getUser()
  }, [])

  const createCustomer = async () => {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: companyName,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      return
    }

    setCustomer(data)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Role:</strong> {role}</p>

      {!customer ? (
        <div>
          <h3>Create Your Company</h3>
          <input
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <br /><br />
          <button onClick={createCustomer}>Create Company</button>
        </div>
      ) : (
        <div>
          <h3>Your Company:</h3>
          <p>{customer.name}</p>
        </div>
      )}

      <br />
      <button onClick={logout}>Logout</button>
    </div>
  )
}
