import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { debounce } from '../utils/resizeObserverFix';
import { API_BASE_URL } from '../utils/config';
import { authenticatedFetch } from '../utils/auth';

// Import the ResizeObserver fix
import '../utils/resizeObserverFix';

const CodeEditor = ({ roomId, bothUsersJoined }) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Welcome to the interview!\n// Write your solution here\n\nfunction solution() {\n    // Your code here\n    return null;\n}');
  const [theme, setTheme] = useState('vs-dark');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const editorRef = useRef(null);
  const [isUpdatingFromRemote, setIsUpdatingFromRemote] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'error'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'csharp', name: 'C#', icon: '🔷' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' }
  ];

  const themes = [
    { id: 'vs-dark', name: 'Dark', icon: '🌙' },
    { id: 'vs-light', name: 'Light', icon: '☀️' },
    { id: 'hc-black', name: 'High Contrast', icon: '⚫' }
  ];

  const defaultCodeTemplates = {
    javascript: '// Welcome to the interview!\n// Write your solution here\n\nfunction solution() {\n    // Your code here\n    return null;\n}',
    python: '# Welcome to the interview!\n# Write your solution here\n\ndef solution():\n    # Your code here\n    pass',
    java: '// Welcome to the interview!\n// Write your solution here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
    cpp: '// Welcome to the interview!\n// Write your solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
    csharp: '// Welcome to the interview!\n// Write your solution here\n\nusing System;\n\npublic class Solution {\n    public static void Main() {\n        // Your code here\n    }\n}',
    typescript: '// Welcome to the interview!\n// Write your solution here\n\nfunction solution(): any {\n    // Your code here\n    return null;\n}',
    go: '// Welcome to the interview!\n// Write your solution here\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    fmt.Println("Hello, World!")\n}',
    rust: '// Welcome to the interview!\n// Write your solution here\n\nfn main() {\n    // Your code here\n    println!("Hello, World!");\n}'
  };

  const handleEditorDidMount = (editor, monaco) => {
    console.log('Editor mounted successfully!');
    editorRef.current = editor;
    setEditorLoaded(true);
    setEditorError(false);
    
    // Set default code immediately when editor mounts
    const defaultCode = defaultCodeTemplates[language] || '// Welcome to the interview!\n// Write your solution here\n\nfunction solution() {\n    // Your code here\n    return null;\n}';
    
    // Always set default code on mount
    setCode(defaultCode);
    editor.setValue(defaultCode);
    
    console.log('Set default code:', defaultCode.substring(0, 50) + '...');
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true }
    });

    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality (you can implement auto-save here)
      console.log('Code saved!');
    });

    // Force layout after mount
    setTimeout(() => {
      try {
        editor.layout();
        console.log('Editor layout forced');
      } catch (error) {
        console.error('Layout error:', error);
      }
    }, 100);
  };

  const handleEditorError = (error) => {
    console.error('Monaco Editor error:', error);
    setEditorError(true);
    setEditorLoaded(false);
  };

  const handleLanguageChange = (newLanguage) => {
    console.log('Language changing to:', newLanguage);
    setLanguage(newLanguage);
    const newCode = defaultCodeTemplates[newLanguage] || '// Start coding here...';
    setCode(newCode);
    
    // Force editor to show new code
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
      console.log('Set new language code:', newCode.substring(0, 50) + '...');
    }
    
    // Sync language change to backend if in collaborative mode
    if (bothUsersJoined && roomId) {
      syncLanguageToBackend(newLanguage, newCode);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const runCode = async () => {
    try {
      setIsRunning(true);

      // Send code to Django backend for execution using authenticated fetch
      const response = await authenticatedFetch(`${API_BASE_URL}/api/code/execute/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language,
          code: code,
          input_data: '', // You can add an input field for this later
          room_id: window.location.pathname.split('/').pop() // Get room ID from URL
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const executionId = result.execution_id;

      // Poll for execution result
      const pollResult = async () => {
        try {
          const resultResponse = await authenticatedFetch(`${API_BASE_URL}/api/code/result/${executionId}/`);

          if (!resultResponse.ok) {
            throw new Error('Failed to get execution result');
          }

          const executionResult = await resultResponse.json();

          if (executionResult.status === 'completed' || executionResult.status === 'error' || executionResult.status === 'timeout') {
            setExecutionResult(executionResult);
            setShowResult(true);
            setIsRunning(false);
          } else {
            // Still running, poll again after 1 second
            setTimeout(pollResult, 1000);
          }
        } catch (error) {
          console.error('Error polling result:', error);
          setExecutionResult({
            status: 'error',
            error_output: 'Error getting execution result: ' + error.message
          });
          setShowResult(true);
          setIsRunning(false);
        }
      };

      // Start polling
      setTimeout(pollResult, 1000);

    } catch (error) {
      console.error('Error running code:', error);
      setExecutionResult({
        status: 'error',
        error_output: 'Error running code: ' + error.message
      });
      setShowResult(true);
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    const defaultCode = defaultCodeTemplates[language] || '// Start coding here...';
    setCode(defaultCode);
    if (editorRef.current) {
      editorRef.current.setValue(defaultCode);
    }
    console.log('Code reset to default');
  };

  // Simplified function to sync code to backend
  const syncCodeToBackend = useCallback(
    debounce(async (codeValue) => {
      if (!roomId || !bothUsersJoined || isUpdatingFromRemote) return;
      
      try {
        setSyncStatus('syncing');
        console.log('Syncing code to backend:', codeValue ? codeValue.substring(0, 50) + '...' : 'empty');
        
        const response = await authenticatedFetch(`${API_BASE_URL}/api/interviews/room-code/${roomId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code: codeValue || '',
            language: language 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to sync code`);
        }
        
        setSyncStatus('synced');
        console.log('✅ Code synced successfully');
        setLastSyncTime(new Date());
        
        // Reset status after a short delay
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        setSyncStatus('error');
        console.error('❌ Error syncing code:', error);
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }, 800),
    [roomId, bothUsersJoined, language, isUpdatingFromRemote]
  );

  // Simplified function to sync language change to backend
  const syncLanguageToBackend = useCallback(async (newLanguage, newCode) => {
    if (!roomId || !bothUsersJoined) return;
    
    try {
      console.log('Syncing language change to backend:', newLanguage);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/api/interviews/room-code/${roomId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: newCode || '',
          language: newLanguage 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to sync language`);
      }
      
      console.log('✅ Language synced successfully');
    } catch (error) {
      console.error('❌ Error syncing language:', error);
    }
  }, [roomId, bothUsersJoined]);

  // Simplified function to fetch shared code from backend
  const fetchSharedCode = useCallback(async () => {
    if (!roomId || !bothUsersJoined) return;
    
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/interviews/room-code/${roomId}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch code`);
      }
      
      const data = await response.json();
      console.log('📥 Fetched shared code from backend');
      
      // Update if there's different code or language
      if (data.code !== undefined && data.code !== code) {
        console.log('🔄 Updating code from remote');
        setPartnerTyping(true);
        setIsUpdatingFromRemote(true);
        setCode(data.code);
        
        if (editorRef.current) {
          editorRef.current.setValue(data.code);
        }
        
        setLastSyncTime(new Date());
        
        setTimeout(() => {
          setIsUpdatingFromRemote(false);
          setPartnerTyping(false);
        }, 500);
      }
      
      if (data.language && data.language !== language) {
        console.log('🔄 Updating language from remote:', data.language);
        setLanguage(data.language);
      }
      
    } catch (error) {
      console.error('❌ Error fetching shared code:', error);
    }
  }, [roomId, bothUsersJoined, code, language]);

  // Simplified handle code changes with immediate sync
  const handleCodeChange = useCallback((value) => {
    if (isUpdatingFromRemote) return;
    
    console.log('📝 Code changed by user');
    setCode(value || '');
    
    // Sync to backend immediately for all changes when both users are present
    if (bothUsersJoined && roomId) {
      syncCodeToBackend(value || '');
    }
  }, [bothUsersJoined, roomId, syncCodeToBackend, isUpdatingFromRemote]);

  // Initialize default code when component mounts or language changes
  useEffect(() => {
    const defaultCode = defaultCodeTemplates[language] || '// Welcome to the interview!\n// Write your solution here\n\nfunction solution() {\n    // Your code here\n    return null;\n}';
    
    console.log('Setting default code for language:', language);
    
    // Set default template immediately
    setCode(defaultCode);
    
    // Also set it in the editor if mounted
    if (editorRef.current) {
      editorRef.current.setValue(defaultCode);
      console.log('Set default code in editor');
    }
  }, [language]);

  // Manual resize handling to prevent ResizeObserver issues
  useEffect(() => {
    const handleResize = debounce(() => {
      if (editorRef.current) {
        try {
          editorRef.current.layout();
        } catch (error) {
          // Silently handle layout errors
        }
      }
    }, 100);

    window.addEventListener('resize', handleResize);
    
    // Initial layout after a short delay
    const timeoutId = setTimeout(() => {
      if (editorRef.current) {
        try {
          editorRef.current.layout();
        } catch (error) {
          // Silently handle layout errors
        }
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Simplified polling for collaborative code changes
  useEffect(() => {
    if (!roomId || !bothUsersJoined) return;

    console.log('🔄 Starting code sync polling for room:', roomId);
    
    const interval = setInterval(() => {
      fetchSharedCode();
    }, 1500); // Poll every 1.5 seconds for faster sync

    return () => {
      console.log('🛑 Stopping code sync polling');
      clearInterval(interval);
    };
  }, [roomId, bothUsersJoined, fetchSharedCode]);

  // Force refresh editor content when both users join
  useEffect(() => {
    if (bothUsersJoined && editorRef.current) {
      // Force editor to refresh
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.layout();
          // Ensure default template is shown
          const currentValue = editorRef.current.getValue();
          if (!currentValue || currentValue.trim() === '') {
            const defaultCode = defaultCodeTemplates[language] || '// Welcome to the interview!\n// Write your solution here\n\nfunction solution() {\n    // Your code here\n    return null;\n}';
            setCode(defaultCode);
            editorRef.current.setValue(defaultCode);
          }
        }
      }, 500);
    }
  }, [bothUsersJoined, language]);
  
  // Error boundary for Monaco Editor
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && (
        event.error.message?.includes('Monaco') ||
        event.error.message?.includes('editor') ||
        event.error.stack?.includes('monaco')
      )) {
        console.error('Monaco Editor error caught:', event.error);
        setEditorError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('Monaco') || event.reason?.message?.includes('editor')) {
        console.error('Monaco Editor promise rejection:', event.reason);
        setEditorError(true);
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  // Debug effect to check if editor is working
  useEffect(() => {
    console.log('CodeEditor state:', { 
      code: code.substring(0, 50) + '...', 
      language, 
      roomId, 
      bothUsersJoined,
      editorMounted: !!editorRef.current,
      editorLoaded,
      editorError
    });
  }, [code, language, roomId, bothUsersJoined, editorLoaded, editorError]);

  // Retry mechanism for failed editor
  const retryEditor = () => {
    setEditorError(false);
    setEditorLoaded(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Editor Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          {/* Language Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {themes.map((themeOption) => (
                <option key={themeOption.id} value={themeOption.id}>
                  {themeOption.icon} {themeOption.name}
                </option>
              ))}
            </select>

            {/* Sync Status Indicator */}
            {bothUsersJoined && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  partnerTyping ? 'bg-blue-500 animate-bounce' :
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  syncStatus === 'synced' ? 'bg-green-500' :
                  syncStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="text-xs text-gray-300">
                  {partnerTyping ? 'Partner typing...' :
                   syncStatus === 'syncing' ? 'Syncing...' :
                   syncStatus === 'synced' ? 'Synced' :
                   syncStatus === 'error' ? 'Sync Error' :
                   'Live Sync'}
                </span>
                {lastSyncTime && (
                  <span className="text-xs text-gray-400">
                    {lastSyncTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={formatCode}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              title="Format Code (Ctrl+Shift+F)"
            >
              Format
            </button>
            <button
              onClick={resetCode}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
              title="Reset Code"
            >
              Reset
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                isRunning 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              title="Run Code"
            >
              {isRunning ? '⏳ Running...' : '▶ Run'}
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        {editorError ? (
          // Fallback editor
          <div className="h-full bg-gray-900 text-white">
            <div className="p-4 bg-yellow-600 text-black flex items-center justify-between">
              <span>⚠️ Monaco Editor failed to load. Using fallback editor.</span>
              <button
                onClick={retryEditor}
                className="bg-yellow-800 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                Retry Monaco Editor
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full bg-gray-900 text-white p-4 font-mono text-sm resize-none border-0 outline-0"
              style={{ 
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                height: 'calc(100% - 60px)' // Account for the error banner
              }}
              placeholder="Write your code here..."
            />
          </div>
        ) : (
          <Editor
            height="100%"
            language={language}
            value={code}
            theme={theme}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            onValidate={(markers) => {
              // Handle validation errors
              if (markers.length > 0) {
                console.log('Editor validation markers:', markers);
              }
            }}
            loading={
              <div className="flex items-center justify-center h-full text-white bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <div>Loading Monaco Editor...</div>
                </div>
              </div>
            }
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
              glyphMargin: true,
              folding: true,
              lineDecorationsWidth: 20,
              lineNumbersMinChars: 3,
              renderLineHighlight: 'all',
              fontSize: 14,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false
              },
              minimap: {
                enabled: true,
                side: 'right'
              },
              contextmenu: true,
              mouseWheelZoom: true,
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: true,
              parameterHints: {
                enabled: true
              },
              bracketPairColorization: { 
                enabled: true 
              }
            }}
          />
        )}
      </div>

      {/* Editor Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Language: {languages.find(l => l.id === language)?.name}</span>
            <span>Theme: {themes.find(t => t.id === theme)?.name}</span>
            {bothUsersJoined && (
              <span className="text-green-400">🤝 Collaborative Mode</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Ln 1, Col 1</span>
            <span>UTF-8</span>
            <span>Spaces: 2</span>
            {bothUsersJoined && lastSyncTime && (
              <span className="text-blue-400">
                Last sync: {lastSyncTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Execution Result Modal */}
      {showResult && executionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Execution Result</h3>
              <button 
                onClick={() => setShowResult(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  executionResult.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {executionResult.status}
                </span>
              </div>
              {executionResult.execution_time && (
                <div><strong>Execution Time:</strong> {executionResult.execution_time}s</div>
              )}
              {executionResult.memory_usage && (
                <div><strong>Memory Usage:</strong> {executionResult.memory_usage} MB</div>
              )}
              {executionResult.output && (
                <div>
                  <strong>Output:</strong>
                  <pre className="bg-gray-100 p-3 rounded mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                    {executionResult.output}
                  </pre>
                </div>
              )}
              {executionResult.error_output && (
                <div>
                  <strong>Error:</strong>
                  <pre className="bg-red-100 p-3 rounded mt-2 whitespace-pre-wrap text-red-800 overflow-auto max-h-32">
                    {executionResult.error_output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
