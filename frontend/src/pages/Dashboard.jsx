import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Dashboard() {
  const [data, setData] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/users/me/').then(res => setUser(res.data))
    api.get('/fields/dashboard/').then(res => setData(res.data))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  if (!data || !user) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SmartSeason</h1>
        <div style={styles.headerRight}>
          <span style={styles.userBadge}>{user.role === 'admin' ? 'Admin' : 'Field Agent'}: {user.username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Dashboard</h2>

        <div style={styles.statsRow}>
          <div style={{...styles.statCard, borderTop: '4px solid #2d6a4f'}}>
            <p style={styles.statNum}>{data.total_fields}</p>
            <p style={styles.statLabel}>Total Fields</p>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #40916c'}}>
            <p style={styles.statNum}>{data.status_breakdown.active}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #e63946'}}>
            <p style={styles.statNum}>{data.status_breakdown.at_risk}</p>
            <p style={styles.statLabel}>At Risk</p>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #adb5bd'}}>
            <p style={styles.statNum}>{data.status_breakdown.completed}</p>
            <p style={styles.statLabel}>Completed</p>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>Stage Breakdown</h3>
        <div style={styles.statsRow}>
          {Object.entries(data.stage_breakdown).map(([stage, count]) => (
            <div key={stage} style={styles.statCard}>
              <p style={styles.statNum}>{count}</p>
              <p style={styles.statLabel}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</p>
            </div>
          ))}
        </div>

        <div style={styles.actionRow}>
          <button style={styles.fieldsBtn} onClick={() => navigate('/fields')}>
            View All Fields
          </button>
          {user.role === 'admin' && (
            <button style={styles.agentsBtn} onClick={() => navigate('/agents')}>
              Manage Agents
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8' },
  header: { background: '#2d6a4f', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: '1.5rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userBadge: { background: '#40916c', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' },
  logoutBtn: { background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '8px' },
  content: { padding: '2rem' },
  pageTitle: { fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1b4332' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  statCard: { background: '#fff', padding: '1.5rem', borderRadius: '12px', minWidth: '140px', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  statNum: { fontSize: '2rem', fontWeight: 'bold', color: '#1b4332' },
  statLabel: { color: '#888', marginTop: '0.25rem' },
  sectionTitle: { fontSize: '1.1rem', marginBottom: '1rem', color: '#1b4332' },
  actionRow: { display: 'flex', gap: '1rem' },
  fieldsBtn: { background: '#2d6a4f', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  agentsBtn: { background: '#fff', color: '#2d6a4f', border: '1px solid #2d6a4f', padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }
}

export default Dashboard