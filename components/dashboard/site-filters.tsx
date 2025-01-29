'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CloudRain, Sun, X } from "lucide-react";
import { useSiteFilter } from "@/contexts/site-filter-context";
import { SiteStatistics } from "./site-statistics";
import { AlertsTimeline } from "./alerts-timeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { forwardRef } from 'react';

const RISK_LEVELS = ['extreme', 'severe', 'moderate', 'minor', 'normal'] as const;
const WEATHER_CONDITIONS = ['Clear', 'Cloudy', 'Rain', 'Storm'] as const;

export function SiteFilters() {
  const { state, dispatch, filteredSites } = useSiteFilter();

  const handleClearSearch = () => {
    dispatch({ type: 'SET_SEARCH', payload: '' });
  };

  return (
    <div className="flex flex-col h-auto p-4 bg-background/95 border border-border/90 rounded-lg shadow-sm">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Input
            id="site-search"
            type="search"
            placeholder="Search sites..."
            value={state.search}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            className="w-full [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {!state.search && (
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>
          {state.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0 h-auto hover:bg-transparent"
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
            {RISK_LEVELS.map((level) => (
              <Badge
                key={level}
                variant={state.riskLevels.includes(level) ? 'default' : 'outline'}
                className="cursor-pointer rounded-md py-2 hover:bg-primary/20 hover:text-white text-sm justify-center"
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
            {WEATHER_CONDITIONS.map((condition) => (
              <Badge
                key={condition}
                variant={state.weatherConditions.includes(condition) ? 'default' : 'outline'}
                className="cursor-pointer rounded-md py-2 hover:bg-primary/20 hover:text-white text-sm justify-center"
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
          <div className="grid grid-cols-2 gap-1.5">
            <Badge
              variant={state.hasActiveAlerts === true ? 'default' : 'outline'}
              className="cursor-pointer rounded-md hover:bg-primary/20 hover:text-white text-sm justify-center"
              onClick={() => dispatch({ 
                type: 'SET_ACTIVE_ALERTS', 
                payload: state.hasActiveAlerts === true ? null : true 
              })}
            >
              Active Alerts
            </Badge>
            <Badge
              variant={state.hasActiveAlerts === false ? 'default' : 'outline'}
              className="cursor-pointer border-2 rounded-md py-2 hover:bg-primary/20 hover:text-white text-sm justify-center"
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
        {(state.search || state.riskLevels.length > 0 || 
          state.weatherConditions.length > 0 || state.hasActiveAlerts !== null) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="w-full border border-border"
          >
            Reset Filters
          </Button>
        )}

        {/* Accordions section */}
        <div className="flex-1 overflow-auto border-t mt-4 pt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="alerts" className="border-none" id="alerts-accordion">
              <AccordionTrigger className="py-2">Active Alerts</AccordionTrigger>
              <AccordionContent>
                {filteredSites.some(site => site.alerts.count > 0) ? (
                  <AlertsTimeline sites={filteredSites} />
                ) : (
                  <div className="py-4 text-center text-sm bg-muted/50 rounded-lg text-muted-foreground">
                    No active alerts at this time
                  </div>
                )}
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

