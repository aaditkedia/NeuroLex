import { type SavedDoc } from '../lib/library';

type Props = {
  docs: SavedDoc[];
  currentId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function Library({ docs, currentId, onOpen, onNew, onDelete }: Props) {
  return (
    <aside className="library">
      <div className="library__head">
        <h3>Library</h3>
        <button type="button" className="library__new" onClick={onNew}>
          + New
        </button>
      </div>
      {docs.length === 0 ? (
        <p className="library__empty">No saved documents yet. Paste some text and hit Save.</p>
      ) : (
        <ul className="library__list">
          {docs.map((d) => (
            <li
              key={d.id}
              className={`library__item ${d.id === currentId ? 'is-active' : ''}`}
            >
              <button
                type="button"
                className="library__open"
                onClick={() => onOpen(d.id)}
                title={d.title}
              >
                <span className="library__title">{d.title || 'Untitled'}</span>
                <span className="library__meta">{formatDate(d.updatedAt)}</span>
              </button>
              <button
                type="button"
                className="library__delete"
                onClick={() => {
                  if (confirm(`Delete "${d.title || 'Untitled'}"?`)) onDelete(d.id);
                }}
                aria-label="Delete document"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
