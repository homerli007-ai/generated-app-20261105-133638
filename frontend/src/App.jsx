import { useState } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const paths = input.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paths)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Safe File Deleter</h1>
      <p className="hint">One relative path per line. Symlinks, non-regular files, and paths outside allowed_root are refused.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="file1.txt\nsubdir/file2.log"
          rows={8}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Deleting...' : 'Delete Files'}
        </button>
      </form>
      {error && <div className="error">Error: {error}</div>}
      {result && (
        <div className="result">
          <h2>Deleted ({result.deleted.length})</h2>
          <ul>{result.deleted.map(p => <li key={p} className="ok">{p}</li>)}</ul>
          <h2>Errors ({result.errors.length})</h2>
          <ul>{result.errors.map((e, i) => <li key={i} className="err">{e.path}: {e.error}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
