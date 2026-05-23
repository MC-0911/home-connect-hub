import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const CHARS = "!<>-_\/[]{}—=+*^?#________ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789@$%&";

/**
 * Password input with a "decryption" reveal animation.
 * When the eye icon is clicked, scrambled characters resolve into the real password.
 */
export function ScramblePassword({ value, onChange, placeholder, disabled, required }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [display, setDisplay] = useState("");
  const [animating, setAnimating] = useState(false);
  const frameRef = useRef<number | null>(null);

  // Run scramble -> resolve animation
  const runScramble = (target: string) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const queue: { from: string; to: string; start: number; end: number; char?: string }[] = [];
    const maxLen = target.length;
    for (let i = 0; i < maxLen; i++) {
      const from = "";
      const to = target[i];
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20) + 15;
      queue.push({ from, to, start, end });
    }
    let frame = 0;
    setAnimating(true);
    const update = () => {
      let output = "";
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        if (frame >= q.end) {
          complete++;
          output += q.to;
        } else if (frame >= q.start) {
          if (!q.char || Math.random() < 0.28) {
            q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          output += q.char;
        } else {
          output += q.from;
        }
      }
      setDisplay(output);
      if (complete === queue.length) {
        setAnimating(false);
        return;
      }
      frame++;
      frameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const handleToggle = () => {
    if (!revealed) {
      setRevealed(true);
      if (value) runScramble(value);
      else setDisplay("");
    } else {
      setRevealed(false);
      setAnimating(false);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }
  };

  // Keep display in sync when user types while revealed
  useEffect(() => {
    if (revealed && !animating) setDisplay(value);
  }, [value, revealed, animating]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="auth-input-box">
      {revealed && animating ? (
        <>
          {/* Real input stays focusable but hidden visually while scrambling */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            style={{ color: "transparent", caretColor: "transparent" }}
          />
          <div
            aria-hidden
            className="auth-scramble-overlay"
          >
            {display}
            <span className="auth-scramble-caret">|</span>
          </div>
        </>
      ) : (
        <input
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
      <button
        type="button"
        className="auth-input-icon auth-eye"
        onClick={handleToggle}
        tabIndex={-1}
        aria-label={revealed ? "Hide password" : "Show password"}
      >
        {revealed ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
      </button>
    </div>
  );
}
