import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [companyName, setCompanyName] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
const [jobTitle, setJobTitle] = useState('')
const [jobDescription, setJobDescription] = useState('')
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
        fetchJobs(customerData.id)
      }
    }

    getUser()
  }, [])

    const fetchJobs = async (customerId: string) => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('customer_id', customerId)

    if (data) setJobs(data)
  }

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
    setCompanyName('')
  }

  const createJob = async () => {
    if (!jobTitle) return alert('Enter job title')

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: jobTitle,
        description: jobDescription,
        customer_id: customer.id,
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      return
    }

    setJobs([...jobs, data])
    setJobTitle('')
    setJobDescription('')
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

      {/* If no company */}
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

          <hr />

          <h3>Create Job</h3>

          <input
            placeholder="Job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <br /><br />

          <textarea
            placeholder="Job description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <br /><br />

          <button onClick={createJob}>Create Job</button>

          <hr />

          <h3>Your Jobs</h3>

          {jobs.length === 0 && <p>No jobs yet.</p>}

          <ul>
            {jobs.map((job) => (
              <li key={job.id}>
                <strong>{job.title}</strong>
                <br />
                {job.description}
                <br /><br />
              </li>
            ))}
          </ul>
        </div>
      )}

      <br />
      <button onClick={logout}>Logout</button>
    </div>
  )
}