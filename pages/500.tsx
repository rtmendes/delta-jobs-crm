export default function Custom500() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#e5e7eb' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>500</h1>
      <p style={{ color: '#9ca3af' }}>Server error.</p>
      <a href="/" style={{ marginTop: '1.5rem', color: '#60a5fa' }}>← Back to dashboard</a>
    </div>
  )
}
