import type { Equipment } from '@/types/equipment';

interface EquipmentCardProps {
  equipment: Equipment;
  isSelected?: boolean;
  isFavorite?: boolean;
  showFavorite?: boolean;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
}

/**
 * Equipment catalog card displaying product info, pricing, and certifications
 * Follows Programa-inspired visual catalog style with dark theme
 */
export function EquipmentCard({
  equipment,
  isSelected = false,
  isFavorite = false,
  showFavorite = true,
  variant = 'default',
  onClick,
  onFavoriteToggle,
}: EquipmentCardProps) {
  const isInteractive = !!onClick;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(equipment.cost);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  };

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onFavoriteToggle?.(equipment.id);
  };

  const cardName = `${equipment.manufacturer} ${equipment.model}`;

  return (
    <article
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={cardName}
      aria-selected={isSelected}
      data-selected={isSelected}
      data-variant={variant}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`equipment-card ${isSelected ? 'equipment-card-selected' : ''} ${isInteractive ? 'equipment-card-interactive' : ''} ${variant === 'compact' ? 'equipment-card-compact' : ''}`}
    >
      {/* Image Section */}
      <div className="equipment-card-image">
        {equipment.imageUrl ? (
          <img src={equipment.imageUrl} alt={cardName} className="equipment-card-img" />
        ) : (
          <div
            className="equipment-card-placeholder"
            data-testid="equipment-image-placeholder"
          >
            <PackageIcon />
          </div>
        )}

        {/* Favorite Button */}
        {showFavorite && (
          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            data-favorite={isFavorite}
            onClick={handleFavoriteClick}
            className="equipment-card-favorite"
          >
            <StarIcon filled={isFavorite} />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="equipment-card-content">
        {/* Header: Category & SKU */}
        <div className="equipment-card-meta">
          <span className="equipment-card-category">
            {equipment.category} / {equipment.subcategory}
          </span>
          <span className="equipment-card-sku">{equipment.sku}</span>
        </div>

        {/* Title */}
        <h3 className="equipment-card-title">{cardName}</h3>

        {/* Manufacturer */}
        <p className="equipment-card-manufacturer">{equipment.manufacturer}</p>

        {/* Price */}
        <p className="equipment-card-price">{formattedPrice}</p>

        {/* Platform Certifications */}
        {equipment.platformCertifications &&
          equipment.platformCertifications.length > 0 && (
            <div className="equipment-card-certifications" data-testid="certifications">
              {equipment.platformCertifications.map((cert) => (
                <span key={cert} className="equipment-card-cert-badge">
                  {cert}
                  <CheckIcon />
                </span>
              ))}
            </div>
          )}
      </div>
    </article>
  );
}

// Icon Components
function PackageIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="equipment-card-check-icon"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
