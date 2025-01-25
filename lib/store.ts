import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectSite {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: number[][];
}

interface ProjectSiteStore {
  projectSites: ProjectSite[];
  addProjectSite: (site: ProjectSite) => void;
  removeProjectSite: (id: string) => void;
  updateProjectSite: (id: string, updates: Partial<ProjectSite>) => void;
}

export const useProjectSiteStore = create<ProjectSiteStore>()(
  persist(
    (set) => ({
      projectSites: [],
      addProjectSite: (site) =>
        set((state) => ({
          projectSites: [...state.projectSites, site],
        })),
      removeProjectSite: (id) =>
        set((state) => ({
          projectSites: state.projectSites.filter((site) => site.id !== id),
        })),
      updateProjectSite: (id, updates) =>
        set((state) => ({
          projectSites: state.projectSites.map((site) =>
            site.id === id ? { ...site, ...updates } : site
          ),
        })),
    }),
    {
      name: 'project-sites-storage',
    }
  )
); 