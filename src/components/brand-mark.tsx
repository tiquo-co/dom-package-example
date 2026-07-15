type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="brand-mark" aria-label="Tiquo Example">
      <span className="brand-symbol" aria-hidden="true" />
      {!compact && <span>Tiquo Example</span>}
    </span>
  );
}
