import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailsPage } from './pages/ProblemDetailsPage';
import { EditorPage } from './pages/EditorPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { AttemptsPage } from './pages/AttemptsPage';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [configInfo, setConfigInfo] = useState<{ evaluatorMode: string; aiConfigured: boolean } | undefined>(undefined);

  // Sync with browser hash routing
  useEffect(() => {
    function parseHash() {
      const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
      const parts = hash.split('/');
      const view = parts[0];
      const param = parts[1];

      if (['dashboard', 'problems', 'problem-details', 'editor', 'evaluation', 'attempts'].includes(view)) {
        setCurrentView(view);
        setViewParam(param);
      } else {
        setCurrentView('dashboard');
        setViewParam(undefined);
      }
    }

    parseHash();
    window.addEventListener('hashchange', parseHash);

    // Fetch evaluator config
    api.getConfig().then(cfg => {
      setConfigInfo({
        evaluatorMode: cfg.evaluatorMode,
        aiConfigured: cfg.aiConfigured
      });
    }).catch(err => console.warn('Could not load backend config', err));

    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setViewParam(id);
    if (id) {
      window.location.hash = `#${view}/${id}`;
    } else {
      window.location.hash = `#${view}`;
    }
    window.scrollTo(0, 0);
  };

  const isEditorView = currentView === 'editor';

  return (
    <div className="app-container">
      {/* Sidebar hidden in editor view for distraction-free 2-column workspace */}
      {!isEditorView && (
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          configInfo={configInfo}
        />
      )}

      <main className="main-wrapper" style={{ width: isEditorView ? '100vw' : undefined }}>
        {currentView === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentView === 'problems' && <ProblemsPage onNavigate={handleNavigate} />}
        {currentView === 'problem-details' && viewParam && (
          <ProblemDetailsPage problemId={viewParam} onNavigate={handleNavigate} />
        )}
        {currentView === 'editor' && viewParam && (
          <EditorPage attemptId={viewParam} onNavigate={handleNavigate} />
        )}
        {currentView === 'evaluation' && viewParam && (
          <EvaluationPage attemptId={viewParam} onNavigate={handleNavigate} />
        )}
        {currentView === 'attempts' && <AttemptsPage onNavigate={handleNavigate} />}
      </main>
    </div>
  );
};

export default App;
