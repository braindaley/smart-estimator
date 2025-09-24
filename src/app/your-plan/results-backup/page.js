'use client';

// Absolute minimal version to test
export default function ResultsPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Results Page Test</h1>
      <div style={{ backgroundColor: 'green', color: 'white', padding: '10px', margin: '10px 0' }}>
        ✅ If you see this, the page is working!
      </div>
      <div style={{ backgroundColor: 'blue', color: 'white', padding: '10px' }}>
        Test timestamp: {new Date().toISOString()}
      </div>
    </div>
  );
}