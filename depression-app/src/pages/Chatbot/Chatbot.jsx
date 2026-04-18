import React, { useEffect, useRef, useState } from 'react';
import { Comment } from 'react-loader-spinner';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import WellnessPage from '../../components/wellness/WellnessPage';
import { getResponse } from '../../services/Api';
import './Chatbot.css';

const initialGreeting = {
  chatbot: 'Hello. I am your wellness companion. You can talk to me about stress, mood, anxiety, overthinking, or just how your day is going.',
};

const starterPrompts = [
  'I have been feeling stressed lately',
  'I keep overthinking everything',
  'I feel low and do not know why',
  'Can you help me calm down?',
];

const MAX_SPARKLES = 28;

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([initialGreeting]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingSoundEnabled, setTypingSoundEnabled] = useState(true);
  const [sparkles, setSparkles] = useState([]);
  const chatContainerRef = useRef(null);
  const microphoneRef = useRef(null);
  const shellRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastKeyToneAtRef = useRef(0);
  const lastSparkleAtRef = useRef(0);
  const sparkleIdRef = useRef(0);

  const handleReset = () => {
    setUserMessage('');
    setError('');
    setIsLoading(false);
    setChatHistory([initialGreeting]);
    resetTranscript();
  };

  const commands = [
    {
      command: 'open *',
      callback: (website) => {
        window.open(`http://${website.split(' ').join('')}`);
      },
    },
    {
      command: 'change background colour to *',
      callback: (color) => {
        document.body.style.background = color;
      },
    },
    {
      command: 'reset',
      callback: () => {
        handleReset();
      },
    },
    {
      command: 'reset background colour',
      callback: () => {
        document.body.style.background = '';
      },
    },
  ];

  const { transcript, resetTranscript } = useSpeechRecognition({ commands });
  const [isListening, setIsListening] = useState(false);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <WellnessPage
        className="chatbot-page"
        contentClassName="chatbot-page__content"
        subtitle="A supportive conversation space for moments when you want to talk things through."
      >
        <div className="wm-panel wm-empty-state chatbot-unsupported">
          <h2 className="wm-heading">Speech recognition is not available here</h2>
          <p>Please use the text box to chat with Wellness Monitor, or open this page in a browser that supports speech recognition.</p>
        </div>
      </WellnessPage>
    );
  }

  const handleListening = () => {
    setIsListening(true);
    microphoneRef.current?.classList.add('listening');
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  const stopHandle = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    microphoneRef.current?.classList.remove('listening');
    setUserMessage(transcript);
  };

  const handlePointerMove = (event) => {
    const shell = shellRef.current;

    if (!shell) {
      return;
    }

    const bounds = shell.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    shell.style.setProperty('--chatbot-mouse-x', `${x}px`);
    shell.style.setProperty('--chatbot-mouse-y', `${y}px`);

    const now = performance.now();
    if (now - lastSparkleAtRef.current < 38) {
      return;
    }

    lastSparkleAtRef.current = now;
    const id = sparkleIdRef.current + 1;
    sparkleIdRef.current = id;

    setSparkles((previousSparkles) => [
      ...previousSparkles.slice(-(MAX_SPARKLES - 1)),
      {
        id,
        x,
        y,
        size: 7 + Math.random() * 12,
        driftX: (Math.random() - 0.5) * 48,
        driftY: -18 - Math.random() * 40,
        rotate: Math.random() * 180,
        hue: Math.random() > 0.5 ? 'gold' : 'teal',
      },
    ]);
  };

  const getAudioContext = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;

    if (context.state === 'suspended') {
      context.resume();
    }

    return context;
  };

  const playKeyTone = (event) => {
    const isTypingKey = event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete' || event.key === ' ';

    if (!typingSoundEnabled || event.repeat || event.ctrlKey || event.metaKey || event.altKey || !isTypingKey) {
      return;
    }

    const now = performance.now();
    if (now - lastKeyToneAtRef.current < 42) {
      return;
    }

    lastKeyToneAtRef.current = now;

    const context = getAudioContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const clickOscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const startTime = context.currentTime;
    const frequency = 620 + Math.random() * 220;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.62, startTime + 0.065);
    clickOscillator.type = 'sine';
    clickOscillator.frequency.setValueAtTime(frequency * 1.8, startTime);
    clickOscillator.frequency.exponentialRampToValueAtTime(frequency, startTime + 0.035);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

    oscillator.connect(filter);
    clickOscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    clickOscillator.start(startTime);
    oscillator.stop(startTime + 0.09);
    clickOscillator.stop(startTime + 0.05);
  };

  const playSendTone = () => {
    if (!typingSoundEnabled) {
      return;
    }

    const context = getAudioContext();
    if (!context) {
      return;
    }

    const startTime = context.currentTime;
    const masterGain = context.createGain();
    const delay = context.createDelay();
    const delayGain = context.createGain();
    const filter = context.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, startTime);
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.012);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.42);
    delay.delayTime.setValueAtTime(0.08, startTime);
    delayGain.gain.setValueAtTime(0.32, startTime);

    masterGain.connect(filter);
    filter.connect(context.destination);
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(context.destination);

    [0, 0.09, 0.18].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const frequency = [880, 1180, 760][index];

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime + offset);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.45, startTime + offset + 0.16);
      oscillator.connect(masterGain);
      oscillator.start(startTime + offset);
      oscillator.stop(startTime + offset + 0.18);
    });
  };

  const sendMessage = async (messageToSend) => {
    try {
      if (messageToSend.trim() === '') {
        setError('Please enter a message.');
        return;
      }

      const tempUserMessage = messageToSend.trim();
      const nextHistory = [...chatHistory, { user: tempUserMessage }];

      playSendTone();
      setUserMessage('');
      setError('');
      setIsLoading(true);
      setChatHistory(nextHistory);

      const response = await getResponse(tempUserMessage, nextHistory);
      const chatbotMessage = response?.response || 'I am here with you, but I could not generate a reply just now.';

      setChatHistory((prevHistory) => [...prevHistory, { chatbot: chatbotMessage }]);
      setIsLoading(false);
      resetTranscript();
    } catch (fetchError) {
      console.error('Error fetching response from API:', fetchError);
      setError('Failed to fetch response from the server.');
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    await sendMessage(userMessage);
  };

  const handleKeyDown = async (event) => {
    playKeyTone(event);

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleChat();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading, error]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close?.();
    };
  }, []);

  useEffect(() => {
    if (sparkles.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSparkles((previousSparkles) => previousSparkles.slice(1));
    }, 720);

    return () => window.clearTimeout(timeoutId);
  }, [sparkles]);

  return (
    <WellnessPage
      className="chatbot-page"
      contentClassName="chatbot-page__content"
      subtitle="A supportive conversation space for moments when you want to talk things through."
    >
      <div className="chatbot-shell" ref={shellRef} onPointerMove={handlePointerMove}>
        <div className="chatbot-scene" aria-hidden="true">
          <span className="chatbot-cursor-aura" />
          <span className="chatbot-moon" />
          <span className="chatbot-cloud chatbot-cloud--one" />
          <span className="chatbot-cloud chatbot-cloud--two" />
          <span className="chatbot-leaf chatbot-leaf--one" />
          <span className="chatbot-leaf chatbot-leaf--two" />
          <span className="chatbot-leaf chatbot-leaf--three" />
          <span className="chatbot-firefly chatbot-firefly--one" />
          <span className="chatbot-firefly chatbot-firefly--two" />
          <span className="chatbot-firefly chatbot-firefly--three" />
          {sparkles.map((sparkle) => (
            <span
              className={`chatbot-sparkle chatbot-sparkle--${sparkle.hue}`}
              key={sparkle.id}
              style={{
                left: `${sparkle.x}px`,
                top: `${sparkle.y}px`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
                '--sparkle-drift-x': `${sparkle.driftX}px`,
                '--sparkle-drift-y': `${sparkle.driftY}px`,
                '--sparkle-rotate': `${sparkle.rotate}deg`,
              }}
            />
          ))}
          <span className={`chatbot-companion ${isLoading ? 'chatbot-companion--thinking' : 'chatbot-companion--happy'}`}>
            <span className="chatbot-companion__ear chatbot-companion__ear--left" />
            <span className="chatbot-companion__ear chatbot-companion__ear--right" />
            <span className="chatbot-companion__face" />
            <span className="chatbot-companion__mouth" />
            <span className="chatbot-companion__thought">
              <span />
              <span />
              <span />
            </span>
          </span>
        </div>

      <div className="chatbot-container">
        <div className="chatbot-hero">
          <div>
            <p className="wm-eyebrow">Wellness Companion</p>
            <h3 className="wm-heading">A calmer space to talk things through</h3>
            <p className="wm-subcopy">
              Share what is on your mind and get warm, practical support in a natural conversation.
            </p>
          </div>
          <div className="chatbot-hero-actions">
            <button
              className={`typing-sound-toggle ${typingSoundEnabled ? 'typing-sound-toggle--active' : ''}`}
              onClick={() => setTypingSoundEnabled((previous) => !previous)}
              type="button"
              aria-pressed={typingSoundEnabled}
            >
              <span className="typing-sound-toggle__dot" />
              {typingSoundEnabled ? 'Sound effects on' : 'Sound effects off'}
            </button>
            <button className="wm-btn wm-btn--secondary chatbot-reset-btn" onClick={handleReset} type="button">
              Reset Chat
            </button>
          </div>
        </div>

        <div className="chatbot-buddy-strip" aria-label={isLoading ? 'Companion is thinking' : 'Companions are listening happily'}>
          <span className={`chatbot-mini-buddy chatbot-mini-buddy--sage ${isLoading ? 'chatbot-mini-buddy--thinking' : 'chatbot-mini-buddy--happy'}`}>
            <span className="chatbot-mini-buddy__face" />
          </span>
          <span className={`chatbot-mini-buddy chatbot-mini-buddy--peach ${isLoading ? 'chatbot-mini-buddy--thinking' : 'chatbot-mini-buddy--happy'}`}>
            <span className="chatbot-mini-buddy__face" />
          </span>
          <span className={`chatbot-mini-buddy chatbot-mini-buddy--sky ${isLoading ? 'chatbot-mini-buddy--thinking' : 'chatbot-mini-buddy--happy'}`}>
            <span className="chatbot-mini-buddy__face" />
          </span>
          <p>{isLoading ? 'The little companions are thinking with the bot...' : 'The little companions are happily listening with you.'}</p>
        </div>

        <div className="prompt-row">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              className="prompt-chip"
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="chatbot">
          <div className="chatbox" ref={chatContainerRef}>
            {chatHistory.map((entry, index) => (
              <div key={index}>
                {entry.user && (
                  <div className="message-row user-row">
                    <div className="bubble user-bubble">
                      <span className="bubble-label">You</span>
                      <p>{entry.user}</p>
                    </div>
                  </div>
                )}

                {entry.chatbot && (
                  <div className="message-row bot-row">
                    <div className="bot-avatar">WM</div>
                    <div className="bubble bot-bubble">
                      <span className="bubble-label">Wellness Monitor</span>
                      <p>{entry.chatbot}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="message-row bot-row">
                <div className="bot-avatar">WM</div>
                <div className="bubble bot-bubble loading-bubble">
                  <span className="bubble-label">Wellness Monitor</span>
                  <div className="loading-row">
                    <Comment
                      visible={true}
                      height="54"
                      width="54"
                      ariaLabel="comment-loading"
                      wrapperStyle={{}}
                      wrapperClass="comment-wrapper"
                      color="#fff"
                      backgroundColor="#407069"
                    />
                    <span>Thinking of a thoughtful reply...</span>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="error-banner">{error}</div>}
          </div>

          <div className="chat-input">
            <textarea
              placeholder="Write what you are feeling..."
              spellCheck="false"
              rows={1}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="composer-actions">
              {!userMessage && userMessage?.length === 0 && (
                <div className="mic-container">
                  <div className="microphone-icon-container" ref={microphoneRef} onClick={handleListening}>
                    {!isListening && <span className="material-symbols-rounded">mic</span>}
                  </div>

                  {isListening && (
                    <div className="microphone-stop" onClick={stopHandle}>
                      <span className="material-symbols-outlined">stop_circle</span>
                    </div>
                  )}
                </div>
              )}

              <button className="send-btn" onClick={handleChat} disabled={isLoading} type="button">
                <span className="material-symbols-rounded">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </WellnessPage>
  );
};

export default Chatbot;
