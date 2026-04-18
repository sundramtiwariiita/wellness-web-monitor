import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import ambientLoop from "../../assets/media/background-music.mp3";

const AMBIENT_AUDIO_KEY = "wm_ambient_audio_enabled";

const AmbientAudioContext = createContext({
    enabled: false,
    isPlaying: false,
    toggle: () => {},
});

export const AmbientAudioProvider = ({ children }) => {
    const audioRef = useRef(null);
    const [enabled, setEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const storedPreference = window.localStorage.getItem(AMBIENT_AUDIO_KEY);
        setEnabled(storedPreference === "true");
        setHydrated(true);
    }, []);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) {
            return;
        }

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audioElement.addEventListener("play", handlePlay);
        audioElement.addEventListener("pause", handlePause);

        return () => {
            audioElement.removeEventListener("play", handlePlay);
            audioElement.removeEventListener("pause", handlePause);
        };
    }, []);

    useEffect(() => {
        if (!hydrated || typeof window === "undefined") {
            return;
        }

        const audioElement = audioRef.current;
        window.localStorage.setItem(AMBIENT_AUDIO_KEY, String(enabled));

        if (!audioElement) {
            return;
        }

        audioElement.volume = 0.88;

        if (!enabled) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.muted = true;
        }
    }, [enabled, hydrated]);

    const toggle = async () => {
        const audioElement = audioRef.current;

        if (!audioElement) {
            return;
        }

        audioElement.volume = 0.95;

        if (isPlaying) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.muted = true;
            setEnabled(false);
            setIsPlaying(false);
            return;
        }

        try {
            setEnabled(true);
            audioElement.muted = false;
            await audioElement.play();
            setIsPlaying(true);
        } catch (error) {
            console.warn("Ambient audio playback was blocked or failed:", error);
            setEnabled(false);
            setIsPlaying(false);
        }
    };

    const value = useMemo(
        () => ({
            enabled,
            isPlaying,
            toggle,
        }),
        [enabled, isPlaying]
    );

    return (
        <AmbientAudioContext.Provider value={value}>
            {children}
            <audio ref={audioRef} src={ambientLoop} preload="auto" loop playsInline muted={!isPlaying} />
        </AmbientAudioContext.Provider>
    );
};

export const useAmbientAudio = () => useContext(AmbientAudioContext);
