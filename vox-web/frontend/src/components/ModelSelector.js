import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, Zap, Lock, Unlock, DollarSign, Tag, Search, X } from 'lucide-react';

function ModelSelector({
  currentModel,
  models,
  currentProvider,
  onModelChange,
  onClose,
  isOpen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Models', icon: null },
    { id: 'free', label: 'Free', icon: <Tag size={14} /> },
    { id: 'free-uncensored', label: 'Free Uncensored', icon: <Unlock size={14} /> },
    { id: 'paid', label: 'Paid', icon: <DollarSign size={14} /> },
    { id: 'uncensored', label: 'Uncensored', icon: <Zap size={14} />,
  ];

  const filterModels = (models) => {
    let filtered = models.filter(m => m.provider === currentProvider);

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    switch (selectedCategory) {
      case 'free':
        filtered = filtered.filter(m => m.pricing?.prompt === 0 || m.pricing?.prompt === '0' || !m.pricing);
        break;
      case 'paid':
        filtered = filtered.filter(m => m.pricing && m.pricing.prompt > 0);
        break;
      case 'free-uncensored':
        filtered = filtered.filter(m =>
          (m.pricing?.prompt === 0 || m.pricing?.prompt === '0' || !m.pricing) &&
          (m.id.toLowerCase().includes('uncensored') ||
           m.id.toLowerCase().includes('unfiltered') ||
           m.id.toLowerCase().includes('dolphin') ||
           m.id.toLowerCase().includes('wizard') ||
           m.id.toLowerCase().includes('nemotron') ||
           m.id.toLowerCase().includes('deepseek'))
        );
        break;
      case 'uncensored':
        filtered = filtered.filter(m =>
          m.id.toLowerCase().includes('uncensored') ||
          m.id.toLowerCase().includes('unfiltered') ||
          m.id.toLowerCase().includes('dolphin') ||
          m.id.toLowerCase().includes('wizard') ||
          m.id.toLowerCase().includes('nemotron') ||
          m.id.toLowerCase().includes('deepseek') ||
          m.id.toLowerCase().includes('phind') ||
          m.id.toLowerCase().includes('code-llama') ||
          m.id.toLowerCase().includes('unrestricted')
        );
        break;
    }

    return filtered;
  };

  const filteredModels = filterModels(models);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const closeDropdown = () => setShowDropdown(false);

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <div className="model-selector-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-search">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(cat.id); }}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="model-list">
        {filteredModels.length === 0 ? (
          <div className="no-models">No models found</div>
        ) : (
          <div className="models-grid">
            {filteredModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                isCurrent={false}
                onSelect={() => { onModelChange(model.id); closeDropdown(); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModelCard({ model, isCurrent, onSelect }) {
  const isFree = !model.pricing || model.pricing?.prompt === 0 || model.pricing?.prompt === '0';
  const isUncensored = model.id.toLowerCase().includes('uncensored') ||
    model.id.toLowerCase().includes('unfiltered') ||
    model.id.toLowerCase().includes('dolphin') ||
    model.id.toLowerCase().includes('wizard') ||
    model.id.toLowerCase().includes('nemotron') ||
    model.id.toLowerCase().includes('deepseek');

  return (
    <button
      onClick={onSelect}
      className={`model-card ${isCurrent ? 'current' : ''}`}
    >
      <div className="model-header">
        <span className="model-name">{model.id}</span>
        <div className="model-badges">
          {model.pricing && model.pricing.prompt > 0 && (
            <span className="badge paid">${model.pricing.prompt}/1K</span>
          )}
          {!model.pricing || model.pricing?.prompt === 0 || model.pricing?.prompt === '0' ? (
            <span className="badge free">FREE</span>
          ) : null}
          {model.id.toLowerCase().includes('uncensored') || model.id.toLowerCase().includes('unfiltered') ? (
            <span className="badge uncensored">UNCENSORED</span>
          ) : null}
        </div>
      </div>
      {model.description && (
        <div className="model-description">{model.description}</div>
      )}
      <div className="model-meta">
        {model.context_length && <span>{model.context_length} ctx</span>}
        <span>{model.provider}</span>
      </div>
    </button>
  );
}

export default ModelSelector;