import { Shell } from '@/components/layout';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card, CardHeader, CardBody } from '@/components/ui';

export default function App() {
  const handleSearchClick = () => {
    // TODO: Implement search modal
  };

  const handleUserMenuClick = () => {
    // TODO: Implement user menu dropdown
  };

  return (
    <Shell
      userInitials="AV"
      onSearchClick={handleSearchClick}
      onUserMenuClick={handleUserMenuClick}
    >
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Welcome to AV Designer
        </h1>
        <p className="text-text-secondary">
          Design system initialized with Tailwind CSS. Use the sidebar to navigate.
        </p>

        <Card>
          <CardHeader
            title="Button Variants"
            description="Primary design system buttons"
          />
          <CardBody>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" loading>
                Loading
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Input Component"
            description="Form input with various states"
          />
          <CardBody>
            <div className="grid gap-4 max-w-md">
              <Input label="Default Input" placeholder="Enter text..." />
              <Input
                label="With Helper Text"
                placeholder="Enter your email"
                helperText="We'll never share your email"
              />
              <Input
                label="Error State"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
              />
              <Input label="Disabled Input" placeholder="Cannot edit" disabled />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Status Pills" description="Project status indicators" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <span className="pill pill-quoting">Quoting</span>
              <span className="pill pill-review">Client Review</span>
              <span className="pill pill-ordered">Ordered</span>
              <span className="pill pill-progress">In Progress</span>
              <span className="pill pill-hold">On Hold</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Color Palette" description="Design system colors" />
          <CardBody>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-12 bg-bg-primary border border-white/10 rounded-md" />
                <p className="text-xs text-text-tertiary">bg-primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-bg-secondary rounded-md" />
                <p className="text-xs text-text-tertiary">bg-secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-bg-tertiary rounded-md" />
                <p className="text-xs text-text-tertiary">bg-tertiary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-accent-gold rounded-md" />
                <p className="text-xs text-text-tertiary">accent-gold</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
