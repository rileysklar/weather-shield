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
  type: 'solar_array' | 'wind_farm' | 'hydroelectric' | 'coal' | 'natural_gas' | 'nuclear' | 'geothermal' | 'biomass' | 'other';
}

export const PROJECT_TYPES = [
  { value: 'solar_array', label: 'Solar Array' },
  { value: 'wind_farm', label: 'Wind Farm' },
  { value: 'hydroelectric', label: 'Hydroelectric' },
  { value: 'coal', label: 'Coal' },
  { value: 'natural_gas', label: 'Natural Gas' },
  { value: 'nuclear', label: 'Nuclear' },
  { value: 'geothermal', label: 'Geothermal' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'other', label: 'Other' }
];

interface ProjectSiteFormProps {
  onSubmit: (details: ProjectSiteDetails) => void;
}

export function ProjectSiteForm({ onSubmit }: ProjectSiteFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectSiteDetails['type']>('solar_array');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      type
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Project Type</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as ProjectSiteDetails['type'])}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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