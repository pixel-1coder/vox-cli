import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, ChevronDown, ChevronUp, Check, X, Send, Loader2, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon, Check as CheckIcon, X as XIcon, Send as SendIcon, Loader2 as Loader2Icon } from 'lucide-react';
import './ChatArea.css';

const codeTheme = vscDarkPlus;

const codeLanguages = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', cpp: 'cpp', c: 'c',
  cs: 'csharp', java: 'java', php: 'php', html: 'html', css: 'css',
  scss: 'scss', json: 'json', xml: 'xml', yaml: 'yaml', md: 'markdown',
  sh: 'bash', bash: 'bash', zsh: 'bash', ps1: 'powershell', sql: 'sql',
  dockerfile: 'docker', tf: 'hcl', hcl: 'hcl', toml: 'toml', ini: 'ini',
  txt: 'text', log: 'text', csv: 'csv',
};

function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const preRef = useRef(null);

  const language = className?.replace(/language-/, '') || 'text';
  const highlightedLang = codeLanguages[language] || language;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className={`code-block ${expanded ? '' : 'collapsed'}`}>
      <div className="code-header">
        <span className="code-language">{language}</span>
        <div className="code-actions">
          <button
            className="icon-btn"
            onClick={toggleExpand}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            className="icon-btn"
            onClick={handleCopy}
            title="Copy"
            disabled={copied}
          >
            {copied ? <Check size={14} className="copied" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={highlightedLang}
        style={codeTheme}
        showLineNumbers={true}
        lineNumberContainerStyle={{
          backgroundColor: '#1a1b26',
          borderRight: '1px solid #2d2d3f',
          paddingRight: '12px',
          marginRight: '8px',
        }}
        lineNumberStyle={{
          color: '#545c7e',
        }}
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            lineHeight: '1.6',
          },
        }}
        customStyle={{
          margin: 0,
          padding: expanded ? '16px 0' : 0,
          borderRadius: '0 0 8px 8px',
        }}
        wrapLines={false}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

function ComparisonBox({ title, left, right, leftLabel = 'Before', rightLabel = 'After' }) {
  return (
    <div className="comparison-box">
      <div className="comparison-header">
        <h4>{title}</h4>
      </div>
      <div className="comparison-content">
        <div className="comparison-column">
          <div className="comparison-label">{leftLabel}</div>
          <div className="comparison-code">{left}</div>
        </div>
        <div className="comparison-divider" />
        <div className="comparison-column">
          <div className="comparison-label">{rightLabel}</div>
          <div className="comparison-code">{right}</div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''} animate-fade-in`}>
      <div className="message-avatar">
        {isUser ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M8 21h16"></path>
            <path d="M12 17h10"></path>
          </svg>
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">{isUser ? 'You' : 'AI'}</span>
          <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="message-text">
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                if (inline) {
                  return <code className="inline-code">{children}</code>;
                }
                const classNameStr = node?.data?.language ? `language-${node.data.language}` : '';
                return <CodeBlock className={classNameStr}>{children}</CodeBlock>;
              },
              p: (props) => <p style={{ margin: '8px 0', lineHeight: 1.7 }}>{props.children}</p>,
              ul: (props) => <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>{props.children}</ul>,
              ol: (props) => <ol style={{ margin: '8px 0', paddingLeft: '24px' }}>{props.children}</ol>,
              blockquote: (props) => (
                <blockquote style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '12px', margin: '8px 0', color: 'var(--fg-secondary)', fontStyle: 'italic' }}>
                  {props.children}
                </blockquote>
              ),
              table: (props) => (
                <div style={{ overflowX: 'auto', margin: '12px 0' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>{props.children}</table>
                </div>
              ),
              th: (props) => <th style={{ border: '1px solid var(--border-color)', padding: '8px 12px', textAlign: 'left', background: 'var(--bg-tertiary)', fontWeight: 600 }}>{props.children}</th>,
              td: (props) => <td style={{ border: '1px solid var(--border-color)', padding: '8px 12px' }}>{props.children}</td>,
              tr: (props) => <tr>{props.children}</tr>,
              hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.isError && (
          <div className="error-badge">
            <span>⚠</span> Error occurred
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message assistant typing animate-fade-in">
      <div className="message-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M8 21h16"></path>
          <path d="M12 17h10"></path>
        </svg>
      </div>
      <div className="typing-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

function MessageInput({ onSend, disabled, placeholder = "Message..." }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled || !value.trim()) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend(value);
        setValue('');
      }
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{
          minHeight: '48px',
          maxHeight: '200px',
          resize: 'none',
        }}
      />
      <div className="input-actions">
        <button
          type="submit"
          className="send-btn"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}

function ChatArea({ messages, isLoading, onSendMessage, currentProvider, currentModel, unfilteredMode }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-status">
          <span className={`status-indicator ${unfilteredMode ? 'unfiltered' : 'censored'}`}></span>
          <span>{unfilteredMode ? 'Unfiltered' : 'Censored'}</span>
        </div>
        <div className="model-info">
          <span className="provider-badge">{currentProvider}</span>
          <span className="model-badge">{currentModel || 'Select model'}</span>
        </div>
      </div>

      <div className="messages-container" ref={containerRef}>
        {messages.map((msg, idx) => (
          <ChatMessage key={`${msg.role}-${msg.timestamp}-${idx}`} message={msg} index={idx} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <MessageInput onSend={onSendMessage} disabled={false} placeholder="Type a message..." />
      </div>
    </div>
  );
}

export default ChatArea;