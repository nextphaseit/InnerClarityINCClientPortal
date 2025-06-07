"use client"

import { useEffect, useState } from "react"

const DashboardPage = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Replace with your actual data fetching logic
        const response = await fetch("/api/admin/data") // Example API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const jsonData = await response.json()
        setData(jsonData)
      } catch (e: any) {
        setError(e.message || "An error occurred while fetching data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading dashboard data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!data) {
    return <div>No data available.</div>
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {Object.keys(data).length > 0 ? (
        <ul>
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {JSON.stringify(value)}
            </li>
          ))}
        </ul>
      ) : (
        <div>No data to display.</div>
      )}
    </div>
  )
}

export default DashboardPage
