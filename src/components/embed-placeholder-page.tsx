import type { ReactNode } from "react";

type EmbedPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  frameTitle: string;
  children?: ReactNode;
  className?: string;
};

export function EmbedPlaceholderPage({
  eyebrow,
  title,
  description,
  frameTitle,
  children,
  className,
}: Readonly<EmbedPlaceholderPageProps>) {
  return (
    <main className={["embed-page", className].filter(Boolean).join(" ")}>
      <section className="embed-page__hero">
        <div className="page-shell embed-page__intro">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="embed-page__description">{description}</p>
        </div>
      </section>

      <section className="embed-page__content" aria-label={frameTitle}>
        <div className="page-shell">
          {children ?? (
            <div className="iframe-slot">
              {/* Replace this placeholder with the provider iframe. */}
              <div className="iframe-slot__label">
                <span>Iframe embed area</span>
                <small>{frameTitle}</small>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
