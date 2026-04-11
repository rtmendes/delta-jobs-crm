import type { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e5e7eb',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
        {statusCode ?? 'Error'}
      </h1>
      <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>
        {statusCode === 404 ? 'Page not found' : 'An error occurred'}
      </p>
      <a href="/" style={{ marginTop: '1.5rem', color: '#60a5fa' }}>← Back to dashboard</a>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? (err as { statusCode?: number }).statusCode : 404
  return { statusCode }
}

export default Error
