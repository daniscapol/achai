import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Link,
  Code,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null);

  // Execute formatting command
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Format text with specific tag
  const formatBlock = (tag) => {
    execCommand('formatBlock', tag);
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Handle paste to clean up formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Toolbar buttons configuration
  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { divider: true },
    { icon: Heading2, command: () => formatBlock('h2'), title: 'Heading 2' },
    { icon: Heading3, command: () => formatBlock('h3'), title: 'Heading 3' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: Quote, command: () => formatBlock('blockquote'), title: 'Quote' },
    { icon: Code, command: () => formatBlock('pre'), title: 'Code Block' },
    { icon: Link, command: insertLink, title: 'Insert Link' },
    { divider: true },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' }
  ];

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800">
      {/* Toolbar */}
      <div className="border-b border-zinc-700 bg-zinc-900 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.divider) {
            return <div key={index} className="w-px h-6 bg-zinc-700 mx-1" />;
          }

          const Icon = button.icon;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (typeof button.command === 'function') {
                  button.command();
                } else {
                  execCommand(button.command);
                }
              }}
              className="h-8 w-8 p-0 hover:bg-zinc-700"
              title={button.title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 text-gray-200 focus:outline-none prose prose-invert max-w-none"
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          // Prose styles for the editor
          lineHeight: '1.75',
          fontSize: '16px'
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
          position: absolute;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        [contenteditable] p {
          margin-bottom: 1rem;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        [contenteditable] li {
          margin-bottom: 0.25rem;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #9ca3af;
        }
        
        [contenteditable] pre {
          background-color: #18181b;
          border: 1px solid #27272a;
          border-radius: 0.375rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        [contenteditable] a {
          color: #818cf8;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #a78bfa;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;