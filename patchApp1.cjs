const fs = require('fs');
const file = 'App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Hook into initializeSession
code = code.replace(
  /const \{ messages, isLoading, sendMessage, handleAction \} = useA2UI\(\);/s,
  `const { messages, isLoading, sendMessage, handleAction, initializeSession } = useA2UI();`
);

// Add useEffect for initialization
const initEffect = `
  useEffect(() => {
    if (isMayaOpen && messages.length === 0) {
      initializeSession();
    }
  }, [isMayaOpen, messages.length, initializeSession]);
`;
code = code.replace(
  /  const audioPlayer = useAudioPlayer\(\);/,
  initEffect + '\n  const audioPlayer = useAudioPlayer();'
);

// Remove static welcome message
code = code.replace(
  /\{\/\* Welcome message \*\/\}.*?\{\/\* Messages list \*\/\}/s,
  `{/* Messages list */}`
);

// The actual comment in the file might not have "Messages list". Let's check what it has.
