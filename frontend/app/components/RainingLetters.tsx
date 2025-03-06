"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../providers/WalletProvider";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

interface Character {
  char: string;
  x: number;
  y: number;
  speed: number;
}

class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#₿Ξ◎Ð₳₮";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

const ScrambledTitle: React.FC = () => {
  const elementRef = useRef<HTMLHeadingElement>(null);
  const scramblerRef = useRef<TextScramble | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (elementRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(elementRef.current);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && scramblerRef.current) {
      const phrases = ["MEMETRON", "LAUNCH", "PREDICT", "TRADE", "WIN"];

      let counter = 0;
      const next = () => {
        if (scramblerRef.current) {
          scramblerRef.current.setText(phrases[counter]).then(() => {
            setTimeout(next, 2000);
          });
          counter = (counter + 1) % phrases.length;
        }
      };

      next();
    }
  }, [mounted]);

  return (
    <h1
      ref={elementRef}
      className="text-white text-6xl font-bold tracking-wider justify-center"
      style={{ fontFamily: "monospace" }}
    >
      MEMETRON
    </h1>
  );
};

interface RainingLettersProps {
  onConnectWallet?: () => Promise<void>;
}

const MatrixRainbowButton = () => {
  const router = useRouter();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        useEffect(() => {
          if (connected && !chain.unsupported) {
            router.push("/dashboard");
          }
        }, [connected, chain?.unsupported]);

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={`px-8 py-3 rounded-md text-lg font-bold transition-all duration-300 bg-transparent border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,0,0.7)]`}
                  >
                    <div className="flex items-center justify-center">
                      <Wallet className="mr-2 h-5 w-5" />
                      <span>GET STARTED</span>
                    </div>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-8 py-3 rounded-md text-lg font-bold transition-all duration-300 bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(255,0,0,0.7)]"
                  >
                    Wrong network
                  </button>
                );
              }

              return null;
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

const RainingLetters: React.FC<RainingLettersProps> = ({ onConnectWallet }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());
  const router = useRouter();
  const { connect, isConnected } = useWallet();

  const animationFrameId = useRef<number | null>(null);

  const handleConnectClick = async () => {
    if (onConnectWallet) {
      await onConnectWallet();
    } else {
      try {
        if (!isConnected) {
          await connect();
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        router.push("/dashboard");
      }
    }
  };

  const createCharacters = useCallback(() => {
    const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₿ΞÐETH₮SOLBNB";
    const charCount = 100;
    const newCharacters: Character[] = [];

    for (let i = 0; i < charCount; i++) {
      newCharacters.push({
        char: allChars[Math.floor(Math.random() * allChars.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.3,
      });
    }

    return newCharacters;
  }, []);

  useEffect(() => {
    setCharacters(createCharacters());
  }, [createCharacters]);

  useEffect(() => {
    const updateActiveIndices = () => {
      const newActiveIndices = new Set<number>();
      const numActive = Math.floor(Math.random() * 5) + 5;
      for (let i = 0; i < numActive; i++) {
        newActiveIndices.add(Math.floor(Math.random() * characters.length));
      }
      setActiveIndices(newActiveIndices);
    };

    const flickerInterval = setInterval(updateActiveIndices, 200);
    return () => clearInterval(flickerInterval);
  }, [characters.length]);

  useEffect(() => {
    const updatePositions = () => {
      setCharacters((prevChars) =>
        prevChars.map((char) => ({
          ...char,
          y: char.y + char.speed,
          ...(char.y >= 100 && {
            y: -5,
            x: Math.random() * 100,
            char: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₿ΞÐETH₮SOLBNB"[
              Math.floor(
                Math.random() *
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₿ΞÐETH₮SOLBNB".length
              )
            ],
          }),
        }))
      );
      animationFrameId.current = requestAnimationFrame(updatePositions);
    };

    animationFrameId.current = requestAnimationFrame(updatePositions);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const characterElements = useMemo(() => {
    return characters.map((char, index) => (
      <span
        key={index}
        className={`absolute text-xs transition-colors duration-100 ${
          activeIndices.has(index)
            ? "text-[#00ff00] text-base scale-125 z-10 font-bold animate-pulse"
            : "text-[#00ff00]/30 font-light"
        }`}
        style={{
          left: `${char.x}%`,
          top: `${char.y}%`,
          transform: `translate(-50%, -50%) ${
            activeIndices.has(index) ? "scale(1.25)" : "scale(1)"
          }`,
          textShadow: activeIndices.has(index)
            ? "0 0 8px rgba(0,255,0,0.8), 0 0 12px rgba(0,255,0,0.4)"
            : "none",
          opacity: activeIndices.has(index) ? 1 : 0.4,
          transition: "color 0.1s, transform 0.1s, text-shadow 0.1s",
          willChange: "transform, top",
          fontSize: "1.8rem",
        }}
      >
        {char.char}
      </span>
    ));
  }, [characters, activeIndices]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Title and CTA */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <ScrambledTitle />

        <p className="text-gray-400 mt-6 mb-8 text-center max-w-md text-lg">
          The ultimate platform for crypto enthusiasts. Predict trends, launch
          tokens, and capitalize on the next big opportunity. Built on
          Electroneum.
        </p>

        <MatrixRainbowButton />
      </div>

      {/* Raining Characters - now using memoized elements */}
      {characterElements}

      <style jsx global>{`
        .dud {
          color: #0f0;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default RainingLetters;
