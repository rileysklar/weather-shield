'use client';

import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: number[][];
}

interface ProjectSiteListProps {
  sites: ProjectSite[];
  onSelect?: (site: ProjectSite) => void;
  onEdit?: (siteId: string, newName: string) => Promise<void>;
  onDelete?: (siteId: string) => Promise<void>;
}

const PROJECT_TYPES = [
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

const getSiteTypeLabel = (type: string) => {
  const projectType = PROJECT_TYPES.find(t => t.value === type);
  return projectType?.label || type;
};

export function ProjectSiteList({ sites, onSelect, onEdit, onDelete }: ProjectSiteListProps) {
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);

  const handleStartEdit = (site: ProjectSite) => {
    setEditingSiteId(site.id);
    setEditingName(site.name);
  };

  const handleSaveEdit = async () => {
    if (!editingSiteId || !editingName.trim() || !onEdit) return;
    await onEdit(editingSiteId, editingName.trim());
    setEditingSiteId(null);
  };

  const handleCancelEdit = () => {
    setEditingSiteId(null);
    setEditingName('');
  };

  const handleDelete = async () => {
    if (!deletingSiteId || !onDelete) return;
    await onDelete(deletingSiteId);
    setDeletingSiteId(null);
  };

  if (!sites.length) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
        <h2 className="text-md">No project sites created yet</h2>
          <img src="/og-image.jpg" alt="No project sites created yet" className="sm:w-1/2 w-full rounded-lg overflow-hidden h-auto" />
          <p className="text-md text-muted-foreground">To ccccc your first site:</p>
          <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
            <li>Navigate to the Map view</li>
            <li>Click the sidebar toggle in the top left</li>
            <li>Click "Create" in the sidebar</li>
            <li>Draw a polygon around your project site</li>
            <li>Fill in your site details</li>
          </ol>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sites.map(site => (
        <Card key={site.id} className="p-3">
          <div className="flex items-center justify-between">
            {editingSiteId === site.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    className="text-left hover:text-primary"
                    onClick={() => onSelect?.(site)}
                  >
                    {site.name}
                  </button>
                  <Badge variant="outline" className="text-xs">
                    {getSiteTypeLabel(site.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(site)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingSiteId(site.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSiteId} onOpenChange={() => setDeletingSiteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project site? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 