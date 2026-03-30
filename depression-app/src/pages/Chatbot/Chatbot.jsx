import React, { useEffect, useRef, useState } from 'react';
import { Comment } from 'react-loader-spinner';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
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

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([initialGreeting]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);
  const microphoneRef = useRef(null);

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
      <div className="mircophone-container">
        Browser is not Support Speech Recognition.
      </div>
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

  const sendMessage = async (messageToSend) => {
    try {
      if (messageToSend.trim() === '') {
        setError('Please enter a message.');
        return;
      }

      const tempUserMessage = messageToSend.trim();
      const nextHistory = [...chatHistory, { user: tempUserMessage }];

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

  return (
    <div className="chatbot-shell">
      <div className="chatbot-container">
        <div className="chatbot-hero">
          <div>
            <p className="eyebrow">Wellness Companion</p>
            <h3 className="heading">A calmer space to talk things through</h3>
            <p className="subheading">
              Share what is on your mind and get warm, practical support in a natural conversation.
            </p>
          </div>
          <button className="reset-btn" onClick={handleReset} type="button">
            Reset Chat
          </button>
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
                      backgroundColor="#11294F"
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
  );
};

export default Chatbot;
