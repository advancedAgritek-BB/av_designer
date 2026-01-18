import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentCard } from '@/features/equipment/components/EquipmentCard';
import type { Equipment } from '@/types/equipment';

const mockEquipment: Equipment = {
  id: '1',
  manufacturer: 'Shure',
  model: 'MXA920',
  sku: 'MXA920-S',
  category: 'audio',
  subcategory: 'microphones',
  description: 'Ceiling array microphone with IntelliMix DSP',
  cost: 2847,
  msrp: 3500,
  dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
  weight: 6.2,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('EquipmentCard', () => {
  describe('Rendering', () => {
    it('renders as an article element', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('displays manufacturer and model as title', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.getByText('Shure MXA920')).toBeInTheDocument();
    });

    it('displays manufacturer separately', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const manufacturerElements = screen.getAllByText('Shure');
      expect(manufacturerElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays formatted cost price', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.getByText('$2,847')).toBeInTheDocument();
    });

    it('displays category badge', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.getByText(/audio/i)).toBeInTheDocument();
    });

    it('displays subcategory', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.getByText(/microphones/i)).toBeInTheDocument();
    });

    it('displays SKU', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.getByText('MXA920-S')).toBeInTheDocument();
    });

    it('renders placeholder when no image URL', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const placeholder = screen.getByTestId('equipment-image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('renders image when imageUrl is provided', () => {
      const equipmentWithImage = {
        ...mockEquipment,
        imageUrl: 'https://example.com/shure-mxa920.png',
      };
      render(<EquipmentCard equipment={equipmentWithImage} />);
      const image = screen.getByRole('img', { name: /Shure MXA920/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/shure-mxa920.png');
    });
  });

  describe('Platform Certifications', () => {
    it('displays platform certifications when present', () => {
      const equipmentWithCerts = {
        ...mockEquipment,
        platformCertifications: ['teams', 'zoom'],
      };
      render(<EquipmentCard equipment={equipmentWithCerts} />);
      expect(screen.getByText(/teams/i)).toBeInTheDocument();
      expect(screen.getByText(/zoom/i)).toBeInTheDocument();
    });

    it('does not render certifications section when empty', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      expect(screen.queryByTestId('certifications')).not.toBeInTheDocument();
    });

    it('displays certification badges with checkmarks', () => {
      const equipmentWithCerts = {
        ...mockEquipment,
        platformCertifications: ['teams'],
      };
      render(<EquipmentCard equipment={equipmentWithCerts} />);
      const certBadge = screen.getByText(/teams/i);
      expect(certBadge).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('does not have selected styling by default', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const card = screen.getByRole('article');
      expect(card).not.toHaveAttribute('data-selected', 'true');
    });

    it('has selected styling when isSelected is true', () => {
      render(<EquipmentCard equipment={mockEquipment} isSelected={true} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('data-selected', 'true');
    });

    it('has aria-selected attribute when selected', () => {
      render(<EquipmentCard equipment={mockEquipment} isSelected={true} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Click Interaction', () => {
    it('calls onClick when card is clicked', async () => {
      const handleClick = vi.fn();
      render(<EquipmentCard equipment={mockEquipment} onClick={handleClick} />);

      // When interactive, the card has role="button" with the equipment name
      const card = screen.getByRole('button', { name: /Shure MXA920/i });
      await userEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is not interactive when onClick is not provided', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const card = screen.getByRole('article');
      expect(card).not.toHaveAttribute('role', 'button');
    });

    it('is interactive when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<EquipmentCard equipment={mockEquipment} onClick={handleClick} />);
      const card = screen.getByRole('button', { name: /Shure MXA920/i });
      expect(card).toBeInTheDocument();
    });

    it('has tabIndex 0 when interactive', () => {
      const handleClick = vi.fn();
      render(<EquipmentCard equipment={mockEquipment} onClick={handleClick} />);
      const card = screen.getByRole('button', { name: /Shure MXA920/i });
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Keyboard Interaction', () => {
    it('activates on Enter key when interactive', async () => {
      const handleClick = vi.fn();
      render(<EquipmentCard equipment={mockEquipment} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /Shure MXA920/i });
      card.focus();
      await userEvent.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('activates on Space key when interactive', async () => {
      const handleClick = vi.fn();
      render(<EquipmentCard equipment={mockEquipment} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /Shure MXA920/i });
      card.focus();
      await userEvent.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Favorite Button', () => {
    it('renders favorite button by default', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const favButton = screen.getByRole('button', { name: /favorite/i });
      expect(favButton).toBeInTheDocument();
    });

    it('hides favorite button when showFavorite is false', () => {
      render(<EquipmentCard equipment={mockEquipment} showFavorite={false} />);
      expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
    });

    it('calls onFavoriteToggle when favorite button clicked', async () => {
      const handleFavorite = vi.fn();
      render(
        <EquipmentCard equipment={mockEquipment} onFavoriteToggle={handleFavorite} />
      );

      const favButton = screen.getByRole('button', { name: /favorite/i });
      await userEvent.click(favButton);

      expect(handleFavorite).toHaveBeenCalledWith('1');
    });

    it('stops propagation when favorite button clicked', async () => {
      const handleClick = vi.fn();
      const handleFavorite = vi.fn();
      render(
        <EquipmentCard
          equipment={mockEquipment}
          onClick={handleClick}
          onFavoriteToggle={handleFavorite}
        />
      );

      const favButton = screen.getByRole('button', { name: /favorite/i });
      await userEvent.click(favButton);

      expect(handleFavorite).toHaveBeenCalled();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows filled star when isFavorite is true', () => {
      render(<EquipmentCard equipment={mockEquipment} isFavorite={true} />);
      const favButton = screen.getByRole('button', { name: /favorite/i });
      expect(favButton).toHaveAttribute('data-favorite', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has accessible name from manufacturer and model', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAccessibleName(/Shure MXA920/i);
    });

    it('image has alt text', () => {
      const equipmentWithImage = {
        ...mockEquipment,
        imageUrl: 'https://example.com/image.png',
      };
      render(<EquipmentCard equipment={equipmentWithImage} />);
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Shure MXA920');
    });
  });

  describe('Price Formatting', () => {
    it('formats price with thousands separator', () => {
      const expensiveEquipment = { ...mockEquipment, cost: 12500 };
      render(<EquipmentCard equipment={expensiveEquipment} />);
      expect(screen.getByText('$12,500')).toBeInTheDocument();
    });

    it('displays zero price correctly', () => {
      const freeEquipment = { ...mockEquipment, cost: 0 };
      render(<EquipmentCard equipment={freeEquipment} />);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles decimal prices', () => {
      const decimalEquipment = { ...mockEquipment, cost: 1234.56 };
      render(<EquipmentCard equipment={decimalEquipment} />);
      expect(screen.getByText('$1,235')).toBeInTheDocument();
    });
  });

  describe('Compact Variant', () => {
    it('renders compact variant when specified', () => {
      render(<EquipmentCard equipment={mockEquipment} variant="compact" />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('data-variant', 'compact');
    });

    it('renders default variant by default', () => {
      render(<EquipmentCard equipment={mockEquipment} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('data-variant', 'default');
    });
  });
});
