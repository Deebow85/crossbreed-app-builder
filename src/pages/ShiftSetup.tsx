
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarDays, Settings, Plus, Trash2, PencilIcon, Check, Wand2, ChevronDown, RefreshCcw, Clock, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface ShiftTypeSettings {
  name: string;
  symbol: string;
  color: string;
  gradient: string;
  isNew?: boolean;
  isOvertime?: boolean;
  isTOIL?: boolean;
  isSwapDone?: boolean;
  isSwapOwed?: boolean;
}

interface ShiftPattern {
  shiftType: ShiftTypeSettings | null;
  days: number;
  isOff?: boolean;
}

interface PatternCycle {
  sequences: ShiftPattern[];
  repeatTimes: number;
  daysOffAfter: number;
  patternName?: string;
}

interface EditingPattern {
  index: number;
  data: {
    pattern: PatternCycle;
    startDate: string;
    years: number;
    patternName: string;
  };
}

const DEFAULT_COLOR = "#4B5563";
const DEFAULT_GRADIENT = `linear-gradient(135deg, #4B5563 0%, #6B7280 100%)`;

const ShiftSetup = () => {
  const navigate = useNavigate();
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeSettings[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient' | null>(null);
  const [startColor, setStartColor] = useState(DEFAULT_COLOR);
  const [endColor, setEndColor] = useState("#6B7280");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [patternStartDate, setPatternStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [currentPattern, setCurrentPattern] = useState<ShiftPattern[]>([]);
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [daysOffAfter, setDaysOffAfter] = useState(0);
  const [yearsToGenerate, setYearsToGenerate] = useState(1);
  const [patternName, setPatternName] = useState("Pattern 1");
  const [existingPatterns, setExistingPatterns] = useState<{
    pattern: PatternCycle;
    startDate: string;
    years: number;
    patternName: string;
  }[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [editingPattern, setEditingPattern] = useState<EditingPattern | null>(null);
  const [showSetDaysDialog, setShowSetDaysDialog] = useState(false);
  const [shiftTypeOption, setShiftTypeOption] = useState<"regular" | "overtime" | "toil" | "swap-done" | "swap-owed">("regular");
  const [showNewShiftDialog, setShowNewShiftDialog] = useState(false);
  const [newShift, setNewShift] = useState<ShiftTypeSettings>({
    name: "New Shift",
    symbol: "",
    color: DEFAULT_COLOR,
    gradient: DEFAULT_GRADIENT,
    isNew: true,
    isOvertime: false,
    isTOIL: false,
    isSwapDone: false,
    isSwapOwed: false
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.shiftTypes) {
        setShiftTypes(settings.shiftTypes);
      }
    }

    const patterns = sessionStorage.getItem('savedPatterns');
    if (patterns) {
      setExistingPatterns(JSON.parse(patterns));
    }
  }, []);

  const saveShiftTypes = (newShiftTypes: ShiftTypeSettings[]) => {
    // Ensure all shift types have valid color and gradient properties
    const validatedShiftTypes = newShiftTypes.map(type => {
      const updatedType = { ...type };
      
      // Make sure we have a valid color
      if (!updatedType.color || updatedType.color === "") {
        updatedType.color = DEFAULT_COLOR;
      }
      
      // Make sure we have a valid gradient
      if (!updatedType.gradient || updatedType.gradient === "") {
        updatedType.gradient = `linear-gradient(135deg, ${updatedType.color} 0%, ${updatedType.color} 100%)`;
      }
      
      // Remove isNew flag for storage
      const { isNew, ...rest } = updatedType;
      return rest;
    });
    
    setShiftTypes(newShiftTypes);
    
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.shiftTypes = validatedShiftTypes;
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Dispatch storage event to notify other components of the change
    window.dispatchEvent(new Event('storage'));
    
    // Log for debugging
    console.log("Saved shift types:", validatedShiftTypes);
  };

  const updateShiftType = (index: number, field: keyof ShiftTypeSettings, value: string) => {
    const newShiftTypes = [...shiftTypes];
    newShiftTypes[index] = {
      ...newShiftTypes[index],
      [field]: value
    };
    saveShiftTypes(newShiftTypes);
  };

  const updateNewShift = (field: keyof ShiftTypeSettings, value: string) => {
    setNewShift({
      ...newShift,
      [field]: value
    });
  };

  const handleSolidColor = () => {
    setColorMode('solid');
    if (selectedIndex !== null) {
      const color = shiftTypes[selectedIndex].color || DEFAULT_COLOR;
      setStartColor(color);
    } else {
      // For new shift
      setStartColor(newShift.color || DEFAULT_COLOR);
    }
  };

  const handleGradient = () => {
    setColorMode('gradient');
    if (selectedIndex !== null) {
      const color = shiftTypes[selectedIndex].color || DEFAULT_COLOR;
      setStartColor(color);
      
      let endColorValue;
      try {
        endColorValue = shiftTypes[selectedIndex].gradient?.match(/,(.*?)100%/)?.[1]?.trim() || `${color}99`;
      } catch (e) {
        endColorValue = `${color}99`;
      }
      
      setEndColor(endColorValue || "#6B7280");
    } else {
      // For new shift
      const color = newShift.color || DEFAULT_COLOR;
      setStartColor(color);
      
      let endColorValue;
      try {
        endColorValue = newShift.gradient?.match(/,(.*?)100%/)?.[1]?.trim() || `${color}99`;
      } catch (e) {
        endColorValue = `${color}99`;
      }
      
      setEndColor(endColorValue || "#6B7280");
    }
  };

  const handleColorConfirm = () => {
    if (selectedIndex !== null) {
      const newShiftTypes = [...shiftTypes];
      if (colorMode === 'solid') {
        newShiftTypes[selectedIndex] = {
          ...newShiftTypes[selectedIndex],
          color: startColor,
          gradient: `linear-gradient(135deg, ${startColor} 0%, ${startColor} 100%)`,
          isNew: false
        };
      } else if (colorMode === 'gradient') {
        newShiftTypes[selectedIndex] = {
          ...newShiftTypes[selectedIndex],
          color: startColor,
          gradient: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
          isNew: false
        };
      }
      
      // Apply special type if selected
      updateShiftTypeSpecial(selectedIndex, shiftTypeOption, newShiftTypes);
      
      saveShiftTypes(newShiftTypes);
    } else {
      // For new shift
      if (colorMode === 'solid') {
        setNewShift({
          ...newShift,
          color: startColor,
          gradient: `linear-gradient(135deg, ${startColor} 0%, ${startColor} 100%)`,
        });
      } else if (colorMode === 'gradient') {
        setNewShift({
          ...newShift,
          color: startColor,
          gradient: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
        });
      }
    }
    
    setIsDialogOpen(false);
    setColorMode(null);
  };

  const addShiftType = () => {
    // Reset the new shift to default values
    setNewShift({
      name: "New Shift",
      symbol: "",
      color: DEFAULT_COLOR,
      gradient: DEFAULT_GRADIENT,
      isNew: true,
      isOvertime: false,
      isTOIL: false,
      isSwapDone: false,
      isSwapOwed: false
    });
    
    // Show the new shift dialog
    setShowNewShiftDialog(true);
    setIsEditing(true); // Enter edit mode
  };

  const confirmAddShift = () => {
    const newShiftTypes = [...shiftTypes, newShift];
    saveShiftTypes(newShiftTypes);
    setShowNewShiftDialog(false);
    toast({
      title: "New shift added",
      description: `${newShift.name} has been added to your shift types.`,
    });
  };

  const removeShiftType = (index: number) => {
    const newShiftTypes = shiftTypes.filter((_, i) => i !== index);
    saveShiftTypes(newShiftTypes);
    setIsRemoveDialogOpen(false);
  };

  const toggleShiftToRemove = (index: number) => {
    setSelectedToRemove(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const removeSelectedShiftTypes = () => {
    const newShiftTypes = shiftTypes.filter((_, index) => !selectedToRemove.includes(index));
    saveShiftTypes(newShiftTypes);
    setIsRemoveDialogOpen(false);
    setSelectedToRemove([]);
  };

  const handleRemoveDialogOpen = () => {
    setSelectedToRemove([]);
    setIsRemoveDialogOpen(true);
  };

  const handleDialogOpen = (index: number | null = null) => {
    setSelectedIndex(index);
    
    if (index !== null) {
      const currentType = shiftTypes[index];
      setStartColor(currentType.color || DEFAULT_COLOR);
      
      let endColorValue;
      try {
        endColorValue = currentType.gradient?.match(/,(.*?)100%/)?.[1]?.trim() || `${currentType.color}99`;
      } catch (e) {
        endColorValue = `${currentType.color || DEFAULT_COLOR}99`;
      }
      
      setEndColor(endColorValue || "#6B7280");
      
      // Determine the shift type option
      if (currentType.isOvertime) {
        setShiftTypeOption("overtime");
      } else if (currentType.isTOIL) {
        setShiftTypeOption("toil");
      } else if (currentType.isSwapDone) {
        setShiftTypeOption("swap-done");
      } else if (currentType.isSwapOwed) {
        setShiftTypeOption("swap-owed");
      } else {
        setShiftTypeOption("regular");
      }
    } else {
      // For new shift
      setStartColor(newShift.color || DEFAULT_COLOR);
      
      let endColorValue;
      try {
        endColorValue = newShift.gradient?.match(/,(.*?)100%/)?.[1]?.trim() || `${newShift.color}99`;
      } catch (e) {
        endColorValue = `${newShift.color || DEFAULT_COLOR}99`;
      }
      
      setEndColor(endColorValue || "#6B7280");
      
      // Determine the shift type option
      if (newShift.isOvertime) {
        setShiftTypeOption("overtime");
      } else if (newShift.isTOIL) {
        setShiftTypeOption("toil");
      } else if (newShift.isSwapDone) {
        setShiftTypeOption("swap-done");
      } else if (newShift.isSwapOwed) {
        setShiftTypeOption("swap-owed");
      } else {
        setShiftTypeOption("regular");
      }
    }
    
    setIsDialogOpen(true);
    setColorMode(null);
  };

  const toggleEditing = () => {
    // If we're finishing editing mode, mark all shifts as not new
    if (isEditing) {
      const updatedShiftTypes = shiftTypes.map(type => ({
        ...type,
        isNew: false
      }));
      saveShiftTypes(updatedShiftTypes);
    }
    setIsEditing(!isEditing);
  };

  const addToPattern = () => {
    setCurrentPattern([...currentPattern, { shiftType: null, days: 1, isOff: true }]);
  };

  const updatePattern = (index: number, field: keyof ShiftPattern, value: any) => {
    const newPattern = [...currentPattern];
    if (field === 'shiftType') {
      newPattern[index] = {
        ...newPattern[index],
        shiftType: value,
        isOff: value === null
      };
    } else {
      newPattern[index] = { ...newPattern[index], [field]: value };
    }
    setCurrentPattern(newPattern);
  };

  const removeFromPattern = (index: number) => {
    setCurrentPattern(currentPattern.filter((_, i) => i !== index));
  };

  const openEditPatternDialog = (index: number) => {
    const patternToEdit = existingPatterns[index];
    setPatternName(patternToEdit.patternName);
    setCurrentPattern(patternToEdit.pattern.sequences);
    setRepeatTimes(patternToEdit.pattern.repeatTimes);
    setDaysOffAfter(patternToEdit.pattern.daysOffAfter);
    setYearsToGenerate(patternToEdit.years);
    setPatternStartDate(patternToEdit.startDate);
    setEditingPattern({ index, data: patternToEdit });
    setShowPatternDialog(true);
  };

  const generateShifts = () => {
    if (currentPattern.length === 0) {
      alert('Please add at least one step to your pattern');
      return;
    }

    const startDate = new Date(patternStartDate + 'T00:00:00');
    if (isNaN(startDate.getTime())) {
      alert('Please select a valid start date');
      return;
    }
    
    // Calculate the total days in one complete pattern cycle (including days off after cycle)
    const daysInCycle = currentPattern.reduce((total, step) => total + step.days, 0) * repeatTimes + daysOffAfter;
    
    // Calculate how many full cycles we need to fill the specified years
    // 365.25 days per year (accounting for leap years)
    const totalDaysNeeded = yearsToGenerate * 365.25;
    
    // Calculate how many complete cycles we need
    const calculatedCycles = Math.ceil(totalDaysNeeded / daysInCycle);
    
    const pattern: PatternCycle = {
      sequences: currentPattern.map(p => ({
        shiftType: p.shiftType,
        days: p.days,
        isOff: p.isOff
      })),
      repeatTimes: repeatTimes,
      daysOffAfter,
      patternName
    };

    const patternData = {
      pattern,
      startDate: startDate.toISOString().split('T')[0],
      years: yearsToGenerate,
      patternName
    };

    let updatedPatterns;
    if (editingPattern) {
      updatedPatterns = [...existingPatterns];
      updatedPatterns[editingPattern.index] = patternData;
    } else {
      updatedPatterns = [...existingPatterns, patternData];
    }
    
    sessionStorage.setItem('savedPatterns', JSON.stringify(updatedPatterns));
    setExistingPatterns(updatedPatterns);
    
    sessionStorage.setItem('patternData', JSON.stringify(patternData));
    
    setShowPatternDialog(false);
    setEditingPattern(null);
    navigate('/');
  };

  const switchToPattern = (patternData: any) => {
    sessionStorage.setItem('patternData', JSON.stringify(patternData));
    navigate('/');
  };

  const deletePattern = (index: number) => {
    const updatedPatterns = existingPatterns.filter((_, i) => i !== index);
    setExistingPatterns(updatedPatterns);
    sessionStorage.setItem('savedPatterns', JSON.stringify(updatedPatterns));
  };

  const openNewPatternDialog = () => {
    setPatternName(`Pattern ${existingPatterns.length + 1}`);
    setCurrentPattern([]);
    setRepeatTimes(1);
    setDaysOffAfter(0);
    setYearsToGenerate(1);
    setPatternStartDate(format(new Date(), 'yyyy-MM-dd'));
    setShowPatternDialog(true);
  };

  const closePatternDialog = () => {
    setShowPatternDialog(false);
    setEditingPattern(null);
    setCurrentPattern([]);
    setRepeatTimes(1);
    setDaysOffAfter(0);
    setYearsToGenerate(1);
    setPatternName(`Pattern ${existingPatterns.length + 1}`);
    setPatternStartDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const clearCalendar = () => {
    localStorage.removeItem('calendarShifts');
    sessionStorage.removeItem('savedPatterns');
    sessionStorage.removeItem('patternData');
    setExistingPatterns([]);
  };

  const handleSetDays = () => {
    const defaultPattern = [
      {
        shiftType: shiftTypes.length > 0 ? shiftTypes[0] : null,
        days: 5,
        isOff: false
      },
      {
        shiftType: null,
        days: 2,
        isOff: true
      }
    ];

    setCurrentPattern(defaultPattern);
    
    // Calculate 52 weeks worth of the pattern for a year
    const daysInDefaultCycle = 7; // 5 days on + 2 days off
    const cyclesPerYear = Math.ceil(365.25 / daysInDefaultCycle);
    
    setRepeatTimes(cyclesPerYear);
    setDaysOffAfter(0);
    setYearsToGenerate(1);
    setShowSetDaysDialog(true);
  };

  const generateSetDays = () => {
    // Calculate the total days in one complete pattern cycle
    const daysInCycle = currentPattern.reduce((total, step) => total + step.days, 0);
    
    // Calculate how many patterns we need to fill the years specified
    const totalDaysNeeded = yearsToGenerate * 365.25;
    
    // Calculate how many complete cycles we need
    const calculatedRepeatTimes = Math.ceil(totalDaysNeeded / daysInCycle);
    
    const pattern: PatternCycle = {
      sequences: currentPattern,
      repeatTimes: calculatedRepeatTimes,
      daysOffAfter: 0,
      patternName
    };

    const patternData = {
      pattern,
      startDate: patternStartDate,
      years: yearsToGenerate,
      patternName
    };

    let updatedPatterns = [...existingPatterns, patternData];
    sessionStorage.setItem('savedPatterns', JSON.stringify(updatedPatterns));
    setExistingPatterns(updatedPatterns);
    sessionStorage.setItem('patternData', JSON.stringify(patternData));
    setShowSetDaysDialog(false);
    navigate('/');
  };

  const updateShiftTypeSpecial = (
    index: number, 
    specialType: "regular" | "overtime" | "toil" | "swap-done" | "swap-owed",
    shiftTypesToUpdate = [...shiftTypes]
  ) => {
    // First, reset all special flags
    shiftTypesToUpdate[index] = {
      ...shiftTypesToUpdate[index],
      isOvertime: false,
      isTOIL: false,
      isSwapDone: false,
      isSwapOwed: false
    };
    
    // Then set the appropriate flag based on the selection
    if (specialType === "overtime") {
      shiftTypesToUpdate[index].isOvertime = true;
    } else if (specialType === "toil") {
      shiftTypesToUpdate[index].isTOIL = true;
    } else if (specialType === "swap-done") {
      shiftTypesToUpdate[index].isSwapDone = true;
    } else if (specialType === "swap-owed") {
      shiftTypesToUpdate[index].isSwapOwed = true;
    }
    
    if (shiftTypesToUpdate !== shiftTypes) {
      saveShiftTypes(shiftTypesToUpdate);
    }
  };

  const updateNewShiftSpecial = (specialType: "regular" | "overtime" | "toil" | "swap-done" | "swap-owed") => {
    // First, reset all special flags
    setNewShift({
      ...newShift,
      isOvertime: false,
      isTOIL: false,
      isSwapDone: false,
      isSwapOwed: false
    });
    
    // Then set the appropriate flag based on the selection
    if (specialType === "overtime") {
      setNewShift(prev => ({ ...prev, isOvertime: true }));
    } else if (specialType === "toil") {
      setNewShift(prev => ({ ...prev, isTOIL: true }));
    } else if (specialType === "swap-done") {
      setNewShift(prev => ({ ...prev, isSwapDone: true }));
    } else if (specialType === "swap-owed") {
      setNewShift(prev => ({ ...prev, isSwapOwed: true }));
    }
  };

  // Determine if a shift is "new" or actively being edited
  const isShiftBeingEdited = (shiftType: ShiftTypeSettings) => {
    return isEditing || shiftType.isNew === true;
  };

  return (
    <div className="h-dvh flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Shift Setup</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCalendar}
            className="h-8 px-3 text-xs"
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Clear Calendar
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-auto mb-20">
        <div className="p-2 sm:p-4 space-y-3">
          <div className="flex justify-between items-center gap-1">
            <h2 className="text-lg font-semibold">Shift Types</h2>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleSetDays}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Set Days
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={openNewPatternDialog}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Generate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={toggleEditing}
              >
                <PencilIcon className="h-3 w-3" />
                {isEditing ? "Done" : "Edit"}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={addShiftType}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
              {shiftTypes.length > 0 && (
                <Button 
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleRemoveDialogOpen}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            {shiftTypes.map((type, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 p-1.5 border rounded-lg ${
                  type.isOvertime ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20' : 
                  type.isTOIL ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' : 
                  type.isSwapDone ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 
                  type.isSwapOwed ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                {!isShiftBeingEdited(type) ? (
                  <>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-base">{type.name} ({type.symbol})</span>
                      {type.isOvertime && (
                        <span className="text-xs text-orange-600 font-medium dark:text-orange-400">Overtime</span>
                      )}
                      {type.isTOIL && (
                        <span className="text-xs text-purple-600 font-medium flex items-center dark:text-purple-400">
                          <Clock className="h-3 w-3 mr-1" />
                          TOIL
                        </span>
                      )}
                      {type.isSwapDone && (
                        <span className="text-xs text-green-600 font-medium flex items-center dark:text-green-400">
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                          Swap (Done)
                        </span>
                      )}
                      {type.isSwapOwed && (
                        <span className="text-xs text-blue-600 font-medium flex items-center dark:text-blue-400">
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                          Swap (Owed)
                        </span>
                      )}
                    </div>
                    <Input
                      value={type.symbol}
                      readOnly
                      className="h-9 w-16 text-center text-lg font-semibold mx-auto"
                    />
                    <div 
                      className="w-32 h-9 rounded border flex-1"
                      style={{ background: type.gradient || DEFAULT_GRADIENT }}
                      role="button"
                      aria-label="Shift color"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={type.name}
                        onChange={(e) => updateShiftType(index, 'name', e.target.value)}
                        className="h-9 text-base"
                        placeholder="Name"
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`special-type-switch-${index}`}
                          checked={type.isOvertime || type.isTOIL || type.isSwapDone || type.isSwapOwed || false}
                          onCheckedChange={(checked) => {
                            const newShiftTypes = [...shiftTypes];
                            if (checked) {
                              // Default to overtime when first checked
                              newShiftTypes[index] = {
                                ...newShiftTypes[index],
                                isOvertime: true,
                                isTOIL: false,
                                isSwapDone: false,
                                isSwapOwed: false
                              };
                            } else {
                              // Clear all special types
                              newShiftTypes[index] = {
                                ...newShiftTypes[index],
                                isOvertime: false,
                                isTOIL: false,
                                isSwapDone: false,
                                isSwapOwed: false
                              };
                            }
                            saveShiftTypes(newShiftTypes);
                          }}
                        />
                        <Label htmlFor={`special-type-switch-${index}`} className="text-xs text-muted-foreground">Special Type</Label>
                      </div>
                      
                      {(type.isOvertime || type.isTOIL || type.isSwapDone || type.isSwapOwed) && (
                        <RadioGroup
                          value={
                            type.isOvertime ? "overtime" : 
                            type.isTOIL ? "toil" : 
                            type.isSwapDone ? "swap-done" : 
                            type.isSwapOwed ? "swap-owed" : "regular"
                          }
                          onValueChange={(value: "regular" | "overtime" | "toil" | "swap-done" | "swap-owed") => {
                            updateShiftTypeSpecial(index, value);
                          }}
                          className="flex flex-wrap gap-1"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="overtime" id={`overtime-${index}`} />
                            <Label htmlFor={`overtime-${index}`} className="text-xs">Overtime</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="toil" id={`toil-${index}`} />
                            <Label htmlFor={`toil-${index}`} className="text-xs">TOIL</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="swap-done" id={`swap-done-${index}`} />
                            <Label htmlFor={`swap-done-${index}`} className="text-xs">Swap (Done)</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="swap-owed" id={`swap-owed-${index}`} />
                            <Label htmlFor={`swap-owed-${index}`} className="text-xs">Swap (Owed)</Label>
                          </div>
                        </RadioGroup>
                      )}
                    </div>
                    <Input
                      value={type.symbol}
                      onChange={(e) => {
                        updateShiftType(index, 'symbol', e.target.value.toUpperCase());
                      }}
                      className="h-9 w-16 text-center text-lg font-semibold uppercase mx-auto"
                      placeholder=""
                      maxLength={5}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-32 h-9 rounded border"
                        style={{ background: type.gradient || DEFAULT_GRADIENT }}
                        onClick={() => isEditing && handleDialogOpen(index)}
                        role="button"
                        aria-label="Select color"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleDialogOpen(index)}
                        variant="outline"
                        className="h-9 px-2 text-xs whitespace-nowrap"
                      >
                        Select Colour
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {existingPatterns.length > 0 && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="mt-8 space-y-2"
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <h2 className="text-lg font-semibold">Generated Patterns</h2>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="space-y-2">
                {existingPatterns.map((patternData, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background/50"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{patternData.patternName}</div>
                      <div className="text-sm text-muted-foreground">
                        Starts {format(new Date(patternData.startDate), 'dd MMM yyyy')} • 
                        Generates for {patternData.years} year{patternData.years !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditPatternDialog(index)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => switchToPattern(patternData)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePattern(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </Card>

      {/* New Shift Dialog */}
      <Dialog 
        open={showNewShiftDialog} 
        onOpenChange={(open) => {
          if (!open) setShowNewShiftDialog(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              Configure your new shift type and click Save when done
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-shift-name">Shift Name</Label>
              <Input
                id="new-shift-name"
                value={newShift.name}
                onChange={(e) => updateNewShift('name', e.target.value)}
                placeholder="e.g., Morning Shift"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-shift-symbol">Symbol</Label>
              <Input
                id="new-shift-symbol"
                value={newShift.symbol}
                onChange={(e) => updateNewShift('symbol', e.target.value.toUpperCase())}
                placeholder="e.g., M"
                className="uppercase"
                maxLength={5}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-md border"
                style={{ background: newShift.gradient || DEFAULT_GRADIENT }}
              />
              <Button 
                variant="outline" 
                onClick={() => handleDialogOpen(null)}
              >
                Select Color
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="new-special-type-switch"
                  checked={newShift.isOvertime || newShift.isTOIL || newShift.isSwapDone || newShift.isSwapOwed || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewShift({
                        ...newShift,
                        isOvertime: true,
                        isTOIL: false,
                        isSwapDone: false,
                        isSwapOwed: false
                      });
                    } else {
                      setNewShift({
                        ...newShift,
                        isOvertime: false,
                        isTOIL: false,
                        isSwapDone: false,
                        isSwapOwed: false
                      });
                    }
                  }}
                />
                <Label htmlFor="new-special-type-switch">Special Type</Label>
              </div>
              
              {(newShift.isOvertime || newShift.isTOIL || newShift.isSwapDone || newShift.isSwapOwed) && (
                <RadioGroup
                  value={
                    newShift.isOvertime ? "overtime" : 
                    newShift.isTOIL ? "toil" : 
                    newShift.isSwapDone ? "swap-done" : 
                    newShift.isSwapOwed ? "swap-owed" : "regular"
                  }
                  onValueChange={(value: "regular" | "overtime" | "toil" | "swap-done" | "swap-owed") => {
                    updateNewShiftSpecial(value);
                  }}
                  className="grid grid-cols-2 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overtime" id="new-overtime" />
                    <Label htmlFor="new-overtime">Overtime</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="toil" id="new-toil" />
                    <Label htmlFor="new-toil">TOIL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="swap-done" id="new-swap-done" />
                    <Label htmlFor="new-swap-done">Swap (Done)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="swap-owed" id="new-swap-owed" />
                    <Label htmlFor="new-swap-owed">Swap (Owed)</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewShiftDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddShift}>
              Save Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showSetDaysDialog} 
        onOpenChange={(open) => {
          if (!open) setShowSetDaysDialog(false);
        }}
      >
        <DialogContent className="flex h-[85vh] flex-col overflow-hidden">
          <DialogHeader className="flex-none p-4 pb-2">
            <DialogTitle>Set Working Days Pattern</DialogTitle>
            <DialogDescription>
              Configure your working days and off days pattern
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Pattern Name</Label>
                <Input
                  type="text"
                  value={patternName}
                  onChange={(e) => setPatternName(e.target.value)}
                  placeholder="Enter pattern name"
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={patternStartDate}
                  onChange={(e) => setPatternStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Working Pattern</Label>
                <div className="p-3 border rounded bg-muted/50 space-y-4">
                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={currentPattern[0]?.shiftType?.name || ""}
                        onChange={(e) => {
                          const selectedType = shiftTypes.find(t => t.name === e.target.value);
                          const newPattern = [...currentPattern];
                          newPattern[0] = { ...newPattern[0], shiftType: selectedType || null };
                          setCurrentPattern(newPattern);
                        }}
                      >
                        {shiftTypes.map((type) => (
                          <option key={type.name} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={currentPattern[0]?.days || 5}
                        onChange={(e) => {
                          const days = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 7);
                          const newPattern = [...currentPattern];
                          newPattern[0] = { ...newPattern[0], days };
                          setCurrentPattern(newPattern);
                        }}
                        className="w-20"
                      />
                      <span className="text-sm">days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Off Days</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={currentPattern[1]?.days || 2}
                        onChange={(e) => {
                          const days = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 7);
                          const newPattern = [...currentPattern];
                          newPattern[1] = { ...newPattern[1], days, isOff: true, shiftType: null };
                          setCurrentPattern(newPattern);
                        }}
                        className="w-20"
                      />
                      <span className="text-sm">days off</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Generate Pattern For</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={yearsToGenerate}
                  onChange={(e) => {
                    const years = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 10);
                    setYearsToGenerate(years);
                    const totalDays = (currentPattern[0]?.days || 5) + (currentPattern[1]?.days || 2);
                    setRepeatTimes(Math.floor(years * 365.25 / totalDays));
                  }}
                />
                <span className="text-sm text-muted-foreground">years (0-10)</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-none p-4 bg-background border-t mt-auto">
            <Button onClick={generateSetDays} className="w-full">
              Generate Set Days Pattern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showPatternDialog} 
        onOpenChange={(open) => {
          if (!open) closePatternDialog();
        }}
      >
        <DialogContent className="flex h-[85vh] flex-col overflow-hidden">
          <DialogHeader className="flex-none p-4 pb-2">
            <DialogTitle>
              {editingPattern ? 'Edit Shift Pattern' : 'Generate Custom Pattern'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Pattern Name</Label>
                <Input
                  type="text"
                  value={patternName}
                  onChange={(e) => setPatternName(e.target.value)}
                  placeholder="Enter pattern name"
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={patternStartDate}
                  onChange={(e) => setPatternStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Pattern Sequence</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addToPattern}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                
                {currentPattern.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={step.isOff ? "off" : (step.shiftType?.name || "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "off") {
                          updatePattern(index, 'shiftType', null);
                        } else {
                          const selectedType = shiftTypes.find(t => t.name === value);
                          updatePattern(index, 'shiftType', selectedType || null);
                        }
                      }}
                    >
                      <option value="off">Days Off</option>
                      {shiftTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    
                    <Input
                      type="number"
                      min="1"
                      value={step.days}
                      onChange={(e) => updatePattern(index, 'days', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromPattern(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Repeat Pattern</Label>
                  <Input
                    type="number"
                    min="1"
                    value={repeatTimes}
                    onChange={(e) => setRepeatTimes(parseInt(e.target.value))}
                    readOnly={currentPattern.length === 2 && currentPattern[0].days === 5 && currentPattern[1].days === 2}
                  />
                  <span className="text-sm text-muted-foreground">times</span>
                </div>
                
                {currentPattern.length !== 2 || currentPattern[0]?.days !== 5 || currentPattern[1]?.days !== 2 ? (
                  <div className="space-y-2">
                    <Label>Days Off After Cycle</Label>
                    <Input
                      type="number"
                      min="0"
                      value={daysOffAfter}
                      onChange={(e) => setDaysOffAfter(parseInt(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Generate Pattern For</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={yearsToGenerate}
                  onChange={(e) => {
                    const years = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 10);
                    setYearsToGenerate(years);
                    // If this is a set days pattern (5-2), update repeat times automatically
                    if (currentPattern.length === 2 && currentPattern[0]?.days === 5 && currentPattern[1]?.days === 2) {
                      setRepeatTimes(years * 52);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">years (0-10)</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-none p-4 bg-background border-t mt-auto">
            <Button onClick={generateShifts} className="w-full">
              {editingPattern ? 'Update Pattern' : 'Generate Pattern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Colour Type</DialogTitle>
          </DialogHeader>
          {!colorMode ? (
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleSolidColor}>Solid Colour</Button>
              <Button onClick={handleGradient}>Gradient</Button>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{colorMode === 'solid' ? 'Colour' : 'Start Colour'}</Label>
                <Input
                  type="color"
                  value={startColor}
                  onChange={(e) => setStartColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              
              {colorMode === 'gradient' && (
                <div className="space-y-2">
                  <Label>End Colour</Label>
                  <Input
                    type="color"
                    value={endColor}
                    onChange={(e) => setEndColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              )}

              {/* Only show the shift type options if this is a new shift or we're not currently editing any shifts */}
              {!isEditing && (
                <div className="space-y-4">
                  <Label className="block mb-2">Shift Type</Label>
                  <RadioGroup
                    value={shiftTypeOption}
                    onValueChange={(value: "regular" | "overtime" | "toil" | "swap-done" | "swap-owed") => {
                      setShiftTypeOption(value);
                    }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="r1" />
                      <Label htmlFor="r1">Regular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overtime" id="r2" />
                      <Label htmlFor="r2">Overtime</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="toil" id="r3" />
                      <Label htmlFor="r3">TOIL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="swap-done" id="r4" />
                      <Label htmlFor="r4">Swap (Done)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="swap-owed" id="r5" />
                      <Label htmlFor="r5">Swap (Owed)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setColorMode(null)}>Back</Button>
                <Button onClick={handleColorConfirm}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Shift Types</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {shiftTypes.map((type, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${
                  selectedToRemove.includes(index) ? 'border-destructive bg-destructive/10' : ''
                }`}
                onClick={() => toggleShiftToRemove(index)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border flex items-center justify-center font-semibold"
                    style={{ background: type.gradient || DEFAULT_GRADIENT }}
                  >
                    {type.symbol}
                  </div>
                  <span>{type.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedToRemove.includes(index) && (
                    <Check className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
            {selectedToRemove.length > 0 && (
              <Button
                variant="destructive"
                onClick={removeSelectedShiftTypes}
                className="mt-2"
              >
                Remove Selected ({selectedToRemove.length})
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/")}
          >
            <CalendarDays className="h-8 w-8" />
          </Button>
          
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-semibold text-xl">S</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSetup;
