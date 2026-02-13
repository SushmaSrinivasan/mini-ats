
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Candidate = {
  id: string
  name: string
  status: string
  job?: {
    title: string
  } | null
}

const STATUSES = ["Applied", "Interview", "Hired", "Rejected"]

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchCandidates()
    fetchJobs()
  }, [])

  async function fetchCandidates() {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        id,
        name,
        status,
        job:jobs!job_id (
          title
        )
      `)
      .returns<Candidate[]>()

    if (error) {
      console.error(error)
    } else {
      setCandidates(data ?? [])
    }

    setLoading(false)
  }

  async function fetchJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title")
      .returns<{ id: string; title: string }[]>()

    if (error) {
      console.error(error)
    } else {
      setJobs(data ?? [])
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("candidates")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchCandidates()
    }
  }

  async function createCandidate(
    name: string,
    jobId: string,
    status: string
  ) {
    const { error } = await supabase
      .from("candidates")
      .insert({
        name,
        job_id: jobId,
        status
      })

    if (error) {
      console.error(error)
    } else {
      setShowModal(false)
      fetchCandidates()
    }
  }

  function getCandidatesByStatus(status: string) {
    return candidates.filter((c) => c.status === status)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Kanban Board</h1>

      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "8px 12px",
          marginTop: 10,
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        Add Candidate
      </button>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {STATUSES.map((status) => (
          <div
            key={status}
            style={{
              background: "#f4f4f4",
              padding: 10,
              width: 250,
              borderRadius: 8
            }}
          >
            <h3>{status}</h3>

            {getCandidatesByStatus(status).map((candidate) => (
              <div
                key={candidate.id}
                style={{
                  background: "white",
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 6,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}
              >
                <strong>{candidate.name}</strong>

                {candidate.job && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "gray",
                      margin: "4px 0 8px 0"
                    }}
                  >
                    {candidate.job.title}
                  </p>
                )}

                <label style={{ fontSize: 12 }}>
                  Status
                  <select
                    value={candidate.status}
                    onChange={(e) =>
                      updateStatus(candidate.id, e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "4px",
                      borderRadius: "4px",
                      marginTop: "4px"
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showModal && (
        <AddCandidateModal
          jobs={jobs}
          onClose={() => setShowModal(false)}
          onCreate={createCandidate}
        />
      )}
    </div>
  )
}

function AddCandidateModal({
  jobs,
  onClose,
  onCreate
}: {
  jobs: any[]
  onClose: () => void
  onCreate: (name: string, jobId: string, status: string) => void
}) {
  const [name, setName] = useState("")
  const [jobId, setJobId] = useState("")
  const [status, setStatus] = useState("Applied")

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Add Candidate</h2>

        <input
          placeholder="Candidate name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <label htmlFor="job-select">Job</label>
<select
  id="job-select"
  value={jobId}
  onChange={(e) => setJobId(e.target.value)}
  style={inputStyle}
>
  <option value="">Select Job</option>
  {jobs.map((job) => (
    <option key={job.id} value={job.id}>
      {job.title}
    </option>
  ))}
</select>


        <label htmlFor="status-select">Status</label>
<select
  id="status-select"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  style={inputStyle}
>
  {STATUSES.map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
</select>

        <div style={{ marginTop: 15 }}>
          <button
            onClick={() => onCreate(name, jobId, status)}
            style={{ marginRight: 10 }}
          >
            Save
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const modalStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  width: 300
}

const inputStyle = {
  width: "100%",
  padding: "6px",
  marginTop: 10,
  borderRadius: 4
}
