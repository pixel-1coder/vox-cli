import React from 'react';
import { X, Save, Loader2, Lock, Unlock, Globe, Server, Zap, Database, ChevronDown, ChevronUp, Eye, EyeOff, Copy, Check } from 'lucide-react';

function SettingsPanel({ settings, onClose, onSettingsChange, currentProvider }) {
  const [expandedSections, setExpandedSections] = React.useState({
    general: true,
    providers: false,
    advanced: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSettingChange = (key, value) => {
    onSettingsChange({ [key]: value });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <button className="settings-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="settings-content">
        <SettingsSection
          title="General"
          icon={<MessageSquare size={18} />}
          expanded={expandedSections.general}
          onToggle={() => toggleSection('general')}
        >
          <SettingItem
            label="Temperature"
            description="Controls randomness (0 = deterministic, 1 = creative)"
            component={
              <div className="setting-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                />
                <span className="range-value">{settings.temperature}</span>
              </div>
            }
          />
          <SettingItem
            label="Max Tokens"
            description="Maximum tokens in response"
            component={
              <select
                value={settings.maxTokens}
                onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                className="settings-select"
              >
                <option value={1024}>1024</option>
                <option value={2048}>2048</option>
                <option value={4096}>4096</option>
                <option value={8192}>8192</option>
                <option value={16384}>16384</option>
                <option value={32768}>32768</option>
              </select>
            }
          />
          <SettingItem
            label="Stream Responses"
            description="Stream tokens as they arrive"
            component={
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.stream}
                  onChange={(e) => handleSettingChange('stream', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            }
          />
        </SettingsSection>

        <SettingsSection
          title="Providers"
          icon={<Globe size={18} />}
          expanded={expandedSections.providers}
          onToggle={() => toggleSection('providers')}
        >
          <div className="provider-settings">
            {[
              { id: 'openrouter', name: 'OpenRouter', icon: <Globe size={16} />, keyType: 'API Key', helpUrl: 'https://openrouter.ai/keys' },
              { id: 'openai', name: 'OpenAI', icon: <Globe size={16} />, keyType: 'API Key', helpUrl: 'https://platform.openai.com/api-keys' },
              { id: 'anthropic', name: 'Anthropic', icon: <Lock size={16} />, keyType: 'API Key', helpUrl: 'https://console.anthropic.com/settings/keys' },
              { id: 'grok', name: 'Grok (xAI)', icon: <Zap size={16} />, keyType: 'API Key', helpUrl: 'https://x.ai/api' },
              { id: 'ollama', name: 'Ollama', icon: <Server size={16} />, keyType: 'Local', helpUrl: 'https://ollama.ai' },
              { id: 'llama-cpp', name: 'llama.cpp', icon: <Database size={16} />, keyType: 'Local', helpUrl: 'https://github.com/ggerganov/llama.cpp' },
            ].map(provider => (
              <div key={provider.id} className="provider-config">
                <div className="provider-config-header">
                  <div className="provider-info">
                    <provider.icon size={20} style={{ color: 'var(--accent-primary)' }} />
                    <span>{provider.name}</span>
                  </div>
                  <span className="provider-status">{provider.id === 'ollama' || provider.id === 'llama-cpp' ? 'Local' : 'API Key'}</span>
                </div>
                <div className="provider-config-body">
                  <div className="input-group">
                    <label>{provider.keyType}</label>
                    <div className="input-with-copy">
                      <input
                        type="password"
                        placeholder={provider.id === 'ollama' || provider.id === 'llama-cpp' ? 'Not required (local)' : `Enter ${provider.keyType}`}
                        value={''}
                        onChange={(e) => console.log(`${provider.id} key changed`)}
                        onBlur={(e) => { /* save to config */ }}
                      />
                      <button className="copy-btn" onClick={() => copyToClipboard('')}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="provider-links">
                    <a href={provider.helpUrl} target="_blank" rel="noopener noreferrer">
                      Get API Key <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Advanced"
          icon={<Settings size={18} />}
          expanded={expandedSections.advanced}
          onToggle={() => toggleSection('advanced')}
        >
          <SettingItem
            label="System Prompt"
            description="Custom system prompt for all conversations"
            component={
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                rows={4}
                className="settings-textarea"
                placeholder="Enter custom system prompt..."
              />
            }
          />
          <SettingItem
            label="Unfiltered Mode"
            description="Disable safety filters for unrestricted responses"
            component={
              <label className="switch large">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={(e) => console.log('Unfiltered mode:', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            }
          />
        </SettingsSection>

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={() => { /* save all */ }}>
            <Save size={16} /> Save All Settings
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children, expanded, onToggle }) {
  return (
    <div className="settings-section">
      <button className="settings-section-header" onClick={onToggle}>
        <div className="section-title">
          {icon}
          <h3>{title}</h3>
        </div>
        <ChevronDown size={16} className={expanded ? 'expanded' : ''} />
      </button>
      {expanded && (
        <div className="settings-section-content animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function SettingItem({ label, description, component }) {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <label>{label}</label>
        {description && <p className="setting-description">{description}</p>}
      </div>
      <div className="setting-control">
        {component}
      </div>
    </div>
  );
}

export default SettingsPanel;