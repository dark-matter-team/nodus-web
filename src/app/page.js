import Image from "next/image";

export default function Home() {
  return (
    // ЗМІНЕНО: Радіальний градієнт, який створює світле світіння по центру і темнішає до країв
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,_#4a158c_0%,_#120b2e_45%,_#070314_100%)] text-white font-sans selection:bg-purple-500/30">
      
      {/* Навігація / Логотип (ЗМІНЕНО: Повернуто вліво) */}
      <nav className="p-8 flex justify-start">
        <div className="flex flex-col items-start gap-2">
          {/* SVG Логотипу NX */}
          <div className="text-5xl font-thin tracking-widest text-[#a855f7] border border-[#a855f7]/30 p-4 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            N<span className="opacity-50">X</span>
          </div>
          <span className="text-xl font-bold tracking-[0.2em] text-[#e9d5ff]">NODUS</span>
        </div>
      </nav>

      {/* Головний контент */}
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Ліва колонка: Текст і кнопки */}
        <div className="flex-1 flex flex-col items-start gap-8 max-w-xl">
          
          {/* Бейдж "Powered by AI" */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-full px-5 py-2 backdrop-blur-md">
            <span className="text-yellow-200">✨</span>
            <span className="text-sm font-semibold tracking-wider text-purple-100">POWERED BY AI</span>
          </div>

          {/* Заголовок */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
            Achieve Any Goal With <br />
            AI-Generated Skill Trees
          </h1>

          {/* Опис */}
          <p className="text-lg text-purple-200/70 leading-relaxed">
            Transform your ambitions into interactive 2D constellations. 
            Break down complex goals, track your progress, and master any skill step-by-step.
          </p>

          {/* Кнопки завантаження (Прозорі з рамкою, сітка 2x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 w-full max-w-[500px]">
            
            {/* 1. App Store */}
            <a
              href="#"
              className="flex items-center justify-center gap-3 bg-white/5 border border-white/20 rounded-xl h-[60px] hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.95 5.39c.65-.78 1.09-1.86.97-2.94-.94.04-2.08.63-2.75 1.41-.58.67-1.09 1.77-.95 2.83 1.05.08 2.12-.53 2.73-1.3z"/>
              </svg>
              <div className="flex flex-col items-start justify-center">
                <span className="text-[9px] uppercase tracking-wide opacity-70 leading-tight">Download on the</span>
                <span className="text-[17px] font-semibold leading-tight">App Store</span>
              </div>
            </a>

            {/* 2. Windows */}
            <a
              href="#"
              className="flex items-center justify-center border border-purple-400/40 rounded-xl h-[60px] hover:bg-purple-500/20 hover:border-purple-300 transition-all backdrop-blur-sm"
            >
              <span className="text-[12px] font-bold tracking-widest text-purple-100 uppercase text-center leading-snug">
                DOWNLOAD FOR WINDOWS
              </span>
            </a>

            {/* 3. Google Play */}
            <a
              href="#"
              className="flex items-center justify-center gap-3 bg-white/5 border border-white/20 rounded-xl h-[60px] hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a1.455 1.455 0 0 1-.61-.168V1.982c.21-.115.42-.15.61-.168zm11.183 11.183l2.063 2.063-11.472 6.623 9.409-8.686zM4.19 2.915l11.472 6.623-2.063 2.063L4.19 2.915zm12.536 7.647l2.844 1.642c.818.472.818 1.243 0 1.715l-2.844 1.642-2.324-2.324 2.324-2.675z"/>
              </svg>
              <div className="flex flex-col items-start justify-center">
                <span className="text-[9px] uppercase tracking-wide opacity-70 leading-tight">Get it on</span>
                <span className="text-[17px] font-semibold leading-tight">Google Play</span>
              </div>
            </a>

            {/* 4. macOS */}
            <a
              href="#"
              className="flex items-center justify-center border border-purple-400/40 rounded-xl h-[60px] hover:bg-purple-500/20 hover:border-purple-300 transition-all backdrop-blur-sm"
            >
              <span className="text-[12px] font-bold tracking-widest text-purple-100 uppercase text-center leading-snug">
                DOWNLOAD FOR MACOS
              </span>
            </a>
            
          </div>
        </div>

        {/* Права колонка (Зображення) */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="aspect-[16/10] rounded-2xl border border-purple-500/20 overflow-hidden shadow-[0_0_40px_rgba(107,33,168,0.3)] relative bg-[#180b33]">
            
            <div className="absolute inset-0 bg-[url('/space.jpg')] bg-cover bg-center opacity-60 mix-blend-screen" />
            
            {/* Бейдж "Daily Streak" */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-purple-900/40 backdrop-blur-md border border-purple-400/30 rounded-full px-5 py-2 shadow-lg z-10">
              <span className="text-orange-400">🔥</span>
              <span className="text-xs font-bold text-purple-100 tracking-widest">DAILY STREAK</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}