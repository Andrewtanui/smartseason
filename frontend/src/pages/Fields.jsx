import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const statusColors = { active: '#40916c', at_risk: '#e63946', completed: '#adb5bd' }
const stageColors = { planted: '#a8dadc', growing: '#57cc99', ready: '#f4a261', harvested: '#adb5bd' }

function Fields() {
  const [fields, setFields] = useState([])
  const [user, setUser] = useState(null)
  const [agents, setAgents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedField, setSelectedField] = useState(null)
  const [assignField, setAssignField] = useState(null)
  const [updateNote, setUpdateNote] = useState('')
  const [updateStage, setUpdateStage] = useState('')
  const [newField, setNewField] = useState({ name: '', crop_type: '', planting_date: '', stage: 'planted', agent_ids: [] })
  const [selectedAgentIds, setSelectedAgentIds] = useState([])
  const navigate = useNavigate()

  const fetchFields = () => api.get('/fields/').then(res => setFields(res.data))
  const fetchAgents = () => api.get('/users/').then(res => {
    setAgents(res.data.filter(u => u.role === 'agent'))
  })

  useEffect(() => {
    api.get('/users/me/').then(res => {
      setUser(res.data)
      if (res.data.role === 'admin') fetchAgents()
    })
    fetchFields()
  }, [])

  const handleCreateField = async (e) => {
    e.preventDefault()
    await api.post('/fields/', newField)
    setShowForm(false)
    setNewField({ name: '', crop_type: '', planting_date: '', stage: 'planted', agent_ids: [] })
    fetchFields()
  }

  const handleAddUpdate = async (e) => {
    e.preventDefault()
    await api.post(`/fields/${selectedField.id}/updates/`, { stage: updateStage, notes: updateNote })
    setSelectedField(null)
    setUpdateNote('')
    setUpdateStage('')
    fetchFields()
  }

  const handleAssignAgents = async (e) => {
    e.preventDefault()
    await api.post(`/fields/${assignField.id}/assign-agents/`, { agent_ids: selectedAgentIds })
    setAssignField(null)
    setSelectedAgentIds([])
    fetchFields()
  }

  const toggleAgentSelection = (agentId, isNewField = false) => {
    if (isNewField) {
      setNewField(prev => {
        const ids = prev.agent_ids.includes(agentId)
          ? prev.agent_ids.filter(id => id !== agentId)
          : [...prev.agent_ids, agentId]
        return { ...prev, agent_ids: ids }
      })
    } else {
      setSelectedAgentIds(prev => 
        prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
      )
    }
  }

  if (!user) return <p style={{ padding: '2rem' }}>Loading...</p>

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
          <h2 style={styles.pageTitle}>Fields</h2>
          {user.role === 'admin' && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Add Field'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreateField} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formCol}>
                <label style={styles.label}>Field Name</label>
                <input style={styles.input} placeholder="e.g. North Sector" value={newField.name} onChange={e => setNewField({...newField, name: e.target.value})} required />
                
                <label style={styles.label}>Crop Type</label>
                <input style={styles.input} placeholder="e.g. Maize" value={newField.crop_type} onChange={e => setNewField({...newField, crop_type: e.target.value})} required />
                
                <label style={styles.label}>Planting Date</label>
                <input style={styles.input} type="date" value={newField.planting_date} onChange={e => setNewField({...newField, planting_date: e.target.value})} required />
                
                <label style={styles.label}>Initial Stage</label>
                <select style={styles.input} value={newField.stage} onChange={e => setNewField({...newField, stage: e.target.value})}>
                  <option value="planted">Planted</option>
                  <option value="growing">Growing</option>
                  <option value="ready">Ready</option>
                  <option value="harvested">Harvested</option>
                </select>
              </div>
              
              <div style={styles.formCol}>
                <label style={styles.label}>Assign Agents</label>
                <div style={styles.agentSelector}>
                  {agents.map(agent => (
                    <div key={agent.id} style={styles.agentOption}>
                      <input 
                        type="checkbox" 
                        id={`new-agent-${agent.id}`}
                        checked={newField.agent_ids.includes(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id, true)}
                      />
                      <label htmlFor={`new-agent-${agent.id}`}>{agent.username}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button style={{...styles.addBtn, marginTop: '1rem'}} type="submit">Create Field</button>
          </form>
        )}

        <div style={styles.grid}>
          {fields.map(field => (
            <div key={field.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.fieldName}>{field.name}</h3>
                <span style={{...styles.badge, background: statusColors[field.status]}}>{field.status.replace('_', ' ')}</span>
              </div>
              <p style={styles.cropType}>{field.crop_type}</p>
              <div style={styles.cardDetails}>
                <span style={{...styles.stageBadge, background: stageColors[field.stage]}}>{field.stage}</span>
                <span style={styles.date}>Planted: {field.planting_date}</span>
              </div>
              
              <div style={styles.agentList}>
                <p style={styles.agentTitle}>Agents:</p>
                {field.agents.length > 0 ? (
                  <div style={styles.agentBadges}>
                    {field.agents.map(a => <span key={a.id} style={styles.miniBadge}>{a.username}</span>)}
                  </div>
                ) : <p style={styles.noAgents}>No agents assigned</p>}
              </div>

              {field.latest_update && (
                <p style={styles.lastUpdate}>Last update: {field.latest_update.notes || 'Stage changed'} — {new Date(field.latest_update.created_at).toLocaleDateString()}</p>
              )}
              
              <div style={styles.cardActions}>
                <button style={styles.updateBtn} onClick={() => { setSelectedField(field); setUpdateStage(field.stage) }}>
                  Add Update
                </button>
                {user.role === 'admin' && (
                  <button style={styles.assignBtn} onClick={() => { 
                    setAssignField(field); 
                    setSelectedAgentIds(field.agents.map(a => a.id));
                  }}>
                    Assign
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedField && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={{ marginBottom: '1rem' }}>Update: {selectedField.name}</h3>
              <form onSubmit={handleAddUpdate}>
                <select style={styles.input} value={updateStage} onChange={e => setUpdateStage(e.target.value)}>
                  <option value="planted">Planted</option>
                  <option value="growing">Growing</option>
                  <option value="ready">Ready</option>
                  <option value="harvested">Harvested</option>
                </select>
                <textarea style={{...styles.input, height: '80px', marginTop: '0.5rem'}} placeholder="Add notes or observations..." value={updateNote} onChange={e => setUpdateNote(e.target.value)} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button style={styles.addBtn} type="submit">Save Update</button>
                  <button style={styles.cancelBtn} type="button" onClick={() => setSelectedField(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {assignField && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={{ marginBottom: '1rem' }}>Assign Agents: {assignField.name}</h3>
              <form onSubmit={handleAssignAgents}>
                <div style={styles.agentSelectorModal}>
                  {agents.map(agent => (
                    <div key={agent.id} style={styles.agentOption}>
                      <input 
                        type="checkbox" 
                        id={`assign-agent-${agent.id}`}
                        checked={selectedAgentIds.includes(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                      />
                      <label htmlFor={`assign-agent-${agent.id}`}>{agent.username}</label>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button style={styles.addBtn} type="submit">Save Assignments</button>
                  <button style={styles.cancelBtn} type="button" onClick={() => setAssignField(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
  pageTitle: { fontSize: '1.5rem', color: '#1b4332' },
  addBtn: { background: '#2d6a4f', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' },
  cancelBtn: { background: '#ccc', color: '#333', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' },
  formCol: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', fontWeight: 'bold', color: '#2d6a4f' },
  input: { padding: '0.6rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', width: '100%' },
  agentSelector: { maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '0.5rem', borderRadius: '8px' },
  agentSelectorModal: { maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  agentOption: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  fieldName: { fontSize: '1.1rem', color: '#1b4332' },
  badge: { color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' },
  cropType: { color: '#666', marginBottom: '0.75rem' },
  cardDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  stageBadge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', color: '#333' },
  date: { fontSize: '0.8rem', color: '#888' },
  agentList: { marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '0.75rem' },
  agentTitle: { fontSize: '0.75rem', color: '#888', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  agentBadges: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  miniBadge: { background: '#f0f4f8', color: '#2d6a4f', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' },
  noAgents: { fontSize: '0.75rem', color: '#bbb', fontStyle: 'italic' },
  lastUpdate: { fontSize: '0.8rem', color: '#666', marginBottom: '1rem', fontStyle: 'italic', background: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' },
  cardActions: { marginTop: 'auto', display: 'flex', gap: '0.5rem' },
  updateBtn: { flex: 2, background: '#f0f4f8', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  assignBtn: { flex: 1, background: '#e9f5ee', border: '1px solid #2d6a4f', color: '#2d6a4f', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }
}

export default Fields