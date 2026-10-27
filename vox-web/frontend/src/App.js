import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from './store';
import ChatArea from './components/ChatArea';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ModelSelector from './components/ModelSelector';
import ProviderSelector from './components/ProviderSelector';
import SettingsPanel from './components/SettingsPanel';
import { Users, MessageSquare, Settings, ChevronLeft, Menu, X, Server, Globe } from 'lucide-react';
import './App.css';

function App() {
  const {
    // State
    messages,
    currentProvider,
    currentModel,
    providers,
    models,
    isLoading,
    isSidebarOpen,
    isSettingsOpen,
    unfilteredMode,
    settings,
    // Actions
    setMessages,
    addMessage,
    setCurrentProvider,
    setCurrentModel,
    setProviders,
    setModels,
    setLoading,
    toggleSidebar,
    toggleSettings,
    toggleUnfiltered,
    setSettings,
    sendMessage,
    fetchModels,
    switchModel,
    fetchProviders,
  } = useStore();

  // Initialize on mount
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Fetch models when provider changes
  useEffect(() => {
    if (currentProvider) {
      fetchModels(currentProvider);
    }
  }, [currentProvider, fetchModels]);

  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;
    await sendMessage(content);
  }, [sendMessage, isLoading]);

  const handleProviderChange = useCallback(async (providerId) => {
    setCurrentProvider(providerId);
  }, [setCurrentProvider]);

  const handleModelChange = useCallback(async (modelId) => {
    setCurrentModel(modelId);
  }, [setCurrentModel]);

  const toggleFilter = useCallback(() => {
    toggleUnfiltered();
  }, [toggleUnfiltered]);

  return (
    <div className="app">
      {/* Header */}
      <Header
        currentProvider={currentProvider}
        currentModel={currentModel}
        providers={providers}
        unfilteredMode={unfilteredMode}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
        onToggleFilters={toggleFilter}
        onToggleSidebar={toggleSidebar}
        onToggleSettings={toggleSettings}
        isSidebarOpen={isSidebarOpen}
        isSettingsOpen={isSettingsOpen}
      />

      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar
            currentProvider={currentProvider}
            currentModel={currentModel}
            providers={providers}
            models={models}
            unfilteredMode={unfilteredMode}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onToggleFilters={toggleFilter}
            onClose={toggleSidebar}
            unfilteredMode={unfilteredMode}
          />
        </aside>

        {/* Main Chat Area */}
        <main className="main-content">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            currentProvider={currentProvider}
            currentModel={currentModel}
            unfilteredMode={unfilteredMode}
          />
        </main>

        {/* Settings Panel */}
        {isSettingsOpen && (
          <SettingsPanel
            settings={settings}
            onClose={toggleSettings}
            onSettingsChange={setSettings}
          />
        )}

        {/* Mobile overlay */}
        {(isSidebarOpen || isSettingsOpen) && (
          <div
            className="mobile-overlay"
            onClick={() => { toggleSidebar(false); toggleSettings(false); }}
          />
        )}
      </div>
    </div>
  );
}

export default App;