const fs = require('fs');
const file = 'src/hooks/useA2UI.ts';
let code = fs.readFileSync(file, 'utf8');

// Insert initializeSession method
const initCode = `
  const initializeSession = useCallback(async () => {
    if (state.messages.length === 0) {
      await handleSendMessage("INIT_SESSION_SILENT");
    }
  }, [state.messages.length, handleSendMessage]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage: handleSendMessage,
    handleAction,
    resetConversation,
    initializeSession,
  };
`;
code = code.replace(/return \{\s*messages: state\.messages,[\s\S]*resetConversation,\s*\};\s*\}/, initCode + '}');

fs.writeFileSync(file, code, 'utf8');
console.log('useA2UI updated');
