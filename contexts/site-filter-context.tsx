'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { DashboardSiteData } from '@/utils/services/dashboard';
import { useDashboardData } from '@/hooks/use-dashboard-data';

interface SiteFilterState {
  search: string;
  projectTypes: string[];
  weatherConditions: string[];
  hasActiveAlerts: boolean | null;
  riskLevels: string[];
}

type SiteFilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_PROJECT_TYPE'; payload: string }
  | { type: 'TOGGLE_WEATHER_CONDITION'; payload: string }
  | { type: 'SET_ACTIVE_ALERTS'; payload: boolean | null }
  | { type: 'TOGGLE_RISK_LEVEL'; payload: string }
  | { type: 'RESET_FILTERS' };

const initialState: SiteFilterState = {
  search: '',
  projectTypes: [],
  weatherConditions: [],
  hasActiveAlerts: null,
  riskLevels: [],
};

function filterReducer(state: SiteFilterState, action: SiteFilterAction): SiteFilterState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'TOGGLE_PROJECT_TYPE':
      return {
        ...state,
        projectTypes: state.projectTypes.includes(action.payload)
          ? state.projectTypes.filter(type => type !== action.payload)
          : [...state.projectTypes, action.payload],
      };
    case 'TOGGLE_WEATHER_CONDITION':
      return {
        ...state,
        weatherConditions: state.weatherConditions.includes(action.payload)
          ? state.weatherConditions.filter(condition => condition !== action.payload)
          : [...state.weatherConditions, action.payload],
      };
    case 'SET_ACTIVE_ALERTS':
      return { ...state, hasActiveAlerts: action.payload };
    case 'TOGGLE_RISK_LEVEL':
      return {
        ...state,
        riskLevels: state.riskLevels.includes(action.payload)
          ? state.riskLevels.filter(level => level !== action.payload)
          : [...state.riskLevels, action.payload],
      };
    case 'RESET_FILTERS':
      return initialState;
    default:
      return state;
  }
}

interface SiteFilterContextType {
  state: SiteFilterState;
  dispatch: React.Dispatch<SiteFilterAction>;
  filteredSites: DashboardSiteData[];
}

const SiteFilterContext = createContext<SiteFilterContextType | undefined>(undefined);

interface SiteFilterProviderProps {
  children: ReactNode;
}

export function SiteFilterProvider({ children }: SiteFilterProviderProps) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  // Get sites from our hook
  const { sites } = useDashboardData();

  // Filter sites based on state
  const filteredSites = sites.filter((site: DashboardSiteData) => {
    // Search filter
    if (state.search && !site.name.toLowerCase().includes(state.search.toLowerCase())) {
      return false;
    }

    // Project type filter
    if (state.projectTypes.length > 0 && !state.projectTypes.includes(site.type)) {
      return false;
    }

    // Weather condition filter
    if (state.weatherConditions.length > 0 && !state.weatherConditions.includes(site.currentWeather?.weather_condition || '')) {
      return false;
    }

    // Active alerts filter
    if (state.hasActiveAlerts !== null) {
      const hasAlerts = (site.alerts?.count || 0) > 0;
      if (state.hasActiveAlerts !== hasAlerts) {
        return false;
      }
    }

    // Risk level filter
    if (state.riskLevels.length > 0 && !state.riskLevels.includes(site.alerts?.highestSeverity || '')) {
      return false;
    }

    return true;
  });

  return (
    <SiteFilterContext.Provider value={{ state, dispatch, filteredSites }}>
      {children}
    </SiteFilterContext.Provider>
  );
}

export function useSiteFilter() {
  const context = useContext(SiteFilterContext);
  if (context === undefined) {
    throw new Error('useSiteFilter must be used within a SiteFilterProvider');
  }
  return context;
} 
