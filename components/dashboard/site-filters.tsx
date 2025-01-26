import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CloudRain, Sun, X } from "lucide-react";
import { useSiteFilter } from "@/contexts/site-filter-context";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SiteStatistics } from "./site-statistics";
import { AlertsTimeline } from "./alerts-timeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const RISK_LEVELS = ['extreme', 'severe', 'moderate', 'minor', 'normal'] as const;
const WEATHER_CONDITIONS = ['Clear', 'Cloudy', 'Rain', 'Storm'] as const;

export function SiteFilters() {
  const { state, dispatch, filteredSites } = useSiteFilter();

  const handleClearSearch = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  };

  return (
    <div className="flex flex-col h-auto">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Search sites..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            className="w-full"
          />
          {state.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 px-3 hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
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

        {/* Accordions section */}
        <div className="flex-1 overflow-auto border-t mt-4 pt-4">
          <Accordion type="single" collapsible defaultValue="alerts">
            <AccordionItem value="alerts" className="border-none" id="alerts-accordion">
              <AccordionTrigger className="py-2">Active Alerts</AccordionTrigger>
              <AccordionContent>
                <AlertsTimeline sites={filteredSites} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="stats" className="border-none">
              <AccordionTrigger className="py-2">Site Statistics</AccordionTrigger>
              <AccordionContent>
                <SiteStatistics sites={filteredSites} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
} 

