import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { audio } from './AudioEngine';
import { Play, Settings, BookOpen, Landmark, Volume2, VolumeX, Award, ShieldAlert, Wifi } from 'lucide-react';
import { motion } from 'motion/react';

interface MainMenuProps {
  onNavigate: (state: GameState) => void;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: (enabled: boolean) => void;
  onToggleSfx: (enabled: boolean) => void;
}

export default function MainMenu({
  onNavigate,
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSfx,
}: MainMenuProps) {
  const [highScore, setHighScore] = useState(0);
  const [hasClickedSoundPrompt, setHasClickedSoundPrompt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dansai_highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleMenuClick = (target: GameState) => {
    audio.playMenuClick();
    onNavigate(target);
  };

  const handleStartWithSound = () => {
    setHasClickedSoundPrompt(true);
    onToggleMusic(true);
    audio.playMenuClick();
  };

  return (
    <div id="main-menu-panel" className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.06)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />

      {/* Retro Firefly Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-red-500/20 blur-[1px]"
            style={{
              top: `${(20 + i * 17) % 100}%`,
              left: `${(10 + i * 29) % 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 6 + (i % 3) * 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 1. HEADER SECTION (Theme: Professional Polish Header with Logo and Metadata) */}
      <header className="flex-none p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 relative z-10 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <img
            id="game-logo-img"
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
            alt="Dan Sai Adventure Logo"
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
              Dan Sai Adventure
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-white/40 mt-1 uppercase font-semibold">
              Phi Ta Khon Chronicles • Version 1.0.4
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <div className="text-xl md:text-2xl font-light text-white/30 tracking-widest font-sans">DAN SAI</div>
          <div className="text-[9px] tracking-widest text-white/40 uppercase">LOEI PROVINCE • THAILAND</div>
        </div>
      </header>

      {/* 2. SPLIT CONTENT BODY (col-span-5 left menu, col-span-7 right showcase) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
        
        {/* Left column options panel (col-span-5 equivalent) */}
        <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-center space-y-6 lg:border-r lg:border-white/5 bg-white/[0.01]">
          
          {/* Menu button 1: PLAY */}
          <button
            id="menu-play-btn"
            onClick={() => handleMenuClick('PLAYING')}
            className="group flex items-center gap-5 w-full text-left transition-all hover:translate-x-2"
          >
            <span className="w-1.5 h-12 bg-white group-hover:bg-red-500 transition-colors" />
            <div>
              <span className="block text-2xl md:text-3xl font-bold uppercase tracking-wide group-hover:text-red-500 transition-colors">
                เข้าเกม / Play Game
              </span>
              <span className="text-xs text-white/40 uppercase">
                Start your journey through the sacred parade
              </span>
            </div>
          </button>

          {/* Menu button 2: OPTIONS */}
          <button
            id="menu-options-btn"
            onClick={() => handleMenuClick('OPTIONS')}
            className="group flex items-center gap-5 w-full text-left transition-all hover:translate-x-2"
          >
            <span className="w-1.5 h-12 bg-white/40 group-hover:bg-amber-500 transition-colors" />
            <div>
              <span className="block text-xl md:text-2xl font-bold uppercase tracking-wide group-hover:text-amber-500 transition-colors text-white/85">
                ปุ่มบังคับ & ตั้งค่า / Options
              </span>
              <span className="text-xs text-white/40 uppercase">
                Configure your key bindings and audio levels
              </span>
            </div>
          </button>

          {/* Menu button 3: HOW TO PLAY */}
          <button
            id="menu-how-to-play-btn"
            onClick={() => handleMenuClick('HOW_TO_PLAY')}
            className="group flex items-center gap-5 w-full text-left transition-all hover:translate-x-2"
          >
            <span className="w-1.5 h-12 bg-white/40 group-hover:bg-yellow-500 transition-colors" />
            <div>
              <span className="block text-xl md:text-2xl font-bold uppercase tracking-wide group-hover:text-yellow-500 transition-colors text-white/85">
                วิธีเล่น / How to Play
              </span>
              <span className="text-xs text-white/40 uppercase">
                Learn the rules of the Phi Ta Khon ritual
              </span>
            </div>
          </button>

          {/* Menu button 4: LORE */}
          <button
            id="menu-lore-btn"
            onClick={() => handleMenuClick('LORE')}
            className="group flex items-center gap-5 w-full text-left transition-all hover:translate-x-2"
          >
            <span className="w-1.5 h-12 bg-white/40 group-hover:bg-red-500 transition-colors" />
            <div>
              <span className="block text-xl md:text-2xl font-bold uppercase tracking-wide group-hover:text-red-500 transition-colors text-white/85">
                ตำนานวัฒนธรรม / Lore
              </span>
              <span className="text-xs text-white/40 uppercase">
                Discover the history and mask craftsmanship
              </span>
            </div>
          </button>
        </div>

        {/* Right column preview showcase panel (col-span-7 equivalent) */}
        <div className="lg:col-span-7 p-6 md:p-12 flex flex-col justify-between space-y-8">
          
          {/* Header section of right info box */}
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-500">
              สถิติและการตั้งค่าเสียง / Shrine Information
            </h2>
            <span className="text-[9px] text-white/30 uppercase tracking-widest">
              Loei Cultural Guild
            </span>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {/* Highscore and Audio Status widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* High Score Widget */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">High Score</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl md:text-3xl font-black text-amber-500 font-mono">
                    {highScore}
                  </span>
                  <Award className="w-8 h-8 text-amber-500/80 animate-pulse" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 font-mono">
                  บันทึกความดีงามสูงสุดในอำเภอ
                </div>
              </div>

              {/* Sound Settings Quick Access */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/30 transition-all">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Audio Controls</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">เพลงประกอบ (BGM)</span>
                  <button
                    id="quick-music-btn"
                    onClick={() => {
                      audio.playMenuClick();
                      onToggleMusic(!musicEnabled);
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                      musicEnabled ? 'bg-red-950/40 text-red-400 border-red-500/40' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {musicEnabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3.5">
                  <span className="text-xs font-medium text-zinc-300">เสียงเอฟเฟกต์ (SFX)</span>
                  <button
                    id="quick-sfx-btn"
                    onClick={() => {
                      onToggleSfx(!sfxEnabled);
                      setTimeout(() => {
                        audio.playMenuClick();
                      }, 40);
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                      sfxEnabled ? 'bg-amber-950/40 text-amber-400 border-amber-500/40' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {sfxEnabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>
              </div>

            </div>

            {/* Quick sound alert box or notification banner */}
            {!hasClickedSoundPrompt && !musicEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 bg-amber-500 flex items-center justify-center rounded-full flex-shrink-0">
                  <span className="text-black font-black text-lg">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-200/80 leading-relaxed font-sans">
                    เปิดเพลงประกอบเพื่อเพลิดเพลินกับซินธิไซเซอร์ <strong>ดนตรีอีสานลายพิณกลองยาว</strong> ย้อนยุคเรโทร 8-bit!
                  </p>
                  <button
                    id="activate-sound-banner-btn"
                    onClick={handleStartWithSound}
                    className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                  >
                    เปิดระบบเสียงตอนนี้ / Turn On Sound
                  </button>
                </div>
              </motion.div>
            )}

            {/* Culture highlight card */}
            <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl text-left text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-red-500 uppercase block mb-1">ℹ️ ข้อมูลการผจญภัย</span>
              สวมบทบาทเป็นผู้นำหน้ากากผีตาโขนออกผจญภัย หลบหลีกกองหิน ขจัดวิญญาณป่าเกเรด้วยดาบไม้ 
              เก็บกระติ๊บข้าวเหนียวเพื่อเข้าสู่เป้าหมายคือ <strong>วัดโพนชัย</strong> อันศักดิ์สิทธิ์
            </div>

          </div>

          <div className="text-[10px] text-zinc-500 uppercase tracking-wider text-left border-t border-white/5 pt-4">
            * สลักปุ่มบังคับและรูปแบบความเร็วได้ในหน้า "OPTIONS"
          </div>
        </div>

      </main>

      {/* 3. SYSTEM STATUS BAR FOOTER (Theme: Professional Polish bottom solid ribbon) */}
      <footer className="flex-none h-10 bg-white text-black flex items-center px-6 md:px-8 justify-between relative z-10">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-black" />
          <span>System Status: Online • Ping: 18ms</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em]">
          © 2026 Dan Sai Chronicles • Loei, Thailand
        </div>
      </footer>
    </div>
  );
}

