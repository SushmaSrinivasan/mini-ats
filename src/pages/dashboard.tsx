import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [customer, setCustomer] = useState<any>(null)

  const [companyName, setCompanyName] = useState('')
  const [jobs, setJobs] = useState<any[]>([])

  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [candidateInputs, setCandidateInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role || null)

      // Get company
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

    init()
  }, [])

  const fetchJobs = async (customerId: string) => {
    const { data } = await supabase
      .from('jobs')
      .select(`
        *,
        candidates (*)
      `)
      .eq('customer_id', customerId)

    if (data) setJobs(data)
  }

  const createCustomer = async () => {
    if (!companyName) return alert('Enter company name')

    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: companyName,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) return alert(error.message)

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

    if (error) return alert(error.message)

    setJobs([...jobs, { ...data, candidates: [] }])
    setJobTitle('')
    setJobDescription('')
  }

  const createCandidate = async (jobId: string) => {
    const name = candidateInputs[jobId]
    if (!name) return alert('Enter candidate name')

    const { error } = await supabase
      .from('candidates')
      .insert({
        job_id: jobId,
        name,
        status: 'Applied',
      })

    if (error) return alert(error.message)

    setCandidateInputs({
      ...candidateInputs,
      [jobId]: '',
    })

    fetchJobs(customer.id)
  }

  const updateStatus = async (candidateId: string, status: string) => {
    await supabase
      .from('candidates')
      .update({ status })
      .eq('id', candidateId)

    fetchJobs(customer.id)
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
          <h3>Create Company</h3>
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
          <h3>Company: {customer.name}</h3>

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

          {jobs.map((job) => (
            <div key={job.id} style={{ marginBottom: 30 }}>
              <h4>{job.title}</h4>
              <p>{job.description}</p>

              <input
                placeholder="Candidate name"
                value={candidateInputs[job.id] || ''}
                onChange={(e) =>
                  setCandidateInputs({
                    ...candidateInputs,
                    [job.id]: e.target.value,
                  })
                }
              />

              <button onClick={() => createCandidate(job.id)}>
                Add Candidate
              </button>

              <ul>
                {job.candidates?.map((candidate: any) => (
                  <li key={candidate.id}>
                    {candidate.name} — 
                    <select
                      value={candidate.status}
                      onChange={(e) =>
                        updateStatus(candidate.id, e.target.value)
                      }
                    >
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Hired</option>
                      <option>Rejected</option>
                    </select>
                  </li>
                ))}
              </ul>

              <hr />
            </div>
          ))}
        </div>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  )
}
