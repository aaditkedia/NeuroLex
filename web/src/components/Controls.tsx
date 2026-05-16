import type { DocSettings } from '../lib/library';

const FONTS = [
  'Verdana',
  'Tahoma',
  'Arial',
  'Trebuchet MS',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Comic Sans MS',
  'Inter',
  'system-ui',
];

const THEMES: { value: DocSettings['theme']; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'cream', label: 'Cream' },
  { value: 'high-contrast', label: 'High contrast' },
];

type Props = {
  settings: DocSettings;
  onChange: (next: Partial<DocSettings>) => void;
};

export function Controls({ settings, onChange }: Props) {
  return (
    <aside className="controls">
      <div className="controls__row controls__toggle">
        <label className="controls__switch">
          <input
            type="checkbox"
            checked={settings.bionic}
            onChange={(e) => onChange({ bionic: e.target.checked })}
          />
          <span>Bionic Reading</span>
        </label>
      </div>

      <Section title="Theme">
        <div className="controls__pills">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`pill ${settings.theme === t.value ? 'is-active' : ''}`}
              onClick={() => onChange({ theme: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Font">
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Section>

      <Slider
        title="Font size"
        suffix="px"
        min={12}
        max={48}
        step={1}
        value={settings.fontSize}
        onChange={(v) => onChange({ fontSize: v })}
      />

      <Slider
        title="Bold percentage"
        suffix="%"
        min={20}
        max={80}
        step={5}
        value={Math.round(settings.boldRatio * 100)}
        onChange={(v) => onChange({ boldRatio: v / 100 })}
        disabled={!settings.bionic}
      />

      <Slider
        title="Line height"
        min={1.2}
        max={2.4}
        step={0.05}
        value={settings.lineHeight}
        onChange={(v) => onChange({ lineHeight: round(v, 2) })}
      />

      <Slider
        title="Letter spacing"
        suffix="em"
        min={0}
        max={0.2}
        step={0.01}
        value={settings.letterSpacing}
        onChange={(v) => onChange({ letterSpacing: round(v, 2) })}
      />

      <Slider
        title="Word spacing"
        suffix="em"
        min={0}
        max={0.6}
        step={0.05}
        value={settings.wordSpacing}
        onChange={(v) => onChange({ wordSpacing: round(v, 2) })}
      />
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="controls__row">
      <div className="controls__label">{title}</div>
      <div className="controls__field">{children}</div>
    </div>
  );
}

function Slider({
  title,
  min,
  max,
  step,
  value,
  onChange,
  suffix = '',
  disabled = false,
}: {
  title: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`controls__row controls__slider ${disabled ? 'is-disabled' : ''}`}>
      <div className="controls__label">
        <span>{title}</span>
        <span className="controls__value">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function round(n: number, dp: number) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
