import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Mic, QrCode, Activity, BarChart3, ShieldCheck, 
  Volume2, Copy, Check, Clock, User, CheckCircle2, Play, Pause, ChevronRight
} from 'lucide-react';

const BrandStyleboard = () => {
  const [copiedColor, setCopiedColor] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [activeTab, setActiveTab] = useState('student');
  const [isPlayingWave, setIsPlayingWave] = useState(true);

  // Colors requested
  const colors = [
    { name: 'Primary Blue', hex: '#4F6DF5', desc: 'Main branding, UI buttons & active states', text: '#FFFFFF' },
    { name: 'Soft Cyan', hex: '#2DDE8F', desc: 'Success indicators, resolved status', text: '#0F172A' },
    { name: 'Warm Yellow', hex: '#FFB72B', desc: 'Warning signals, pending categories', text: '#0F172A' },
    { name: 'Coral Red', hex: '#FF5C5C', desc: 'Emergency, urgent priority flags', text: '#FFFFFF' },
    { name: 'Soft Purple', hex: '#8E54E9', desc: 'AI operations, smart categorization', text: '#FFFFFF' },
    { name: 'Background', hex: '#F3F6FF', desc: 'Clean, light, spacious canvas', text: '#475569' }
  ];

  // Features requested
  const features = [
    { icon: Mic, title: 'Voice Complaint', desc: 'Record verbal complaints instantly with ambient-gain boosters.' },
    { icon: QrCode, title: 'QR Scan', desc: 'Scan hostel room QR codes to autofill wing, block, and room details.' },
    { icon: Activity, title: 'Real-time Updates', desc: 'Instant Socket.IO sync transitions and technician assignments.' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'Dynamic SVG visualization for category counts and response speeds.' },
    { icon: ShieldCheck, title: 'Secure & Reliable', desc: 'RBAC (Role Based Access Control), JWT tokens, and modular codebases.' }
  ];

  // Simulating transcription text typing effect
  useEffect(() => {
    const text = "Hey, my room's ceiling fan is making a clicking sound and starting to spark when switched on. Please repair it quickly.";
    let index = 0;
    let timer;

    if (isTranscribing) {
      setTranscriptionText('');
      timer = setInterval(() => {
        setTranscriptionText((prev) => prev + text.charAt(index));
        index++;
        if (index >= text.length) {
          clearInterval(timer);
          setTimeout(() => setIsTranscribing(false), 3000); // Wait and loop
        }
      }, 50);
    } else {
      const waitTimer = setTimeout(() => {
        setIsTranscribing(true);
      }, 2000);
      return () => clearTimeout(waitTimer);
    }

    return () => clearInterval(timer);
  }, [isTranscribing]);

  const handleCopyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F3F6FF] font-sans antialiased text-[#0F172A] selection:bg-[#4F6DF5]/20 p-4 md:p-12">
      {/* Header bar */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4F6DF5] hover:text-[#4F6DF5]/80 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Application
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight font-poppins bg-gradient-to-r from-[#4F6DF5] to-[#8E54E9] text-transparent bg-clip-text">
            HostelVoice Brand Board
          </h1>
          <p className="text-sm text-[#475569] mt-1">Behance-style Visual Identity & Design System Specification Sheet</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-white border border-[#e2e8f0] text-xs font-semibold rounded-full text-[#4F6DF5]">
            v1.0.0 Stable
          </span>
          <span className="px-3 py-1 bg-[#4F6DF5] text-white text-xs font-semibold rounded-full">
            Premium Startup System
          </span>
        </div>
      </header>

      {/* Grid container: Pinterest Masonry-Style Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* SECTION 1: LARGE LOGO SHOWCASE */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[320px] transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4F6DF5]/5 to-transparent rounded-full blur-2xl"></div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">01 / LOGOMARK SHOWCASE</span>
            <div className="flex items-center gap-3.5 mt-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F6DF5] to-[#8E54E9] p-3.5 flex items-center justify-center shadow-lg shadow-[#4F6DF5]/25 relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0.5 bg-white/10 rounded-[14px] blur-[1px]"></div>
                <div className="relative flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white stroke-[2.5]" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2DDE8F] rounded-full border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight font-poppins">
                  Hostel<span className="text-[#4F6DF5]">Voice</span>
                </h2>
                <div className="flex gap-1.5 mt-1">
                  <span className="w-1 h-3 bg-[#4F6DF5] rounded-full animate-bounce"></span>
                  <span className="w-1 h-4 bg-[#8E54E9] rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1 h-5 bg-[#2DDE8F] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-3 bg-[#FFB72B] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1 h-2 bg-[#FF5C5C] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[#0F172A] font-semibold text-lg italic tracking-wide font-poppins">
              “Smart. Simple. Sorted.”
            </div>
            <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
              Synthesizing acoustic recording algorithms and real-time dashboard queues into an elegant university complaint framework.
            </p>
          </div>
        </section>

        {/* SECTION 2: SECONDARY BRAND CARD */}
        <section className="bg-gradient-to-tr from-[#4F6DF5] via-[#6B52EE] to-[#8E54E9] rounded-3xl p-8 shadow-lg shadow-[#4F6DF5]/15 flex flex-col justify-between min-h-[320px] text-white transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">02 / BRAND IDENTITY MOCK</span>
            <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold tracking-wider">
              SAAS DOCK
            </div>
          </div>
          <div className="flex flex-col items-center justify-center my-6">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 relative">
              <Mic className="w-10 h-10 text-[#4F6DF5] stroke-[2.5]" />
              <div className="absolute top-2 right-2 w-3 h-3 bg-[#2DDE8F] rounded-full"></div>
            </div>
            <h3 className="font-poppins font-bold text-xl mt-4 tracking-wider">HostelVoice App</h3>
            <p className="text-xs text-white/70 text-center max-w-[200px] mt-1">Premium brand card signature background system</p>
          </div>
          <div className="flex justify-between items-center text-[10px] text-white/55 border-t border-white/10 pt-3">
            <span>© 2026 HOSTELVOICE LABS</span>
            <span className="font-mono">#4F6DF5 #8E54E9</span>
          </div>
        </section>

        {/* SECTION 3: HERO ILLUSTRATION CARD */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[320px] transition-all hover:shadow-md hover:border-[#4F6DF5]/20 overflow-hidden relative">
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#F3F6FF] to-transparent z-0"></div>
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">03 / HERO ILLUSTRATION CONCEPT</span>
            <h3 className="text-xl font-bold font-poppins mt-4 leading-snug">
              “Your voice. Our responsibility.”
            </h3>
            <p className="text-xs text-[#475569] mt-1">AI-Powered Hostel Complaint Management System</p>
          </div>

          {/* Flat Styled illustration simulation using modern SVGs and absolute chips */}
          <div className="relative h-28 my-2 z-10 flex items-center justify-center gap-4">
            <div className="w-20 h-24 bg-gradient-to-b from-[#2DDE8F]/10 to-[#2DDE8F]/5 rounded-t-2xl border-t border-x border-[#2DDE8F]/30 flex flex-col items-center justify-center p-2 relative shadow-inner">
              <div className="w-8 h-8 rounded-full bg-[#2DDE8F]/20 flex items-center justify-center text-xs font-bold text-[#2DDE8F]">ST</div>
              <span className="text-[8px] text-[#475569] mt-1 font-bold">Student</span>
              <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-[#2DDE8F] text-[7px] text-white rounded font-bold">Online</div>
            </div>
            
            <div className="w-24 h-28 bg-[#4F6DF5]/10 rounded-t-3xl border-t border-x border-[#4F6DF5]/30 flex flex-col items-center justify-center p-2 relative shadow-inner">
              <div className="w-10 h-10 rounded-full bg-[#4F6DF5]/20 flex items-center justify-center text-sm font-bold text-[#4F6DF5] animate-pulse">AI</div>
              <span className="text-[9px] text-[#4F6DF5] mt-1 font-extrabold font-poppins">HostelVoice AI</span>
              <span className="text-[7px] text-[#475569]/70 italic mt-0.5">Categorizing...</span>
            </div>

            <div className="w-20 h-24 bg-gradient-to-b from-[#8E54E9]/10 to-[#8E54E9]/5 rounded-t-2xl border-t border-x border-[#8E54E9]/30 flex flex-col items-center justify-center p-2 relative shadow-inner">
              <div className="w-8 h-8 rounded-full bg-[#8E54E9]/20 flex items-center justify-center text-xs font-bold text-[#8E54E9]">AD</div>
              <span className="text-[8px] text-[#475569] mt-1 font-bold">Admin</span>
              <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-[#8E54E9] text-[7px] text-white rounded font-bold">Alert</div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-[#475569] italic text-center">
            Friendly, flat vectors highlighting collaborative transparency.
          </div>
        </section>

        {/* SECTION 4: MOBILE APP MOCKUP */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[460px] lg:row-span-2 transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">04 / STUDENT MOBILE UI</span>
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-0.5 bg-[#4F6DF5]/10 text-[#4F6DF5] text-[9px] font-bold rounded">MOBILE DEVICE PORT</span>
              <span className="px-2 py-0.5 bg-[#2DDE8F]/10 text-[#2DDE8F] text-[9px] font-bold rounded">LIGHT MODE</span>
            </div>
          </div>

          {/* Interactive Mobile viewport container */}
          <div className="my-6 mx-auto w-[240px] h-[340px] bg-slate-50 rounded-[32px] border-4 border-[#0F172A] p-3 shadow-xl relative overflow-hidden flex flex-col justify-between select-none">
            {/* Top speaker capsule */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-[#0F172A] rounded-full z-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white/20 rounded-full absolute right-2"></div>
            </div>

            {/* Simulated app screen header */}
            <div className="mt-2 flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#475569]/60 block font-bold">WELCOME BACK</span>
                <span className="text-[10px] font-extrabold font-poppins text-[#0F172A]">Aravind Kumar</span>
              </div>
              <span className="w-6 h-6 rounded-full bg-[#4F6DF5]/10 flex items-center justify-center text-[9px] font-bold text-[#4F6DF5] border border-[#4F6DF5]/20">
                A
              </span>
            </div>

            {/* Mobile analytics card */}
            <div className="bg-white rounded-xl p-2.5 shadow-sm border border-[#e2e8f0] mt-3">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-[#475569]/80">MY RECENT FILINGS</span>
                <span className="text-[7px] text-[#4F6DF5] font-bold">VIEW ALL</span>
              </div>
              <div className="mt-2 flex gap-1.5 items-center justify-between">
                <div>
                  <h4 className="text-[9px] font-bold text-[#0F172A] truncate w-28">Fan Sparking in Room 204</h4>
                  <p className="text-[7px] text-[#475569] mt-0.5">Submitted via Audio AI</p>
                </div>
                <span className="px-1.5 py-0.5 bg-[#FF5C5C]/10 text-[#FF5C5C] text-[6px] font-bold border border-[#FF5C5C]/20 rounded">
                  HIGH
                </span>
              </div>
            </div>

            {/* Mobile center audio recorder mock */}
            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#4F6DF5] flex items-center justify-center shadow-lg shadow-[#4F6DF5]/40 relative group-hover:scale-105 transition-all cursor-pointer">
                {/* Simulated pulse wave */}
                <div className="absolute inset-0 bg-[#4F6DF5] rounded-full scale-110 animate-ping opacity-25"></div>
                <Mic className="w-7 h-7 text-white stroke-[2.5]" />
              </div>
              <span className="text-[8px] font-bold text-[#4F6DF5] mt-3.5 tracking-widest uppercase">TAP TO RECORD ISSUE</span>
              <span className="text-[6.5px] text-[#475569]/70 mt-0.5">Auto-scaled dynamic gain capture</span>
            </div>

            {/* Bottom menu bar */}
            <div className="bg-white border-t border-[#e2e8f0] p-1.5 rounded-b-[20px] -mx-3 -mb-3 flex justify-around items-center">
              <div className="flex flex-col items-center gap-0.5">
                <Mic className="w-3.5 h-3.5 text-[#4F6DF5]" />
                <span className="text-[6px] font-bold text-[#4F6DF5]">SUBMIT</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 opacity-40">
                <Activity className="w-3.5 h-3.5 text-[#475569]" />
                <span className="text-[6px] font-bold">SYNC</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 opacity-40">
                <User className="w-3.5 h-3.5 text-[#475569]" />
                <span className="text-[6px] font-bold">PROFILE</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold font-poppins">Premium Mobile-First Screen</h4>
            <p className="text-xs text-[#475569] mt-1">
              Optimized for students filing verbal claims on noisy campuses. The glowing center button initiates safe audio encoders.
            </p>
          </div>
        </section>

        {/* SECTION 5: ADMIN DASHBOARD MOCKUP */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[460px] lg:col-span-2 transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">05 / SAAS ADMIN PORTAL VIEW</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveTab('student')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'student' ? 'bg-[#4F6DF5] text-white' : 'bg-[#F3F6FF] text-[#475569]'}`}
                >
                  Dashboard Metrics
                </button>
                <button 
                  onClick={() => setActiveTab('complaints')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === 'complaints' ? 'bg-[#4F6DF5] text-white' : 'bg-[#F3F6FF] text-[#475569]'}`}
                >
                  Real-time Data
                </button>
              </div>
            </div>
          </div>

          {/* SaaS Viewport Simulator */}
          <div className="my-6 bg-slate-50 border border-[#e2e8f0] rounded-2xl p-4 shadow-inner flex gap-3 h-[250px] overflow-hidden select-none">
            {/* Left Admin sidebar mock */}
            <div className="w-32 bg-white rounded-xl border border-[#e2e8f0] p-2 flex flex-col justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="font-poppins font-extrabold text-[10px] bg-gradient-to-r from-[#4F6DF5] to-[#8E54E9] text-transparent bg-clip-text">HostelVoice</span>
                <div className="w-full h-px bg-slate-100 my-1"></div>
                <div className="px-1.5 py-1 bg-[#4F6DF5]/5 text-[#4F6DF5] text-[8px] font-bold rounded flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3" /> Dashboard
                </div>
                <div className="px-1.5 py-1 text-[#475569]/60 text-[8px] font-bold rounded flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Complaints
                </div>
              </div>
              <div className="flex items-center gap-1.5 border-t border-slate-100 pt-1.5 mt-auto">
                <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[7px] font-bold">A</span>
                <span className="text-[7.5px] font-bold text-[#0F172A] truncate">Admin Console</span>
              </div>
            </div>

            {/* Right main body content */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto">
              {activeTab === 'student' ? (
                /* Tab 1: Charts Dashboard */
                <div className="flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#0F172A]">AI Complaint Performance Summary</span>
                    <span className="text-[8px] text-[#2DDE8F] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2DDE8F] animate-ping"></span> Live Sync Enabled
                    </span>
                  </div>

                  {/* SVG metrics charts grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-xl p-2 border border-[#e2e8f0] text-center">
                      <span className="text-[7px] text-[#475569] font-bold block uppercase">Resolution Rate</span>
                      <strong className="text-sm font-poppins text-[#2DDE8F] mt-0.5 block">94.8%</strong>
                      <span className="text-[5.5px] text-[#475569]/60 mt-0.5 block">⚡ Fast Turnaround</span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-[#e2e8f0] text-center">
                      <span className="text-[7px] text-[#475569] font-bold block uppercase">Response Avg</span>
                      <strong className="text-sm font-poppins text-[#4F6DF5] mt-0.5 block">2.4 Hrs</strong>
                      <span className="text-[5.5px] text-[#475569]/60 mt-0.5 block">🎓 Target exceeded</span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-[#e2e8f0] text-center">
                      <span className="text-[7px] text-[#475569] font-bold block uppercase">Total Handled</span>
                      <strong className="text-sm font-poppins text-[#8E54E9] mt-0.5 block">142 Cases</strong>
                      <span className="text-[5.5px] text-[#475569]/60 mt-0.5 block">📂 SQLite Database</span>
                    </div>
                  </div>

                  {/* Large custom SVG chart illustrating weekly counts */}
                  <div className="bg-white rounded-xl p-2 border border-[#e2e8f0] flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[7px] text-[#475569] font-bold">
                      <span>WEEKLY RESOLUTIONS TREND</span>
                      <span className="text-[#4F6DF5] font-mono">15 May - 22 May</span>
                    </div>
                    {/* Simulated vector line graph */}
                    <div className="h-10 mt-1 relative flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0 18 Q 15 15, 30 10 T 60 12 T 90 2 T 100 4" fill="none" stroke="#4F6DF5" strokeWidth="1.5" />
                        <path d="M0 18 Q 15 15, 30 10 T 60 12 T 90 2 T 100 4 L 100 20 L 0 20 Z" fill="url(#blueGrad)" opacity="0.15" />
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F6DF5" />
                            <stop offset="100%" stopColor="#ffffff" />
                          </linearGradient>
                        </defs>
                        {/* Dot marks */}
                        <circle cx="30" cy="10" r="1.5" fill="#4F6DF5" />
                        <circle cx="90" cy="2" r="1.5" fill="#2DDE8F" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[6px] text-[#475569]/60 font-semibold font-mono mt-0.5">
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                      <span>SUN</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: Recent dynamic list */
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#0F172A]">Real-Time Activity Feed</span>
                    <span className="text-[7.5px] font-bold px-1.5 py-0.5 bg-[#4F6DF5]/10 text-[#4F6DF5] border border-[#4F6DF5]/20 rounded">JWT Authenticated</span>
                  </div>
                  
                  {/* Complaints rows */}
                  <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
                    <div className="bg-white rounded-lg p-1.5 border border-[#e2e8f0] flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="px-1 bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 text-[#FF5C5C] text-[5px] font-bold rounded uppercase">Electrical</span>
                          <span className="text-[7px] text-[#0F172A] font-bold">Sparking switchboard - C Wing</span>
                        </div>
                        <span className="text-[5.5px] text-[#475569]/70 block mt-0.5">File attached • Submitted 2 mins ago</span>
                      </div>
                      <span className="text-[6.5px] font-bold text-amber-500 uppercase px-1 py-0.5 bg-amber-500/5 rounded">Assigned</span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-1.5 border border-[#e2e8f0] flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="px-1 bg-[#2DDE8F]/10 border border-[#2DDE8F]/20 text-[#2DDE8F] text-[5px] font-bold rounded uppercase">Plumbing</span>
                          <span className="text-[7px] text-[#0F172A] font-bold">Water leak bathroom - Room 102</span>
                        </div>
                        <span className="text-[5.5px] text-[#475569]/70 block mt-0.5">No attachment • Submitted 10 mins ago</span>
                      </div>
                      <span className="text-[6.5px] font-bold text-[#2DDE8F] uppercase px-1 py-0.5 bg-[#2DDE8F]/5 rounded">Resolved</span>
                    </div>

                    <div className="bg-white rounded-lg p-1.5 border border-[#e2e8f0] flex justify-between items-center opacity-70">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="px-1 bg-[#8E54E9]/10 border border-[#8E54E9]/20 text-[#8E54E9] text-[5px] font-bold rounded uppercase">Cleaning</span>
                          <span className="text-[7px] text-[#0F172A] font-bold">Garbage overflowing lobby</span>
                        </div>
                        <span className="text-[5.5px] text-[#475569]/70 block mt-0.5">Submitted 1 hr ago</span>
                      </div>
                      <span className="text-[6.5px] font-bold text-slate-400 uppercase px-1 py-0.5 bg-slate-100 rounded">Pending</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold font-poppins">Premium Admin SaaS Workspace</h4>
            <p className="text-xs text-[#475569] mt-1">
              A comprehensive administrative web dashboard featuring calculated dynamic values, responsive SVG timeline trends, and granular SQLite details.
            </p>
          </div>
        </section>

        {/* SECTION 6: VOICE COMPLAINT SCREEN */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[320px] transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">06 / LIVE SPEECH DIALOGUE</span>
            <div className="flex justify-between items-center mt-3">
              <span className="text-[10px] font-semibold text-[#8E54E9] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#8E54E9] rounded-full animate-ping"></span> Live Audio Transcription
              </span>
              <button 
                onClick={() => setIsPlayingWave(!isPlayingWave)}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                title={isPlayingWave ? "Pause Waveform" : "Play Waveform"}
              >
                {isPlayingWave ? <Pause className="w-3 h-3 text-[#475569]" /> : <Play className="w-3 h-3 text-[#475569]" />}
              </button>
            </div>
          </div>

          {/* simulated waveform panel */}
          <div className="my-4 bg-slate-50 rounded-2xl p-4 border border-[#e2e8f0] relative">
            <div className="flex items-center gap-1.5 h-8 justify-center">
              {[...Array(24)].map((_, i) => {
                // Generate standard waveform bar heights
                const heights = [10, 24, 14, 32, 18, 40, 28, 48, 36, 56, 42, 64, 52, 40, 28, 44, 32, 20, 36, 24, 12, 22, 14, 8];
                const animDuration = `${1.2 + (i % 5) * 0.2}s`;
                const delay = `${(i % 4) * 0.15}s`;
                
                return (
                  <span 
                    key={i} 
                    className="w-1 rounded-full bg-[#4F6DF5]" 
                    style={{ 
                      height: `${heights[i % heights.length] * 0.5}px`,
                      animation: isPlayingWave ? `waveformPulse ${animDuration} infinite ease-in-out` : 'none',
                      animationDelay: delay
                    }}
                  ></span>
                );
              })}
            </div>
            
            {/* Simulated Live typing transcription box */}
            <div className="mt-3.5 bg-white border border-slate-100 rounded-xl p-2.5 min-h-[50px] shadow-sm flex items-start gap-2">
              <span className="text-[10px] text-[#475569] font-mono select-all flex-1 leading-relaxed">
                {transcriptionText || <span className="text-[#475569]/40 italic">Initializing speech pipeline...</span>}
                <span className="w-1.5 h-3 bg-[#4F6DF5] inline-block animate-pulse ml-0.5"></span>
              </span>
            </div>

            {/* Simulated Dynamic Tag results */}
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[9px]">
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-[#8E54E9]/10 text-[#8E54E9] font-bold rounded">Category: Electrical</span>
                <span className="px-2 py-0.5 bg-[#FF5C5C]/10 text-[#FF5C5C] font-bold rounded">Priority: HIGH</span>
              </div>
              <span className="text-[#2DDE8F] font-bold font-poppins">Confidence: 98%</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold font-poppins">Voice Complaint Screen</h4>
            <p className="text-xs text-[#475569] mt-1">
              Proprietary dynamic gain compiler records clear audio, which bypasses secure-contexts on client frameworks to trigger quick SQLite updates.
            </p>
          </div>
        </section>

        {/* SECTION 7: TYPOGRAPHY SECTION */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[320px] transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">07 / TYPOGRAPHY SHOWCASE</span>
            <div className="flex justify-between items-baseline mt-4">
              <h3 className="text-3xl font-extrabold font-poppins text-[#4F6DF5]">Poppins</h3>
              <span className="text-xs text-[#475569]/70 font-medium font-poppins">Google Font Family</span>
            </div>
          </div>

          <div className="my-5 bg-[#F3F6FF] rounded-2xl p-4 border border-[#e2e8f0]/40">
            <div className="font-poppins text-xs font-semibold tracking-wider text-[#475569] border-b border-slate-200 pb-2 mb-3">
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-poppins font-light text-[#475569]">Poppins Light - 300</span>
                <span className="font-mono text-[#475569]/50">tagline</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-poppins font-normal text-[#0F172A]">Poppins Regular - 400</span>
                <span className="font-mono text-[#475569]/50">paragraphs</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-poppins font-semibold text-[#0F172A]">Poppins SemiBold - 600</span>
                <span className="font-mono text-[#475569]/50">subheaders</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-poppins font-extrabold text-[#0F172A]">Poppins ExtraBold - 800</span>
                <span className="font-mono text-[#475569]/50">main_titles</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold font-poppins">Rounded Startup Typography</h4>
            <p className="text-xs text-[#475569] mt-1">
              Poppins brings a friendly, highly-approachable, geometry-based feel to dashboard cards and titles.
            </p>
          </div>
        </section>

        {/* SECTION 8: COLOR PALETTE SECTION */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[320px] transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">08 / COLOR PALETTE SYSTEM</span>
            <p className="text-xs text-[#475569] mt-1">Click color swatches to copy Hex value</p>
          </div>

          {/* Grid of round swatches */}
          <div className="grid grid-cols-3 gap-3 my-4">
            {colors.map((color, index) => {
              const isCopied = copiedColor === color.hex;
              return (
                <div 
                  key={index}
                  onClick={() => handleCopyColor(color.hex)}
                  className="bg-white border border-[#e2e8f0] rounded-xl p-2 flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm group/swatch"
                >
                  <div 
                    className="w-10 h-10 rounded-full border border-slate-900/5 shadow-inner relative flex items-center justify-center transition-transform duration-300 group-hover/swatch:rotate-12"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-white drop-shadow" style={{ color: color.hex === '#F3F6FF' ? '#4F6DF5' : '#ffffff' }} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white opacity-0 group-hover/swatch:opacity-80 transition-opacity drop-shadow" style={{ color: color.hex === '#F3F6FF' ? '#4F6DF5' : '#ffffff' }} />
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-[#0F172A] mt-1.5 block truncate max-w-[70px]">{color.name}</span>
                  <span className="text-[7.5px] font-mono text-[#475569]/60 mt-0.5">{color.hex}</span>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="text-sm font-bold font-poppins">Pastel-Modern Tones</h4>
            <p className="text-xs text-[#475569] mt-1">
              Harmoniously curated, high-end hex colors inspired by Airbnb, Linear, and Notion system layouts.
            </p>
          </div>
        </section>

        {/* SECTION 9: FEATURE ICONS SECTION */}
        <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[320px] transition-all hover:shadow-md hover:border-[#4F6DF5]/20 group">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#475569]/60">09 / FEATURE VECTOR ICONS</span>
            <p className="text-xs text-[#475569] mt-1">Minimal rounded micro-interaction items</p>
          </div>

          {/* Flex horizontal icons */}
          <div className="flex flex-col gap-2.5 my-4">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="flex items-center gap-3 bg-[#F3F6FF]/60 rounded-xl p-2 border border-[#e2e8f0]/40 transition-colors hover:bg-white hover:border-[#4F6DF5]/20 group/icon">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center text-[#4F6DF5] shadow-sm group-hover/icon:bg-[#4F6DF5] group-hover/icon:text-white transition-colors duration-300">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h5 className="text-[9px] font-bold text-[#0F172A] font-poppins">{feat.title}</h5>
                    <p className="text-[7.5px] text-[#475569] leading-tight mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="text-sm font-bold font-poppins">Premium UI Graphics</h4>
            <p className="text-xs text-[#475569] mt-1">
              Exquisitely structured clean rounded items designed specifically to maximize visual clarity and speed.
            </p>
          </div>
        </section>

      </main>

      {/* Styled css animation rules for waveform pulse */}
      <style>{`
        @keyframes waveformPulse {
          0%, 100% { transform: scaleY(0.7); opacity: 0.85; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
      `}</style>

      {/* Branding footer case study marker */}
      <footer className="mt-16 pt-8 border-t border-[#e2e8f0] text-center max-w-7xl mx-auto">
        <p className="text-xs text-[#475569] font-poppins">
          HostelVoice UI/UX Styleboard Presentation Board • Designed for Behance & Dribbble Platforms.
        </p>
        <p className="text-[10px] text-[#475569]/60 font-mono mt-1">
          Stack: React, Tailwind CSS 4.0, Lucide Icons, Google Poppins
        </p>
      </footer>
    </div>
  );
};

export default BrandStyleboard;
