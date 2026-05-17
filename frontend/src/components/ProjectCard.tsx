import React from "react";

interface Project {
  id: string;
  title: string;
  updatedDate: string;
  thumbnail?: string;
}

interface Generation {
  id: string;
  image: string;
  style: string;
  date: string;
}

interface ProjectCardProps {
  project: Project;
  generations: Generation[];
  onClick?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, generations, onClick }) => {
  const mostRecent = generations[0];
  const thumbnail = mostRecent?.image ?? project.thumbnail;
  const count = generations.length;

  const uniqueStyles = Array.from(new Set(generations.map((g) => g.style).filter(Boolean)));
  const sharedStyle = uniqueStyles.length === 1 ? uniqueStyles[0] : null;

  return (
    <div
      className="project-card"
      onClick={() => onClick?.(project.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(project.id);
        }
      }}
    >
      <div className="project-card__thumb">
        {thumbnail ? (
          <img src={thumbnail} alt={project.title} className="project-card__img" />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12 12 4l9 8" />
              <path d="M5 10v10h14V10" />
              <path d="M10 20v-6h4v6" />
            </svg>
          </div>
        )}
        {count > 0 && (
          <span className="project-card__count" aria-label={`${count} generations`}>
            {count} {count === 1 ? "generation" : "generations"}
          </span>
        )}
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">{project.title}</h3>
        <div className="project-card__meta">
          <span>Updated {project.updatedDate}</span>
          {sharedStyle && <span className="project-card__style">{sharedStyle}</span>}
        </div>
      </div>

      <style>{`
        .project-card {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          border: 1px solid var(--color-border-subtle);
          background-color: var(--color-card);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          box-shadow: var(--shadow-sm);
          user-select: none;
        }
        .project-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-brand-primary);
        }
        .project-card:focus-visible {
          outline: none;
          border-color: var(--color-brand-primary);
          box-shadow: 0 0 0 3px var(--color-focus-ring);
        }
        .project-card__thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background-color: var(--color-bg-elevated);
          overflow: hidden;
        }
        .project-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .project-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
        }
        .project-card__placeholder svg {
          width: 44px;
          height: 44px;
        }
        .project-card__count {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-inverse);
          background-color: rgba(0, 0, 0, 0.55);
          border-radius: 999px;
          backdrop-filter: blur(4px);
        }
        .project-card__body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .project-card__title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .project-card__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        .project-card__style {
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 500;
          color: var(--color-brand-primary);
          background-color: var(--color-brand-soft);
          border-radius: 999px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default ProjectCard;
