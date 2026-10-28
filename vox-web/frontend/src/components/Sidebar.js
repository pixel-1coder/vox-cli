import React from 'react';
import { ProviderItem, ModelItem, FilterStatus, ChevronLeft, ChevronRight, MessageSquare, Settings, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Filter, MessageSquare as MessageSquareIcon, Filter as FilterIcon } from 'lucide-react';

function Sidebar({
  currentProvider,
  currentModel,
  providers,
  models,
  unfilteredMode,
  onProviderChange,
  onModelChange,
  onToggleFilters,
  onClose,
  isOpen
}) {
  if (!isOpen) return null;

  const handleProviderClick = (providerId) => {
    onProviderChange(providerId);
  };

  const handleModelClick = (modelId) => {
    onModelClick(modelId);
  };

  const filterModels = (models, providerId) => {
    return models.filter(m => m.provider === providerId) || [];
  };

  const providerModels = models.filter(m => m.provider === currentProvider) || [];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">vox-web</span>
        <button className="sidebar-close" onClick={onClose}>
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="sidebar-section">
        <SectionTitle>Providers</SectionTitle>
        <div className="provider-list">
          {providers.map(provider => (
            <div
              key={provider.id}
              className={`provider-item ${currentProvider === provider.id ? 'active' : ''}`}
              onClick={() => onProviderChange(provider.id)}
            >
              <span>{provider.name}</span>
              {currentProvider === provider.id && <span className="active-indicator">●</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <SectionTitle>Models</SectionTitle>
        <div className="model-list">
          {providers.map(provider => {
            const providerModels = models.filter(m => m.provider === provider.id);
            if (providerModels.length === 0) return null;

            return (
              <div key={provider.id}>
                <div className="model-provider-label">{provider.name}</div>
                <div className="model-list">
                  {providerModels.map(model => (
                    <div
                      key={model.id}
                      className={`model-item ${currentModel === model.id ? 'active' : ''}`}
                      onClick={() => onModelChange(model.id)}
                    >
                      <span>{model.id}</span>
                      {model.pricing && model.pricing.prompt > 0 && (
                        <span className="model-pricing">${model.pricing.prompt}/1K</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section">
        <FilterStatus
          unfilteredMode={unfilteredMode}
          onClick={toggleFilters}
        />
      </div>
    </aside>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="sidebar-section-title">
      {children}
    </div>
  );
}

function ProviderItem({ provider, isActive, onClick }) {
  return (
    <button
      className={`provider-item ${provider.id === 'openrouter' ? 'openrouter' : ''} ${provider.id === 'ollama' ? 'ollama' : ''} ${provider.id === 'grok' ? 'grok' : ''}`}
      onClick={() => onClick(provider.id)}
      style={{
        background: 'transparent',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        color: 'var(--fg-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span>{provider.name}</span>
    </button>
  );
}

function ModelItem({ model, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(model.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--fg-secondary)',
        background: 'transparent',
        border: 'none',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <span>{model.id}</span>
      {model.pricing && model.pricing.prompt > 0 && (
        <span style={{
          fontSize: '10px',
          color: 'var(--fg-muted)',
          background: 'var(--bg-tertiary)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          ${model.pricing.prompt}/1K
        </span>
      )}
    </button>
  );
}

function FilterStatus({ unfilteredMode, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`filter-status ${unfilteredMode ? 'unfiltered' : 'censored'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        border: '1px solid',
      }}
    >
      <span style={{ fontSize: '14px' }}>
        {unfilteredMode ? '🔓' : '🔒'}
      </span>
      <span>{unfilteredMode ? 'UNFILTERED' : 'CENSORED'}</span>
    </button>
  );
}

function FilterStatus({ unfilteredMode, onClick }) {
  return (
    <div className={`filter-status ${unfilteredMode ? 'unfiltered' : 'censored'}`} onClick={onClick}>
      <span>{unfilteredMode ? '🔓 UNFILTERED' : '🔒 CENSORED'}</span>
    </div>
  );
}

export default Sidebar;