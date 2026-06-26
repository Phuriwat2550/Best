import React, { useState, useEffect } from 'react';
import { ControlsConfig } from '../types';
import { audio } from './AudioEngine';
import { Keyboard, Volume2, VolumeX, RotateCcw, ArrowLeft, Wifi, Sliders, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface OptionsPanelProps {
  controls: ControlsConfig;
  onSaveControls: (newControls: ControlsConfig) => void;
  onBack: () => void;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: (enabled: boolean) => void;
  onToggleSfx: (enabled: boolean) => void;
}

export default function OptionsPanel({
  controls,
  onSaveControls,
  onBack,
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSfx,
}: OptionsPanelProps) {
  const [activeRebind, setActiveRebind] = useState<keyof ControlsConfig | null>(null);

  useEffect(() => {
    if (!activeRebind) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      // Don't map Escape to anything so users can cancel or navigate
      if (e.key === 'Escape') {
        setActiveRebind(null);
        audio.playHit();
        return;
      }

      // Pretty print display key name
      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';

      const updated = {
        ...controls,
        [activeRebind]: keyName,
      };

      onSaveControls(updated);
      setActiveRebind(null);
      audio.playCollect();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRebind, controls, onSaveControls]);

  const handleResetControls = () => {
    audio.playCollect();
    onSaveControls({
      moveLeft: 'ArrowLeft',
      moveRight: 'ArrowRight',
      jump: 'ArrowUp',
      attack: 'Space',
    });
  };

  const getFriendlyKeyName = (key: string) => {
    if (key === ' ') return 'SPACE';
    if (key === 'ArrowUp') return '▲ JUMP';
    if (key === 'ArrowDown') return '▼ DOWN';
    if (key === 'ArrowLeft') return '◀ LEFT';
    if (key === 'ArrowRight') return '▶ RIGHT';
    return key.toUpperCase();
  };

  const controlLabels: Record<keyof ControlsConfig, { title: string; desc: string }> = {
    moveLeft: { title: 'เดินซ้าย / Move Left', desc: 'กดเพื่อเปลี่ยนปุ่มเคลื่อนที่ไปทางซ้าย' },
    moveRight: { title: 'เดินขวา / Move Right', desc: 'กดเพื่อเปลี่ยนปุ่มเคลื่อนที่ไปทางขวา' },
    jump: { title: 'กระโดด / Jump', desc: 'กดเพื่อเปลี่ยนปุ่มกระโดดข้ามสิ่งกีดขวาง' },
    attack: { title: 'โจมตี / Attack', desc: 'แกว่งดาบไม้/กระดิ่ง ปราบภูติผีเกเร' },
  };

  return (
    <div id="options-panel" className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />

      {/* 1. HEADER SECTION (Cohesive Professional Polish Header) */}
      <header className="flex-none p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 relative z-10 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <img
            id="options-logo-img"
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
            alt="Dan Sai Adventure Logo"
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">
              Dan Sai Adventure
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-white/40 mt-1 uppercase font-semibold">
              Phi Ta Khon Chronicles • CONFIGURATION PANEL
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <div className="text-xl md:text-2xl font-light text-white/30 tracking-widest font-sans">DAN SAI</div>
          <div className="text-[9px] tracking-widest text-white/40 uppercase">LOEI PROVINCE • THAILAND</div>
        </div>
      </header>

      {/* 2. SPLIT CONTENT BODY */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
        
        {/* Left column: general config & instructions (col-span-5) */}
        <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-between space-y-8 lg:border-r lg:border-white/5 bg-white/[0.01]">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sliders className="w-8 h-8 text-amber-500 animate-pulse" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                  ระบบเสียง & คอนโซล
                </h2>
                <p className="text-xs text-white/40">Adjust sound channels and engine constants</p>
              </div>
            </div>

            {/* BGM Toggle Card */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/30 transition-all flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold uppercase tracking-wider text-amber-400">
                  ดนตรีประกอบ (BGM)
                </span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Retro Isan folk pin & pongyaw loops
                </span>
              </div>
              <button
                id="toggle-music-btn"
                onClick={() => {
                  audio.playMenuClick();
                  onToggleMusic(!musicEnabled);
                }}
                className={`px-4 py-2 rounded font-mono font-black text-xs border transition-all ${
                  musicEnabled
                    ? 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {musicEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* SFX Toggle Card */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/30 transition-all flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold uppercase tracking-wider text-amber-400">
                  เอฟเฟกต์เสียง (SFX)
                </span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Bell rings, jumps, wooden sword clangs
                </span>
              </div>
              <button
                id="toggle-sfx-btn"
                onClick={() => {
                  onToggleSfx(!sfxEnabled);
                  setTimeout(() => {
                    audio.playMenuClick();
                  }, 40);
                }}
                className={`px-4 py-2 rounded font-mono font-black text-xs border transition-all ${
                  sfxEnabled
                    ? 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {sfxEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Reset instructions & button */}
            <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl text-left text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-amber-500 uppercase block mb-1">💡 เคล็ดลับการเซ็ตปุ่ม</span>
              หากเปลี่ยนปุ่มเล่นแล้วสับสนหรือต้องการกลับไปตั้งค่าเริ่มต้น สามารถใช้ปุ่มด้านล่างเพื่อรีเซ็ตกลับเป็นปุ่มลูกศรและ Spacebar ได้ทันที
            </div>
          </div>

          {/* Reset button inside sidebar */}
          <button
            id="reset-controls-btn"
            onClick={handleResetControls}
            className="group flex items-center gap-4 w-full text-left transition-all hover:translate-x-2 py-3"
          >
            <span className="w-1.5 h-10 bg-white/20 group-hover:bg-amber-500 transition-colors" />
            <div>
              <span className="block text-sm font-bold uppercase tracking-wider text-white group-hover:text-amber-500 transition-colors">
                คืนค่าเริ่มต้น / Reset Controls
              </span>
              <span className="text-[10px] text-white/40 uppercase">
                Restore Arrow Keys and Spacebar defaults
              </span>
            </div>
          </button>
        </div>

        {/* Right column: key rebind grid (col-span-7) */}
        <div className="lg:col-span-7 p-6 md:p-12 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">
                ตั้งค่าปุ่มคีย์บอร์ด / Custom Keyboard Mapping
              </h3>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">
                Active Mapping Profile
              </span>
            </div>

            <div className="space-y-3.5">
              {(Object.keys(controlLabels) as Array<keyof ControlsConfig>).map((key) => {
                const isActive = activeRebind === key;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-950/20 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-900/40 border-zinc-800/85 hover:border-zinc-700/80'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-100">{controlLabels[key].title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{controlLabels[key].desc}</p>
                    </div>

                    <button
                      id={`rebind-btn-${key}`}
                      onClick={() => {
                        audio.playMenuClick();
                        setActiveRebind(key);
                      }}
                      className={`px-4 py-2.5 rounded text-xs font-mono font-black tracking-wider transition-all min-w-[130px] text-center uppercase border ${
                        isActive
                          ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                          : 'bg-zinc-950 text-amber-400 border-amber-900/40 hover:bg-zinc-900 hover:border-amber-500'
                      }`}
                    >
                      {isActive ? 'กดปุ่มใหม่...' : getFriendlyKeyName(controls[key])}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              id="back-from-options-btn"
              onClick={() => {
                audio.playMenuClick();
                onBack();
              }}
              className="px-8 py-3 bg-white text-black hover:bg-amber-500 hover:text-black font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3px]" /> ย้อนกลับ / Back to Menu
            </button>
          </div>

        </div>

      </main>

      {/* 3. SYSTEM STATUS BAR FOOTER */}
      <footer className="flex-none h-10 bg-white text-black flex items-center px-6 md:px-8 justify-between relative z-10">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-black" />
          <span>System Configurator: ONLINE • Calibration Success</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em]">
          © 2026 Dan Sai Chronicles • Loei, Thailand
        </div>
      </footer>
    </div>
  );
}
