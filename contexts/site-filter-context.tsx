import { createContext, useContext, useReducer, ReactNode } from 'react';
import { DashboardSiteData } from '@/utils/services/dashboard';

type FilterState = {
  searchQuery: string;
  riskLevel: string[];
  weatherConditions: string[];
  hasActiveAlerts: boolean | null;
};

type FilterAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_RISK_LEVEL'; payload: string }
  | { type: 'TOGGLE_WEATHER_CONDITION'; payload: string }
  | { type: 'SET_ACTIVE_ALERTS'; payload: boolean | null }
  | { type: 'RESET_FILTERS' };

const initialState: FilterState = {
  searchQuery: '',
  riskLevel: [],
  weatherConditions: [],
  hasActiveAlerts: null,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_RISK_LEVEL':
      return {
        ...state,
        riskLevel: state.riskLevel.includes(action.payload)
          ? state.riskLevel.filter(level => level !== action.payload)
          : [...state.riskLevel, action.payload],
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
    case 'RESET_FILTERS':
      return initialState;
    default:
      return state;
  }
}

interface SiteFilterContextType {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  filteredSites: DashboardSiteData[];
}

const SiteFilterContext = createContext<SiteFilterContextType | undefined>(undefined);

export function SiteFilterProvider({
  children,
  sites,
}: {
  children: ReactNode;
  sites: DashboardSiteData[];
}) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const filteredSites = sites.filter(site => {
    // Search query filter
    if (state.searchQuery && !site.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
      return false;
    }

    // Risk level filter
    if (state.riskLevel.length > 0 && !state.riskLevel.includes(site.alerts.highestSeverity || 'normal')) {
      return false;
    }

    // Weather condition filter
    if (state.weatherConditions.length > 0) {
      const siteCondition = site.currentWeather?.weather_condition;
      if (!siteCondition || !state.weatherConditions.some(condition => 
        siteCondition.toLowerCase().includes(condition.toLowerCase())
      )) {
        return false;
      }
    }

    // Active alerts filter
    if (state.hasActiveAlerts !== null) {
      const hasAlerts = (site.alerts.count || 0) > 0;
      if (hasAlerts !== state.hasActiveAlerts) {
        return false;
      }
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
