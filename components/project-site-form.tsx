'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

export interface ProjectSiteDetails {
  name: string;
  description: string;
  type: string;
}

interface ProjectSiteFormProps {
  onSubmit: (details: ProjectSiteDetails) => void;
}

const PROJECT_TYPES = [
  { value: 'solar', label: 'Solar Array' },
  { value: 'wind', label: 'Wind Energy' },
  { value: 'hydro', label: 'Hydroelectric' },
  { value: 'coal', label: 'Coal Power' },
  { value: 'natural_gas', label: 'Natural Gas' },
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'geothermal', label: 'Geothermal' },
];

export function ProjectSiteForm({ onSubmit }: ProjectSiteFormProps) {
  const [details, setDetails] = useState<ProjectSiteDetails>({
    name: '',
    description: '',
    type: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="Enter project name"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Project Type</Label>
          <Select
            value={details.type}
            onValueChange={(value) => setDetails({ ...details, type: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter project description"
            value={details.description}
            onChange={(e) => setDetails({ ...details, description: e.target.value })}
            required
            className="h-24"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" className="w-full">
            Create Project Site
          </Button>
        </div>
      </form>
    </Card>
  );
} 