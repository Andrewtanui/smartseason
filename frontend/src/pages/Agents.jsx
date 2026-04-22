import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Agents() {
  const [agents, setAgents] = useState([])
  const [user, setUser] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAgent, setNewAgent] = useState({ username: '', email: '', password: '' })
  const navigate = useNavigate()

  const fetchAgents = () => {
    api.get('/users/').then(res => {
      setAgents(res.data.filter(u => u.role === 'agent'))
    })
  }

  useEffect(() => {
    api.get('/users/me/').then(res => {
      setUser(res.data)
      if (res.data.role !== 'admin') navigate('/')
    })
    fetchAgents()
  }, [])

  const handleCreateAgent = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/create-agent/', newAgent)
      setShowAddForm(false)
      setNewAgent({ username: '', email: '', password: '' })
      fetchAgents()
    } catch (err) {
      alert('Error creating agent. Username might already exist.')
    }
  }

  if (!user || user.role !== 'admin') return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SmartSeason</h1>
        <div style={styles.headerRight}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>Dashboard</button>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login') }}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>Agent Management</h2>
          <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Agent'}
          </button>
        </div>
        
        {showAddForm && (
          <form onSubmit={handleCreateAgent} style={styles.addForm}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input 
                  style={styles.input} 
                  value={newAgent.username} 
                  onChange={e => setNewAgent({...newAgent, username: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input 
                  style={styles.input} 
                  type="email" 
                  value={newAgent.email} 
                  onChange={e => setNewAgent({...newAgent, email: e.target.value})} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input 
                  style={styles.input} 
                  type="password" 
                  value={newAgent.password} 
                  onChange={e => setNewAgent({...newAgent, password: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <button type="submit" style={{...styles.addBtn, marginTop: '1rem'}}>Create Agent Account</button>
          </form>
        )}
        
        <div style={styles.agentGrid}>
          {agents.map(agent => (
            <div key={agent.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.agentName}>{agent.username}</h3>
              </div>
              <p style={styles.email}>{agent.email}</p>
              
              <div style={styles.assignmentSection}>
                <p style={styles.sectionTitle}>Assigned Fields ({agent.assigned_fields.length}):</p>
                <div style={styles.fieldList}>
                  {agent.assigned_fields.length > 0 ? (
                    agent.assigned_fields.map(f => (
                      <span key={f.id} style={styles.fieldBadge}>{f.name}</span>
                    ))
                  ) : (
                    <span style={styles.noFields}>No fields assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8' },
  header: { background: '#2d6a4f', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: '1.5rem' },
  headerRight: { display: 'flex', gap: '1rem' },
  backBtn: { background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer' },
  content: { padding: '2rem' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.5rem', color: '#1b4332', margin: 0 },
  addBtn: { background: '#2d6a4f', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' },
  addForm: { background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  agentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  agentName: { fontSize: '1.2rem', color: '#1b4332' },
  statusBadge: { color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' },
  email: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem' },
  assignmentSection: { borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' },
  fieldList: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  fieldBadge: { background: '#e9f5ee', color: '#2d6a4f', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' },
  noFields: { fontSize: '0.8rem', color: '#bbb', fontStyle: 'italic' },
  input: { padding: '0.6rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }
}

export default Agents
