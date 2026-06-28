import { useEffect, useRef, useState, type ReactNode } from "react";

interface GenerationCardProps {
  image: string;
  /** Display name shown above the style/date row. */
  name: string;
  /** Render the name in monospace muted style (for auto-generated file-key names). */
  isAutoName?: boolean;
  /** Style chip text (small pill above the date). */
  styleLabel: string;
  date: string;
  /** Click-to-rename. Called with the trimmed new value, or `null` when cleared. */
  onRename?: (newName: string | null) => void;
  /** Slot rendered absolutely at the top-right of the image (kebab menus, badges, …). */
  imageOverlay?: ReactNode;
  /** When provided, clicking the image fires this (e.g. open a before/after viewer). */
  onImageClick?: () => void;
  /** Footer action buttons. Use `<button className="gen-card__icon-btn">…</button>`,
   *  plus `gen-card__icon-btn--danger` for destructive ones. */
  actions?: ReactNode;
}

function GenerationCard({
  image,
  name,
  isAutoName,
  styleLabel,
  date,
  onRename,
  imageOverlay,
  onImageClick,
  actions,
}: GenerationCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    if (!onRename) return;
    setDraft(name);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === name) return;
    onRename?.(trimmed || null);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(name);
  };

  return (
    <article className="gen-card">
      <div
        className={`gen-card__image${onImageClick ? " gen-card__image--clickable" : ""}`}
        onClick={onImageClick}
        role={onImageClick ? "button" : undefined}
        tabIndex={onImageClick ? 0 : undefined}
        onKeyDown={
          onImageClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onImageClick();
                }
              }
            : undefined
        }
        aria-label={onImageClick ? `View before and after for ${name}` : undefined}
      >
        <img src={image} alt={name} />
        {imageOverlay}
      </div>
      <div className="gen-card__body">
        {editing ? (
          <input
            ref={inputRef}
            className="gen-card__name-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            placeholder="Name this generation…"
            aria-label="Generation name"
          />
        ) : (
          <button
            type="button"
            className="gen-card__name"
            onClick={startEdit}
            disabled={!onRename}
            title={onRename ? "Click to rename" : undefined}
            style={!onRename ? { cursor: "default" } : undefined}
          >
            <span
              className={`gen-card__name-text${isAutoName ? " gen-card__name-text--auto" : ""}`}
            >
              {name}
            </span>
            {onRename && (
              <svg
                className="gen-card__name-pencil"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            )}
          </button>
        )}

        <div className="gen-card__meta">
          <span className="gen-card__style">{styleLabel}</span>
          <span className="gen-card__date">{date}</span>
        </div>

        {actions && <div className="gen-card__actions">{actions}</div>}
      </div>
    </article>
  );
}

/** All `.gen-card*` CSS. Inject once per page (not per card) by rendering
 *  `<style>{generationCardStyles}</style>` somewhere in the page. */
export const generationCardStyles = `
  .gen-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    background-color: var(--color-card);
    border: 1px solid var(--color-border-subtle);
    box-shadow: var(--shadow-sm);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .gen-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-brand-primary);
  }
  .gen-card__image {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    background-color: var(--color-bg-elevated);
    overflow: hidden;
    border-radius: 12px 12px 0 0;
  }
  .gen-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gen-card__image--clickable {
    cursor: pointer;
  }
  .gen-card__image--clickable img {
    transition: transform 0.2s ease;
  }
  .gen-card__image--clickable:hover img {
    transform: scale(1.04);
  }
  .gen-card__body {
    padding: 8px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-radius: 0 0 12px 12px;
  }
  .gen-card__name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 3px 5px;
    margin: -3px -5px 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--color-text-primary);
    text-align: left;
    cursor: text;
    transition: background-color 0.15s ease;
    min-width: 0;
  }
  .gen-card__name:hover:not(:disabled) {
    background-color: var(--color-bg-elevated);
  }
  .gen-card__name:hover:not(:disabled) .gen-card__name-pencil {
    opacity: 1;
  }
  .gen-card__name-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .gen-card__name-text--auto {
    color: var(--color-text-secondary);
    font-weight: 500;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11.5px;
  }
  .gen-card__name-pencil {
    width: 11px;
    height: 11px;
    color: var(--color-text-tertiary);
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
  }
  .gen-card__name-input {
    width: 100%;
    padding: 4px 6px;
    margin: -4px -6px 0;
    border: 1px solid var(--color-brand-primary);
    border-radius: 6px;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--color-text-primary);
    background-color: var(--color-bg-surface);
    outline: none;
    box-shadow: 0 0 0 3px var(--color-focus-ring);
  }
  .gen-card__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .gen-card__style {
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 500;
    color: var(--color-brand-primary);
    background-color: var(--color-brand-soft);
    border-radius: 999px;
  }
  .gen-card__date {
    font-size: 10.5px;
    color: var(--color-text-secondary);
  }
  .gen-card__actions {
    display: flex;
    justify-content: flex-end;
    gap: 3px;
  }
  .gen-card__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background-color: transparent;
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .gen-card__icon-btn:hover {
    color: var(--color-brand-primary);
    border-color: var(--color-brand-primary);
    background-color: var(--color-brand-soft);
  }
  .gen-card__icon-btn--danger:hover {
    color: var(--color-danger);
    border-color: var(--color-danger);
    background-color: var(--color-danger-soft);
  }
  .gen-card__icon-btn svg {
    width: 13px;
    height: 13px;
  }
  /* Image-overlay menu (kebab + dropdown) — Projects-only but lives here
     so any consumer can opt in just by rendering the markup. */
  .gen-card__menu {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  .gen-card__menu-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background-color: rgba(0, 0, 0, 0.55);
    color: var(--color-text-inverse);
    border: none;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background-color 0.15s ease;
  }
  .gen-card__menu-trigger:hover {
    background-color: rgba(0, 0, 0, 0.75);
  }
  .gen-card__menu-trigger svg {
    width: 13px;
    height: 13px;
  }
  .gen-card__menu-list {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 200px;
    padding: 6px;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .gen-card__menu-label {
    padding: 6px 10px 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .gen-card__menu-empty {
    padding: 6px 10px;
    font-size: 13px;
    color: var(--color-text-tertiary);
  }
  .gen-card__menu-item {
    padding: 8px 10px;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background-color 0.1s ease;
  }
  .gen-card__menu-item:hover:not(:disabled) {
    background-color: var(--color-bg-elevated);
  }
  .gen-card__menu-item:disabled {
    color: var(--color-text-tertiary);
    cursor: default;
  }
  .gen-card__menu-divider {
    height: 1px;
    background-color: var(--color-border-subtle);
    margin: 4px 0;
  }
`;

export default GenerationCard;
