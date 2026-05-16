import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BionicView } from './components/BionicView';
import { Controls } from './components/Controls';
import { Library } from './components/Library';
import {
  DEFAULT_SETTINGS,
  buildShareUrl,
  deleteDoc,
  getDoc,
  listDocs,
  readShareFromHash,
  saveDoc,
  type DocSettings,
  type SavedDoc,
} from './lib/library';
import { createTTS, type TTSState } from './lib/tts';
import './styles/global.css';

const SAMPLE = `NeuroLex turns ordinary text into a Bionic Reading view that guides your eye through each word.

Paste in an article, a chapter, or a class reading. Tune the bold percentage, switch to a high-contrast theme, hit Play to hear it aloud, or save it to your library for later.

When you find a setup that works, share it: every document gets a self-contained link that opens with your exact font, size, and theme.`;

export default function App() {
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<DocSettings>(DEFAULT_SETTINGS);
  const [ttsState, setTtsState] = useState<TTSState>('idle');
  const [ttsRate, setTtsRate] = useState(1);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const ttsRef = useRef(createTTS((s) => setTtsState(s)));

  // Hydrate on mount: either an inbound share link or the most-recent saved
  // doc, or a sample.
  useEffect(() => {
    const share = readShareFromHash();
    if (share) {
      setTitle(share.title ?? 'Shared document');
      setText(share.text);
      setSettings({ ...DEFAULT_SETTINGS, ...share.settings });
      // Clear the hash so a refresh doesn't keep reloading the share.
      history.replaceState(null, '', `${location.pathname}${location.search}`);
      setDocs(listDocs());
      return;
    }

    const all = listDocs();
    setDocs(all);
    if (all.length > 0) {
      openDoc(all[0]!.id);
    } else {
      setText(SAMPLE);
      setTitle('Welcome to NeuroLex');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme tokens to the root element.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const openDoc = useCallback((id: string) => {
    const d = getDoc(id);
    if (!d) return;
    setCurrentId(d.id);
    setTitle(d.title);
    setText(d.text);
    setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
    ttsRef.current.stop();
  }, []);

  const handleNew = useCallback(() => {
    ttsRef.current.stop();
    setCurrentId(null);
    setTitle('');
    setText('');
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const handleSave = useCallback(() => {
    const saved = saveDoc({
      id: currentId ?? undefined,
      title: title.trim() || 'Untitled',
      text,
      settings,
    });
    setCurrentId(saved.id);
    setDocs(listDocs());
  }, [currentId, title, text, settings]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteDoc(id);
      const next = listDocs();
      setDocs(next);
      if (id === currentId) {
        setCurrentId(null);
        setTitle('');
        setText('');
      }
    },
    [currentId],
  );

  const handleShare = useCallback(async () => {
    const url = buildShareUrl({
      title: title || 'Shared document',
      text,
      settings,
    });
    try {
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied to clipboard.');
    } catch {
      setShareNote(url);
    }
    setTimeout(() => setShareNote(null), 3500);
  }, [title, text, settings]);

  const handleTTS = useCallback(() => {
    const c = ttsRef.current;
    if (!c.isSupported()) return;
    if (ttsState === 'speaking') {
      c.pause();
    } else if (ttsState === 'paused') {
      c.resume();
    } else {
      c.speak(text, { rate: ttsRate });
    }
  }, [text, ttsState, ttsRate]);

  const onSettings = useCallback((patch: Partial<DocSettings>) => {
    setSettings((cur) => ({ ...cur, ...patch }));
  }, []);

  const readerStyle = useMemo(
    () => ({
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      letterSpacing: `${settings.letterSpacing}em`,
      wordSpacing: `${settings.wordSpacing}em`,
    }),
    [settings],
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">N L</span>
          <span className="brand__name">NeuroLex</span>
        </div>
        <div className="topbar__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleTTS}
            disabled={!text.trim() || !ttsRef.current.isSupported()}
            title={ttsRef.current.isSupported() ? '' : 'Speech synthesis not supported here'}
          >
            {ttsState === 'speaking' ? '⏸ Pause' : ttsState === 'paused' ? '▶ Resume' : '▶ Play'}
          </button>
          <label className="rate" title="Speech rate">
            <span>Rate</span>
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.05}
              value={ttsRate}
              onChange={(e) => setTtsRate(Number(e.target.value))}
            />
            <span className="rate__value">{ttsRate.toFixed(2)}×</span>
          </label>
          <button type="button" className="btn" onClick={handleSave} disabled={!text.trim()}>
            Save
          </button>
          <button type="button" className="btn" onClick={handleShare} disabled={!text.trim()}>
            Share
          </button>
        </div>
      </header>

      {shareNote && <div className="toast">{shareNote}</div>}

      <main className="layout">
        <Library
          docs={docs}
          currentId={currentId}
          onOpen={openDoc}
          onNew={handleNew}
          onDelete={handleDelete}
        />

        <section className="workspace">
          <div className="workspace__title">
            <input
              type="text"
              placeholder="Untitled document"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Document title"
            />
          </div>

          <div className="panes">
            <div className="pane pane--input">
              <div className="pane__head">Input</div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text here…"
                spellCheck={false}
                style={readerStyle}
              />
            </div>

            <div className="pane pane--reader">
              <div className="pane__head">Reader</div>
              <div className="reader" style={readerStyle}>
                <BionicView
                  text={text}
                  bionic={settings.bionic}
                  boldRatio={settings.boldRatio}
                />
              </div>
            </div>
          </div>
        </section>

        <Controls settings={settings} onChange={onSettings} />
      </main>

      <footer className="footer">
        <span>NeuroLex · in-browser Bionic Reading · no account, no upload</span>
      </footer>
    </div>
  );
}
