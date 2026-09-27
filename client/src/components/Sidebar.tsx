import React from 'react';
import { LayoutDashboard, BookOpen, History, Cpu, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  configInfo?: { evaluatorMode: string; aiConfigured: boolean };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, configInfo }) => {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-icon-box">
          <Cpu size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="brand-title">LLD Practice</span>
            <span className="brand-badge">MVP</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-link ${currentView === 'problems' || currentView === 'problem-details' ? 'active' : ''}`}
          onClick={() => onNavigate('problems')}
        >
          <BookOpen size={18} />
          <span>Practice Problems</span>
        </button>

        <button
          className={`nav-link ${currentView === 'attempts' ? 'active' : ''}`}
          onClick={() => onNavigate('attempts')}
        >
          <History size={18} />
          <span>Attempt History</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="evaluator-status-pill">
          <div className="status-dot" />
          <div>
            <div style={{ fontWeight: 600, color: '#f8fafc' }}>
              {configInfo?.evaluatorMode === 'ai' ? 'Gemini AI Evaluator' : 'Rule-Based Engine'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {configInfo?.aiConfigured ? 'API Connected' : 'Offline / Mock Active'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
