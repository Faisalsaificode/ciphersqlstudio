import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { fetchAssignment, executeQuery, saveAttempt, submitAssignment, getProgress } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ResultsTable from '../components/ResultsTable';
import HintPanel from '../components/HintPanel';
import SampleDataViewer from '../components/SampleDataViewer';
import './AttemptPage.scss';

const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  renderLineHighlight: 'line',
  theme: 'ciphersql-dark',
  padding: { top: 16, bottom: 16 },
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
};

function registerCipherTheme(monaco) {
  monaco.editor.defineTheme('ciphersql-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.sql', foreground: 'f59e0b', fontStyle: 'bold' },
      { token: 'string.sql',  foreground: '22c55e' },
      { token: 'number',      foreground: '38bdf8' },
      { token: 'comment',     foreground: '4a5568', fontStyle: 'italic' },
      { token: 'operator',    foreground: 'e2e8f0' },
    ],
    colors: {
      'editor.background':        '#111524',
      'editor.foreground':        '#e2e8f0',
      'editor.lineHighlightBackground': '#181d30',
      'editorLineNumber.foreground':    '#4a5568',
      'editorLineNumber.activeForeground': '#8892a4',
      'editor.selectionBackground':   '#f59e0b28',
      'editorCursor.foreground':      '#f59e0b',
      'scrollbarSlider.background':   '#252a4088',
      'scrollbarSlider.hoverBackground': '#323857aa',
    }
  });
}

export default function AttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('-- Write your SQL query here\nSELECT ');
  const [results, setResults] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [activePanel, setActivePanel] = useState('schema');
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    fetchAssignment(id)
      .then(a => {
        setAssignment(a);
        setQuery(`-- ${a.title}\n-- Write your SQL query below\nSELECT `);
      })
      .catch(() => setError('Assignment not found.'))
      .finally(() => setLoading(false));

    // Check if user already completed this assignment
    if (user) {
      getProgress().then(ids => {
        if (ids.includes(id)) setIsCompleted(true);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleRun = async () => {
    if (!query.trim() || executing) return;
    setExecuting(true);
    setResults(null);
    setQueryError(null);
    setSubmitMsg('');

    try {
      const data = await executeQuery(id, query);
      setResults(data);
      if (user) saveAttempt(id, query, true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Execution failed.';
      setQueryError(msg);
      if (user) saveAttempt(id, query, false);
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!results || submitting) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const data = await submitAssignment(id, query);
      setIsCompleted(true);
      setSubmitMsg(data.alreadyCompleted ? 'Already submitted!' : '🎉 Assignment submitted successfully!');
    } catch (err) {
      setSubmitMsg('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  if (loading) return (
    <div className="attempt-page attempt-page--loading">
      <div className="spinner spinner--lg" />
      <span>Loading assignment...</span>
    </div>
  );

  if (error) return (
    <div className="attempt-page attempt-page--error">
      <div className="status status--error">{error}</div>
      <button className="btn btn--secondary" onClick={() => navigate('/')}>
        ← Back to Assignments
      </button>
    </div>
  );

  return (
    <div className="attempt-page" onKeyDown={handleKeyDown}>
      {/* Top bar */}
      <div className="attempt-page__topbar">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="attempt-page__title-group">
          <span className={`badge badge--${assignment.difficulty}`}>
            {assignment.difficulty}
          </span>
          <span className="badge badge--category">{assignment.category}</span>
          <h1 className="attempt-page__title">{assignment.title}</h1>
          {isCompleted && (
            <span className="attempt-page__completed-badge">✓ Completed</span>
          )}
        </div>
      </div>

      {/* Main workspace */}
      <div className="attempt-page__workspace">
        {/* Left: Question + Side panel */}
        <aside className="attempt-page__sidebar">
          <div className="question-panel">
            <div className="question-panel__header">📋 Problem Statement</div>
            <div className="question-panel__body">
              <p className="question-panel__question">{assignment.question}</p>

              {assignment.requirements?.length > 0 && (
                <div className="question-panel__requirements">
                  <div className="question-panel__req-label">Requirements</div>
                  <ul>
                    {assignment.requirements.map((r, i) => (
                      <li key={i}>
                        <span className="question-panel__req-check">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="attempt-page__panel-tabs">
            <button
              className={`attempt-page__panel-tab ${activePanel === 'schema' ? 'attempt-page__panel-tab--active' : ''}`}
              onClick={() => setActivePanel('schema')}
            >
              ▦ Schema & Data
            </button>
            <button
              className={`attempt-page__panel-tab ${activePanel === 'hints' ? 'attempt-page__panel-tab--active' : ''}`}
              onClick={() => setActivePanel('hints')}
            >
              💡 Hints
            </button>
          </div>

          {activePanel === 'schema' && (
            <SampleDataViewer sampleTables={assignment.sampleTables} />
          )}

          {activePanel === 'hints' && (
            <HintPanel assignmentId={id} userQuery={query} />
          )}
        </aside>

        {/* Right: Editor + Results */}
        <main className="attempt-page__main">
          <div className="editor-panel">
            <div className="editor-panel__header">
              <div className="editor-panel__title">
                <span className="editor-panel__dot editor-panel__dot--red" />
                <span className="editor-panel__dot editor-panel__dot--yellow" />
                <span className="editor-panel__dot editor-panel__dot--green" />
                <span className="editor-panel__label">query.sql</span>
              </div>
              <div className="editor-panel__actions">
                <span className="editor-panel__shortcut">⌘ Enter to run</span>
                <button
                  className={`btn btn--primary ${executing ? 'btn--loading' : ''}`}
                  onClick={handleRun}
                  disabled={executing}
                >
                  {!executing && (
                    <>▶ Run Query</>
                  )}
                </button>
              </div>
            </div>

            <div className="editor-panel__editor">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={v => setQuery(v || '')}
                options={EDITOR_OPTIONS}
                beforeMount={registerCipherTheme}
                theme="ciphersql-dark"
                onMount={editor => { editorRef.current = editor; }}
              />
            </div>
          </div>

          <div className="results-panel">
            <div className="results-panel__header">
              <span className="results-panel__title">Results</span>
              <div className="results-panel__header-right">
                {results && (
                  <span className="results-panel__badge">
                    {results.rowCount} rows
                  </span>
                )}
                {user && results && !isCompleted && (
                  <button
                    className={`btn btn--primary btn--sm ${submitting ? 'btn--loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {!submitting && '🏁 Submit Assignment'}
                  </button>
                )}
                {isCompleted && (
                  <span className="results-panel__submitted">✓ Submitted</span>
                )}
              </div>
            </div>
            {submitMsg && (
              <div className={`status ${submitMsg.includes('🎉') ? 'status--success' : submitMsg.includes('Already') ? 'status--info' : 'status--error'} results-panel__submit-msg`}>
                {submitMsg}
              </div>
            )}
            {!user && results && (
              <div className="status status--info results-panel__submit-msg">
                <a href="/login">Sign in</a> to submit this assignment.
              </div>
            )}
            <div className="results-panel__content">
              <ResultsTable
                columns={results?.columns}
                rows={results?.rows}
                rowCount={results?.rowCount}
                truncated={results?.truncated}
                error={queryError}
                isLoading={executing}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
