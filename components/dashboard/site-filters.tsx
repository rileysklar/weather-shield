import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CloudRain, Sun } from "lucide-react";
import { useSiteFilter } from "@/contexts/site-filter-context";
import { useState, useRef, useEffect } from "react";

const RISK_LEVELS = ['extreme', 'severe', 'moderate', 'minor', 'normal'] as const;
const WEATHER_CONDITIONS = ['Clear', 'Cloudy', 'Rain', 'Storm'] as const;

export function SiteFilters() {
  const { state, dispatch, filteredSites } = useSiteFilter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input with Suggestions */}
      <div className="relative" ref={suggestionsRef}>
        <Input
          type="search"
          placeholder="Search sites..."
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
          onFocus={() => setShowSuggestions(true)}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && state.searchQuery && (
          <div className="absolute w-full mt-1 py-2 bg-background border rounded-md shadow-lg z-10">
            {filteredSites.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No matching sites
              </div>
            ) : (
              <div className="max-h-[200px] overflow-y-auto">
                {filteredSites.map((site) => (
                  <button
                    key={site.id}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center justify-between"
                    onClick={() => {
                      dispatch({ type: 'SET_SEARCH_QUERY', payload: site.name });
                      setShowSuggestions(false);
                    }}
                  >
                    <span>{site.name}</span>
                    {site.alerts.count > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {site.alerts.count} Alert{site.alerts.count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Risk Level Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk Level
        </label>
        <div className="flex flex-wrap gap-2">
          {RISK_LEVELS.map((level) => (
            <Badge
              key={level}
              variant={state.riskLevel.includes(level) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => dispatch({ type: 'TOGGLE_RISK_LEVEL', payload: level })}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Weather Condition Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Weather Conditions
        </label>
        <div className="flex flex-wrap gap-2">
          {WEATHER_CONDITIONS.map((condition) => (
            <Badge
              key={condition}
              variant={state.weatherConditions.includes(condition) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => dispatch({ type: 'TOGGLE_WEATHER_CONDITION', payload: condition })}
            >
              {condition}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Alerts Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <CloudRain className="h-4 w-4" />
          Alert Status
        </label>
        <div className="flex gap-2">
          <Badge
            variant={state.hasActiveAlerts === true ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => dispatch({ 
              type: 'SET_ACTIVE_ALERTS', 
              payload: state.hasActiveAlerts === true ? null : true 
            })}
          >
            Active Alerts
          </Badge>
          <Badge
            variant={state.hasActiveAlerts === false ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => dispatch({ 
              type: 'SET_ACTIVE_ALERTS', 
              payload: state.hasActiveAlerts === false ? null : false 
            })}
          >
            No Alerts
          </Badge>
        </div>
      </div>

      {/* Reset Filters */}
      {(state.searchQuery || state.riskLevel.length > 0 || 
        state.weatherConditions.length > 0 || state.hasActiveAlerts !== null) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'RESET_FILTERS' })}
          className="w-full"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
} 

