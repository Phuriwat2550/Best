import React from 'react';
import { audio } from './AudioEngine';
import { ArrowLeft, Landmark, History, Globe, Wifi, Palette } from 'lucide-react';
import { motion } from 'motion/react';

interface LorePanelProps {
  onBack: () => void;
}

export default function LorePanel({ onBack }: LorePanelProps) {
  return (
    <div id="lore-panel" className="relative flex flex-col min-h-screen bg-black text-white overflow-y-auto font-sans">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,rgba(0,0,0,1)_90%)] pointer-events-none z-0" />

      {/* 1. HEADER SECTION (Cohesive Professional Polish Header) */}
      <header className="flex-none p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 relative z-10 gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <img
            id="lore-logo-img"
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
            alt="Dan Sai Adventure Logo"
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
              Dan Sai Adventure
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-white/40 mt-1 uppercase font-semibold">
              Phi Ta Khon Chronicles • CULTURAL ARCHIVES
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-3.5">
          <div className="text-center sm:text-right">
            <div className="text-xl md:text-2xl font-light text-white/30 tracking-widest font-sans">DAN SAI</div>
            <div className="text-[9px] tracking-widest text-white/40 uppercase">LOEI PROVINCE • THAILAND</div>
          </div>
          <button
            id="header-back-from-lore-btn"
            onClick={() => {
              audio.playMenuClick();
              onBack();
            }}
            className="px-5 py-2 bg-white hover:bg-red-500 text-black font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 rounded-xl shadow-lg hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" /> ย้อนกลับ / Back
          </button>
        </div>
      </header>

      {/* 2. SPLIT CONTENT BODY */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
        
        {/* Left column: Cultural Core & Summary (col-span-5) */}
        <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-between space-y-8 lg:border-r lg:border-white/5 bg-white/[0.01]">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Landmark className="w-8 h-8 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                  มรดกล้ำค่าด่านซ้าย
                </h2>
                <p className="text-xs text-white/40">The living heritage of the Moon River Basin</p>
              </div>
            </div>

            <p className="text-xs md:text-sm leading-relaxed text-zinc-300">
              สัมผัสประวัติศาสตร์ มรดกวัฒนธรรม และศิลปะอันน่าทึ่งใน <strong>ประเพณีแห่ผีตาโขน</strong> 
              ที่ผูกพันกับวิถีชีวิตชาวอําเภอด่านซ้าย จังหวัดเลย อย่างลึกซึ้งผ่านจิตวิญญาณแห่งความสนุกสนานและพุทธบูชาอันยิ่งใหญ่
            </p>

            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
              <span className="font-bold text-red-500 uppercase block text-xs mb-1">🎭 งานบุญหลวง (Bun Luang)</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                การแห่ผีตาโขนจัดขึ้นในงานบุญหลวง ซึ่งเป็นการร่วมบุญใหญ่ประจำปี ทั้งฟังเทศน์มหาชาติพระเวสสันดรชาดก 
                และทำบุญเพื่อความอุดมสมบูรณ์ของฟ้าฝนตามฤดูกาล
              </p>
            </div>
          </div>

          {/* Archive quote */}
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider text-left border-t border-white/5 pt-4">
            * บันทึกทางวิชาการและการท่องเที่ยวประวัติศาสตร์พุทธศาสนาอีสาน
          </div>
        </div>

        {/* Right column: Artistic and historic directory (col-span-7) */}
        <div className="lg:col-span-7 p-6 md:p-12 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">
                ตำนานเรื่องราว / The Lore & Chronicles
              </h3>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">
                Loei Cultural Registry
              </span>
            </div>

            <div className="space-y-4">
              
              {/* History Block */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-red-500/30 transition-all">
                <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-2 uppercase">
                  <History className="w-4 h-4" /> ที่มาของเทศกาล / Origin of Phi Ta Khon
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>ตำนานพระเวสสันดรชาดก:</strong> เล่าว่า เมื่อครั้งที่พระเวสสันดรเสด็จกลับเมือง เหล่าสิงสาราสัตว์และภูติผีในป่าต่างอาลัยอาวรณ์และยินดีปรีดา จึงแฝงกายมาร่วมเต้นรำในขบวนแห่จนเกิดคำเรียกประเพณีนี้ว่า "ผีตามคน" จนเพี้ยนเป็น "ผีตาโขน"
                </p>
                <p className="text-[11px] text-zinc-500 italic mt-2 leading-relaxed">
                  <strong>The Legend:</strong> In Prince Vessantara's story, forest spirits and local ghosts danced joyfully alongside the returning royalty, birthing "Phi Tam Khon" (ghosts following people).
                </p>
              </div>

              {/* Mask Crafts Block */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-red-500/30 transition-all">
                <h4 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-2 uppercase">
                  <Palette className="w-4 h-4" /> ศิลปะหน้ากาก / The Mask Craftsmanship
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 text-xs text-zinc-300 leading-relaxed">
                    หน้ากากอันโดดเด่นสร้างจากวัตถุดิบธรรมชาติประณีต:
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-zinc-400">
                      <li><strong>หัวหน้ากาก:</strong> ทำจาก "หวด" นึ่งข้าวเหนียวจากไผ่สานพับแต่ง</li>
                      <li><strong>ใบหน้า:</strong> โคนก้านมะพร้าวถากและเจาะรูส่วนของตาอย่างพอดี</li>
                      <li><strong>จมูกกงจัก:</strong> ใช้ไม้เนื้ออ่อนแกะสลักโค้งคล้ายงวงช้างหรืองอโค้ง</li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-red-900/20 flex flex-col justify-center items-center text-center">
                    <span className="text-2xl mb-1">🎨</span>
                    <span className="text-[10px] font-bold text-amber-500">ภูมิปัญญาด่านซ้าย</span>
                    <p className="text-[9px] text-zinc-500 mt-1">มรดกประดับดินสู่สากล</p>
                  </div>
                </div>
              </div>

              {/* Wat Pon Chai Block */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-red-500/30 transition-all">
                <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-2 mb-2 uppercase">
                  <Globe className="w-4 h-4" /> วัดโพนชัย / Sacred Wat Pon Chai Hub
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  ศูนย์รวมจิตใจสูงสุดในการประกอบพิธีกรรมทางประเพณีแห่ผีตาโขนคือ <strong>วัดโพนชัย</strong> ซึ่งเป็นสถานที่แห่รอบอุโบสถ ฟังเทศน์มหาชาติในเทศกาลบุญหลวงอันงดงามวิจิตร
                </p>
              </div>

            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              id="back-from-lore-btn"
              onClick={() => {
                audio.playMenuClick();
                onBack();
              }}
              className="px-8 py-3 bg-white text-black hover:bg-red-500 hover:text-black font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
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
          <span>Cultural Archives: Connected • Readability Checked</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em]">
          © 2026 Dan Sai Chronicles • Loei, Thailand
        </div>
      </footer>
    </div>
  );
}
