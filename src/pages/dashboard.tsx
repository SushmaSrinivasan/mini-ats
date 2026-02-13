import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Candidate = {
  id: string
  name: string
  status: string
}

const STATUSES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
]

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
  }, [])

  async function fetchCandidates() {
    const { data, error } = await supabase
      .from("candidates")
      .select("id, name, status")

    if (error) {
      console.error(error)
    } else {
      setCandidates(data || [])
    }

    setLoading(false)
  }

  function getCandidatesByStatus(status: string) {
    return candidates.filter((c) => c.status === status)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Kanban Board</h1>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {STATUSES.map((status) => (
          <div
            key={status}
            style={{
              background: "#f4f4f4",
              padding: 10,
              width: 250,
              borderRadius: 8,
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
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                {candidate.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
