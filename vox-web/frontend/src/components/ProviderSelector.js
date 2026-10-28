import React, { useState } from 'react';
import { Check, X, ExternalLink, Globe, Server, Database, Zap, Lock, Unlock, ExternalLink as ExternalLinkIcon } from 'lucide-react';

const PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: '100+ models via single API',
    icon: Globe,
    color: '#6366f1',
    requiresAuth: true,
    authType: 'api-key',
    models: '100+',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local models, fully private',
    icon: Server,
    color: '#10b981',
    requiresAuth: false,
    authType: 'none',
    models: 'Local',
  },
  {
    id: 'grok',
    name: 'Grok (xAI)',
    description: 'Fast, uncensored models',
    icon: Zap,
    color: '#f59e0b',
    requiresAuth: true,
    authType: 'api-key',
    models: '2+',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini',
    icon: Globe,
    color: '#6366f1',
    requiresAuth: true,
    authType: 'api-key',
    models: '10+',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Opus',
    icon: Lock,
    color: '#8b5cf6',
    requiresAuth: true,
    authType: 'api-key',
    models: '5+',
  },
  {
    id: 'llama-cpp',
    name: 'llama.cpp',
    description: 'Local GGUF models',
    icon: Database,
    color: '#10b981',
    requiresAuth: false,
    authType: 'none',
    models: 'Local',
  },
];

function ProviderSelector({ currentProvider, onProviderChange, isOpen, onClose }) {
  const [hovered, setHovered] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="provider-selector-modal" onClick={onClose}>
      <div className="provider-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Provider</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="provider-grid">
          {PROVIDERS.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isActive={currentProvider === provider.id}
              onClick={() => onProviderChange(provider.id)}
              isHovered={hovered === provider.id}
              onMouseEnter={() => setHovered(provider.id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            Need API keys? Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">OpenRouter Keys</a>
            or <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Keys</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider, isActive, onClick, isHovered, onMouseEnter, onMouseLeave }) {
  const Icon = provider.icon;

  return (
    <button
      className={`provider-card ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={() => onClick(provider.id)}
      onMouseEnter={() => onMouseEnter(provider.id)}
      onMouseLeave={onMouseLeave}
      style={{
        borderColor: isActive ? 'var(--accent-primary)' : isHovered ? 'var(--accent-primary)' : 'var(--border-color)',
        background: isActive ? 'rgba(34, 211, 238, 0.1)' : isHovered ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      }}
    >
      <div className="provider-icon" style={{ color: provider.color }}>
        <provider.icon size={28} />
      </div>
      <div className="provider-info">
        <h4>{provider.name}</h4>
        <p className="provider-desc">{provider.description}</p>
        <div className="provider-meta">
          <span className="provider-models">
            <Database size={12} /> {provider.models}
          </span>
          {provider.requiresAuth && (
            <span className="auth-badge api-key">
              <Lock size={10} /> API Key
            </span>
          )}
          {!provider.requiresAuth && (
            <span className="auth-badge local">
              <Unlock size={10} /> Local
            </span>
          )}
        </div>
      </div>
      {isActive && <Check size={24} className="active-check" />}
    </button>
  );
}

export default ProviderSelector;