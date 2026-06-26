import React from 'react';
import { ControlsConfig } from '../types';
import { audio } from './AudioEngine';
import { BookOpen, ArrowLeft, Wifi, Sparkles, Shield, Swords, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface HowToPlayProps {
  controls: ControlsConfig;
  onBack: () => void;
}

export default function HowToPlay({ controls, onBack }: HowToPlayProps) {
  const getFriendlyKeyName = (key: string) => {
    if (key === ' ') return 'SPACEBAR';
    if (key === 'ArrowUp') return '▲ JUMP';
    if (key === 'ArrowDown') return '▼ DOWN';
    if (key === 'ArrowLeft') return '◀ LEFT';
    if (key === 'ArrowRight') return '▶ RIGHT';
    return key.toUpperCase();
  };

  return (
    <div id="how-to-play-panel" className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />

      {/* 1. HEADER SECTION (Cohesive Professional Polish Header) */}
      <header className="flex-none p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 relative z-10 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <img
            id="howtoplay-logo-img"
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
            alt="Dan Sai Adventure Logo"
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              Dan Sai Adventure
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-white/40 mt-1 uppercase font-semibold">
              Phi Ta Khon Chronicles • GUIDE & INSTRUCTIONS
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
        
        {/* Left column: Controls and Objective (col-span-5) */}
        <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-between space-y-8 lg:border-r lg:border-white/5 bg-white/[0.01]">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500 animate-pulse" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                  วิธีการควบคุม
                </h2>
                <p className="text-xs text-white/40">Master the movements of the sacred dancer</p>
              </div>
            </div>

            {/* Configured Keybinds Summary */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">เดินซ้าย / Move Left</span>
                <span className="px-3 py-1 bg-zinc-950 text-blue-400 font-mono text-xs font-black border border-blue-900/40 rounded uppercase">
                  {getFriendlyKeyName(controls.moveLeft)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">เดินขวา / Move Right</span>
                <span className="px-3 py-1 bg-zinc-950 text-blue-400 font-mono text-xs font-black border border-blue-900/40 rounded uppercase">
                  {getFriendlyKeyName(controls.moveRight)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">กระโดด / Jump</span>
                <span className="px-3 py-1 bg-zinc-950 text-blue-400 font-mono text-xs font-black border border-blue-900/40 rounded uppercase">
                  {getFriendlyKeyName(controls.jump)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">โจมตี / Attack</span>
                <span className="px-3 py-1 bg-zinc-950 text-blue-400 font-mono text-xs font-black border border-blue-900/40 rounded uppercase">
                  {getFriendlyKeyName(controls.attack)}
                </span>
              </div>
            </div>

            {/* Core Objective Summary */}
            <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl text-left text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-blue-500 uppercase block mb-1">🏁 เป้าหมายหลัก (Goal)</span>
              เดินทางหลบหลีกกองหินและกำจัดวิญญาณเกเรด้วยดาบไม้ เพื่อนำขบวนผีตาโขนเข้าสู่จุดหมายสูงสุดคือ <strong>วัดโพนชัย</strong> อันศักดิ์สิทธิ์อย่างสมบูรณ์
            </div>
          </div>

          {/* Quick tip text */}
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider text-left border-t border-white/5 pt-4">
            * ต้องการเปลี่ยนปุ่ม? เข้าเมนู "OPTIONS" เพื่อแก้ไขได้ตลอดเวลา
          </div>
        </div>

        {/* Right column: showcase cards (col-span-7) */}
        <div className="lg:col-span-7 p-6 md:p-12 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">
                คู่มือไอเทมและอุปสรรค / Items & Hazards Directory
              </h3>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">
                Encounter Encyclopedia
              </span>
            </div>

            {/* Interactive Grid of Entities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Sticky Rice Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative hover:border-blue-500/30 transition-all flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 select-none">
                  🌾
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">กระติ๊บข้าวเหนียว</h4>
                  <p className="text-xs text-white/40 font-semibold mt-0.5">Sticky Rice Basket</p>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    อาหารหลักประจำท้องถิ่นแห่ด่านซ้าย เก็บเพื่อเพิ่มแต้มสำคัญสะสมบารมีในจังหวัด (+10 คะแนน)
                  </p>
                </div>
              </div>

              {/* Sacred Golden Mask Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative hover:border-blue-500/30 transition-all flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 select-none">
                  🎭
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">หน้ากากทองคำ</h4>
                  <p className="text-xs text-white/40 font-semibold mt-0.5">Sacred Gold Mask</p>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    หน้ากากโบราณล้ำค่าที่ให้พลังคะแนนมหาศาลเพื่อเพิ่มเกียรติยศสูงสุดขีดจำกัด (+50 คะแนน)
                  </p>
                </div>
              </div>

              {/* Forest Spirit Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative hover:border-blue-500/30 transition-all flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 select-none">
                  👻
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">วิญญาณป่าเกเร</h4>
                  <p className="text-xs text-white/40 font-semibold mt-0.5">Forest Spirit</p>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    วิญญาณลอยวนคอยกวนขบวนแห่ สามารถกระโดดหลบหรือใช้ดาบไม้แกว่งปราบเพื่อสลายวิญญาณได้สำเร็จ
                  </p>
                </div>
              </div>

              {/* Rock Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative hover:border-blue-500/30 transition-all flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-700/10 border border-zinc-500/30 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 select-none">
                  🪨
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">กองหินโบราณ</h4>
                  <p className="text-xs text-white/40 font-semibold mt-0.5">Ancient Stone</p>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    อุปสรรคตามพื้นถนน ห้ามสัมผัสหรือชนเด็ดขาด! ต้องจับจังหวะเพื่อกดกระโดดข้ามพ้นอย่างปลอดภัย
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              id="back-from-howtoplay-btn"
              onClick={() => {
                audio.playMenuClick();
                onBack();
              }}
              className="px-8 py-3 bg-white text-black hover:bg-blue-500 hover:text-black font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
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
          <span>System Manual: Connected • Guide database v1.2</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em]">
          © 2026 Dan Sai Chronicles • Loei, Thailand
        </div>
      </footer>
    </div>
  );
}

