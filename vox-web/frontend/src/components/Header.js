import React from 'react';
import { Menu, X, ChevronDown, Send, Settings, Filter, MessageSquare, ChevronLeft, ChevronRight, Filter as FilterIcon, MessageSquare as MessageSquareIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

function Header({
  currentProvider,
  currentModel,
  providers,
  unfilteredMode,
  onProviderChange,
  onModelChange,
  onToggleFilters,
  onToggleSidebar,
  onToggleSettings,
  isSidebarOpen,
  isSettingsOpen,
  isLoading
}) {
  const [showProviderDropdown, setShowProviderDropdown] = React.useState(false);
  const [showModelDropdown, setShowModelDropdown] = React.useState(false);

  const providerModels = {
    openrouter: ['openrouter/cypher-alpha', 'openrouter/horizon-beta', 'google/gemini-2.0-flash-exp', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-405b'],
    ollama: ['llama3.1:8b', 'llama3.1:70b', 'codellama:34b', 'mistral:7b', 'codellama:13b'],
    grok: ['grok-2', 'grok-2-mini'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    llama-cpp: ['llama-3.1-8b', 'llama-3.1-70b', 'mistral-7b', 'codellama-34b'],
  };

  const currentProviderModels = providerModels[currentProvider] || [];
  const currentModelIndex = currentModel ? currentProviderModels.indexOf(currentModel) : -1;

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-btn" onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="header-center">
        <div className="header-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>vox-web</span>
        </div>
      </div>

      <div className="header-right">
        <div className="provider-selector">
          <button
            className="provider-trigger"
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            aria-haspopup="true"
            aria-expanded={showProviderDropdown}
          >
            <span>{currentProvider}</span>
            <ChevronDown size={16} />
          </button>
          {showProviderDropdown && (
            <div className="provider-dropdown">
              {['openrouter', 'ollama', 'grok', 'openai', 'anthropic', 'llama-cpp'].map(p => (
                <button
                  key={p}
                  className={`provider-option ${currentProvider === p ? 'active' : ''}`}
                  onClick={() => { onProviderChange(p); setShowProviderDropdown(false); }}
                >
                  <span>{p}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="model-badge {unfilteredMode ? 'unfiltered' : 'censored'}">
          <FilterIcon size={14} />
          <span>{unfilteredMode ? 'UNFILTERED' : 'CENSORED'}</span>
        </div>

        <button
          className={`filter-toggle ${unfilteredMode ? 'unfiltered' : 'censored'}`}
          onClick={() => window.dispatchEvent(new CustomEvent('toggleFilters'))}
          title={unfilteredMode ? 'Switch to Censored mode' : 'Switch to Unfiltered mode'}
        >
          <FilterIcon size={16} />
          <span>{unfilteredMode ? 'Unfiltered' : 'Censored'}</span>
        </button>

        <button
          className="header-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('toggleSettings'))}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;