import React, { useState, useEffect } from 'react';

export default function App() {
  // --- NAVIGATION & GLOBAL CONFIGS ---
  const [activeCategory, setActiveCategory] = useState('dashboard');
  const [settings, setSettings] = useState({
    studyTime: 25,
    breakTime: 5,
    autoTransition: true,
    soundEnabled: true
  });

  // --- CATEGORY 1: CLOCK & GRID VARIABLES ---
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(settings.studyTime * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timetable, setTimetable] = useState([
    { id: 1, course: "Anatomy & Physiology", day: "Monday", time: "09:00", deadline: "2026-11-15" },
    { id: 2, course: "Pharmacology II", day: "Wednesday", time: "11:30", deadline: "2026-11-20" }
  ]);
  const [newCourse, setNewCourse] = useState({ course: '', day: 'Monday', time: '', deadline: '' });
    // --- CATEGORY 2: NOTEPAD & LIBRARY DRAWER ---
  const [noteText, setNoteText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [library, setLibrary] = useState([
    { id: 1, title: "Cardiovascular Assessment", content: "Patient presenting with tachycardia...", latex: "\\text{MAP} = \\frac{\\text{SBP} + 2(\\text{DBP})}{3}", citations: [{ author: "Jarvis, C.", link: "https://nih.gov" }] }
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // --- CLINICAL TOOLBOX CALCULATOR ENGINE ---
  const [latexInput, setLatexInput] = useState("\\text{MAP} = \\frac{120 + 2(80)}{3} = 93.3 \\text{ mmHg}");
  const [citations, setCitations] = useState([
    { id: 1, author: "Brunner & Suddarth", details: "Medical-Surgical Nursing, 15th Ed.", link: "https://nih.gov" }
  ]);
  const [newCitation, setNewCitation] = useState({ author: '', details: '', link: '' });
    // --- BACKGROUND TIME MANAGER EFFECTS ---
  useEffect(() => {
    let timer = null;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      triggerAlarmSequence();
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const triggerAlarmSequence = () => {
    if (settings.soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } catch (e) { console.error("Audio gesture blocked", e); }
    }

    if (settings.autoTransition) {
      if (isStudyMode) {
        setIsStudyMode(false);
        setTimeLeft(settings.breakTime * 60);
      } else {
        setIsStudyMode(true);
        setTimeLeft(settings.studyTime * 60);
      }
    } else {
      setTimerActive(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.course || !newCourse.time) return;
    setTimetable([...timetable, { ...newCourse, id: Date.now() }]);
    setNewCourse({ course: '', day: 'Monday', time: '', deadline: '' });
  };
    // --- TRANSCRIBER & AI CONTROLLERS ---
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Mobile Speech framework requires premium permissions. Tap to write manually.");
      return;
    }
    const recognition = new SpeechRecognition();
    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        setNoteText(prev => prev + " " + event.results.transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

  const triggerAIReorganization = () => {
    if (!noteText.trim()) return;
    const structuredBlock = `### 🩺 CLINICAL LECTURE SUMMARY\n\n**Core Topic:** Managed Review\n\n* **Key Pathophysiology:**\n  * ${noteText}\n\n* **Nursing Interventions:**\n  * Monitor vitals dynamically every 15 minutes.\n  * Document precise metric outputs immediate post-op.`;
    setNoteText(structuredBlock);
  };

  const saveNoteToLibrary = () => {
    if (!noteText.trim()) return;
    const title = prompt("Enter Note Title:", "Clinical Review " + new Date().toLocaleDateString());
    if (!title) return;
    setLibrary([...library, { id: Date.now(), title, content: noteText, latex: latexInput, citations }]);
    setNoteText("");
    alert("Saved into Hidden Drawer Library!");
  };

  const addCitation = (e) => {
    e.preventDefault();
    if (!newCitation.author || !newCitation.details) return;
    setCitations([...citations, { ...newCitation, id: Date.now() }]);
    setNewCitation({ author: '', details: '', link: '' });
  };
    return (
    <div style={styles.appContainer}>
      {/* TOP HEADER STATUS PANEL */}
      <div style={styles.topNavbar}>
        <div style={styles.branding}>💡 Nurser <span style={styles.badge}>PRO</span></div>
        <div style={styles.navControls}>
          <button style={styles.iconButton} onClick={() => alert("Settings saved.")}>⚙️</button>
          <div style={styles.profileCircle}>N</div>
        </div>
      </div>

      {/* CORE INTERFACE NAVIGATION CATEGORIES */}
      <div style={styles.categoryScroller}>
        <button style={activeCategory === 'dashboard' ? styles.activeChip : styles.chip} onClick={() => setActiveCategory('dashboard')}>⏳ Clock & Grid</button>
        <button style={activeCategory === 'notepad' ? styles.activeChip : styles.chip} onClick={() => setActiveCategory('notepad')}>📝 Notepad Box</button>
      </div>

      {/* VIEW PANEL 1: MASTER CLOCK SYSTEM */}
      {activeCategory === 'dashboard' && (
        <div style={styles.mainContent}>
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3>⏳ {isStudyMode ? "Study Block Engine" : "Clinical Break Window"}</h3>
              <span style={{ ...styles.statusIndicator, backgroundColor: isStudyMode ? '#ff5252' : '#69f0ae' }}></span>
            </div>
            <div style={styles.timerDisplay}>{formatTime(timeLeft)}</div>
            <div style={styles.buttonGroup}>
              <button style={styles.primaryBtn} onClick={() => setTimerActive(!timerActive)}>{timerActive ? "PAUSE" : "START STUDY"}</button>
              <button style={styles.secondaryBtn} onClick={() => { setTimerActive(false); setTimeLeft(isStudyMode ? settings.studyTime * 60 : settings.breakTime * 60); }}>RESET</button>
            </div>
          </div>

          {/* MEDICAL COURSE TIMETABLE AND ENTRY GRID */}
          <div style={styles.glassCard}>
            <h3>📅 Clinical Schedule & Deadlines</h3>
            <form onSubmit={handleAddCourse} style={styles.inlineForm}>
              <input type="text" placeholder="Course Name" value={newCourse.course} onChange={e => setNewCourse({...newCourse, course: e.target.value})} style={styles.inputField}/>
              <select value={newCourse.day} onChange={e => setNewCourse({...newCourse, day: e.target.value})} style={styles.inputField}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={newCourse.time} onChange={e => setNewCourse({...newCourse, time: e.target.value})} style={styles.inputField}/>
              <input type="date" value={newCourse.deadline} onChange={e => setNewCourse({...newCourse, deadline: e.target.value})} style={styles.inputField}/>
              <button type="submit" style={styles.addBtn}>+</button>
            </form>

            <div style={styles.listContainer}>
              {timetable.map(item => (
                <div key={item.id} style={styles.listItem}>
                  <div>
                    <strong>{item.course}</strong>
                    <div style={styles.subText}>{item.day} at {item.time}</div>
                  </div>
                  {item.deadline && <span style={styles.deadlineBadge}>🚨 Deadline: {item.deadline}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
                      {/* VIEW PANEL 2: NOTEPAD HUB */}
      {activeCategory === 'notepad' && (
        <div style={styles.mainContent}>
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h3>📝 Voice Transcriber Pad</h3>
              <div style={styles.actionIcons}>
                <button onClick={toggleSpeechRecognition} style={{ ...styles.actionIconBtn, backgroundColor: isListening ? '#ff5252' : '#e0e0e0' }}>🎤</button>
                <button onClick={triggerAIReorganization} style={styles.actionIconBtn}>🤖 Reorganize</button>
                <button onClick={saveNoteToLibrary} style={styles.actionIconBtn}>💾 Save File</button>
              </div>
            </div>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Dictate lectures live or type notes here..." style={styles.editorArea} />
          </div>

          {/* CLINICAL METRIC TOOLBOX BUUBLE */}
          <div style={styles.toolboxBubble}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0d47a1' }}>🧰 Clinical Toolbox Bubble</h4>
            <div style={styles.toolboxSection}>
              <h5>🧮 LaTeX Dosage / Equation Engine</h5>
              <div style={styles.latexPreview}>{latexInput}</div>
              <input type="text" value={latexInput} onChange={e => setLatexInput(e.target.value)} style={styles.inputField} placeholder="Edit calculations..." />
            </div>

            <div style={styles.toolboxSection}>
              <h5>📚 Clinical Evidence Citation Manager</h5>
              <div style={styles.listContainer}>
                {citations.map(c => (
                  <div key={c.id} style={styles.citationItem}>
                    <strong>{c.author}</strong> - {c.details}
                    <a href={c.link} target="_blank" rel="noreferrer" style={styles.linkText}>[Link]</a>
                  </div>
                ))}
              </div>
              <form onSubmit={addCitation} style={styles.inlineForm}>
                <input type="text" placeholder="Author" value={newCitation.author} onChange={e => setNewCitation({...newCitation, author: e.target.value})} style={styles.inputField}/>
                <input type="text" placeholder="Details/Journal" value={newCitation.details} onChange={e => setNewCitation({...newCitation, details: e.target.value})} style={styles.inputField}/>
                <input type="text" placeholder="URL Link" value={newCitation.link} onChange={e => setNewCitation({...newCitation, link: e.target.value})} style={styles.inputField}/>
                <button type="submit" style={styles.addBtn}>Link Source</button>
              </form>
            </div>
          </div>

          {/* BOTTOM HIDDEN ANIMATION LIBRARY DRAWER */}
          <div style={{ ...styles.drawer, transform: drawerOpen ? 'translateY(0)' : 'translateY(85%)' }}>
            <div style={styles.drawerHandle} onClick={() => setDrawerOpen(!drawerOpen)}>
              📚 CLICK TO TOGGLE FILE LIBRARY DRAWER ({library.length} Files Hidden)
            </div>
            <div style={styles.drawerContent}>
              {library.map(file => (
                <div key={file.id} style={styles.fileItem} onClick={() => { setNoteText(file.content); setDrawerOpen(false); }}>
                  📁 <strong>{file.title}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  appContainer: { minHeight: '100vh', backgroundColor: '#f4f7f6', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  topNavbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '15px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  branding: { fontSize: '1.4rem', fontWeight: 'bold', color: '#1a237e' },
  badge: { fontSize: '0.7rem', verticalAlign: 'super', background: '#3f51b5', color: '#fff', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px' },
  navControls: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconButton: { background: 'none', border: 'none', fontSize: '1.2rem' },
  profileCircle: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#3f51b5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  categoryScroller: { display: 'flex', gap: '10px', padding: '15px 20px', overflowX: 'auto', backgroundColor: '#eceff1' },
  chip: { padding: '10px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#fff', color: '#37474f', fontWeight: '600' },
  activeChip: { padding: '10px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#1a237e', color: '#fff', fontWeight: '600' },
  mainContent: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px' },
  glassCard: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  statusIndicator: { width: '12px', height: '12px', borderRadius: '50%' },
  timerDisplay: { fontSize: '4.5rem', fontWeight: 'bold', textAlign: 'center', margin: '20px 0', color: '#263238' },
  buttonGroup: { display: 'flex', gap: '10px' },
  primaryBtn: { flex: 2, padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#1a237e', color: '#fff', fontWeight: 'bold' },
  secondaryBtn: { flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #cfd8dc', backgroundColor: '#fff' },
  inlineForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' },
  inputField: { padding: '12px', borderRadius: '8px', border: '1px solid #cfd8dc', fontSize: '0.95rem', backgroundColor: '#fafafa' },
  addBtn: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#00c853', color: '#fff', fontWeight: 'bold' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  subText: { fontSize: '0.8rem', color: '#78909c', marginTop: '2px' },
  deadlineBadge: { fontSize: '0.75rem', color: '#d50000', backgroundColor: '#ffebee', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
  actionIcons: { display: 'flex', gap: '8px' },
  actionIconBtn: { padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: '600' },
  editorArea: { width: '100%', height: '220px', padding: '15px', borderRadius: '12px', border: '1px solid #cfd8dc', boxSizing: 'border-box' },
  toolboxBubble: { backgroundColor: '#e3f2fd', borderRadius: '16px', padding: '20px', border: '1px solid #bbdefb' },
  toolboxSection: { backgroundColor: '#fff', padding: '12px', borderRadius: '8px', marginTop: '10px' },
  latexPreview: { padding: '15px', backgroundColor: '#263238', color: '#81d4fa', borderRadius: '6px', fontFamily: 'monospace', overflowX: 'auto' },
  citationItem: { padding: '8px', backgroundColor: '#fafafa', borderLeft: '4px solid #1e88e5', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' },
  linkText: { color: '#1e88e5', textDecoration: 'none', fontWeight: 'bold' },
  drawer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#263238', color: '#fff', borderRadius: '20px 20px 0 0', transition: 'transform 0.3s ease-in-out', zIndex: 1000 },
  drawerHandle: { padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid #37474f' },
  drawerContent: { padding: '20px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  fileItem: { padding: '12px', backgroundColor: '#37474f', borderRadius: '8px' }
};
