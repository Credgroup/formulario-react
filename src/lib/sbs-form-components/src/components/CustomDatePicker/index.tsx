import { format, getDaysInMonth, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "../../utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { FieldType } from "../../core/types";

type CustomDatePickerProps = {
  field: Partial<FieldType>;
  date: Date | string | undefined;
  setDate: (date: Date) => void;
};

const parseDateString = (dateVal: any): Date | undefined => {
  if (!dateVal) return undefined;
  if (dateVal instanceof Date) {
    return isValid(dateVal) ? dateVal : undefined;
  }
  
  const cleanStr = String(dateVal).trim();
  if (!cleanStr) return undefined;

  // Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [year, month, day] = cleanStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return isValid(d) ? d : undefined;
  }

  // Formato DD-MM-YYYY ou DD/MM/YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(cleanStr)) {
    const separator = cleanStr.includes("-") ? "-" : "/";
    const [day, month, year] = cleanStr.split(separator).map(Number);
    const d = new Date(year, month - 1, day);
    return isValid(d) ? d : undefined;
  }

  // Qualquer outro formato que Date consiga parsear
  const parsed = new Date(cleanStr);
  return isValid(parsed) ? parsed : undefined;
};

export function CustomDatePicker({ field, date, setDate }: Readonly<CustomDatePickerProps>) {
  const [isOpen, setIsOpen] = useState(false);

  const initialDate = parseDateString(date);
  const [daySelected, setDaySelected] = useState<string>(initialDate ? String(initialDate.getDate()) : "");
  const [monthSelected, setMonthSelected] = useState<string>(initialDate ? String(initialDate.getMonth()) : "");
  const [yearSelected, setYearSelected] = useState<string>(initialDate ? String(initialDate.getFullYear()) : "");

  useEffect(() => {
    if (isOpen) {
      const parsed = parseDateString(date);
      if (parsed) {
        setDaySelected(String(parsed.getDate()));
        setMonthSelected(String(parsed.getMonth()));
        setYearSelected(String(parsed.getFullYear()));
      } else {
        setDaySelected("");
        setMonthSelected("");
        setYearSelected("");
      }
    }
  }, [date, isOpen]);

  const parsedDate = useMemo(() => parseDateString(date), [date]);

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isMinToday = field?.dateConfig === "minToday";
    const isMaxToday = field?.dateConfig === "maxToday";

    const min = isMinToday ? today : new Date(1900, 0, 1);
    const max = isMaxToday ? today : new Date(2100, 11, 31);

    return { minDate: min, maxDate: max };
  }, [field?.dateConfig]);

  const yearOptions = useMemo(() => {
    const options = [];
    const minD = minDate.getFullYear();
    const maxD = maxDate.getFullYear();
    for (let i = maxD; i >= minD; i--) {
      options.push(i);
    }
    return options;
  }, [minDate, maxDate]);

  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const monthD = new Date(2000, i, 1);
      const monthName = format(monthD, "MMMM", { locale: ptBR });

      let isValid = true;
      if (yearSelected) {
        const y = parseInt(yearSelected);
        if (y === minDate.getFullYear() && i < minDate.getMonth()) isValid = false;
        if (y === maxDate.getFullYear() && i > maxDate.getMonth()) isValid = false;
      }

      if (isValid) {
        options.push({ value: String(i), label: monthName.charAt(0).toUpperCase() + monthName.slice(1) });
      }
    }
    return options;
  }, [yearSelected, minDate, maxDate]);

  const dayOptions = useMemo(() => {
    const options = [];
    let dInMonth = 31;
    if (yearSelected && monthSelected) {
      dInMonth = getDaysInMonth(new Date(parseInt(yearSelected), parseInt(monthSelected)));
    }

    for (let i = 1; i <= dInMonth; i++) {
      let isValid = true;
      if (yearSelected && monthSelected) {
        const y = parseInt(yearSelected);
        const m = parseInt(monthSelected);
        if (y === minDate.getFullYear() && m === minDate.getMonth() && i < minDate.getDate()) isValid = false;
        if (y === maxDate.getFullYear() && m === maxDate.getMonth() && i > maxDate.getDate()) isValid = false;
      }
      if (isValid) {
        options.push(i);
      }
    }
    return options;
  }, [yearSelected, monthSelected, minDate, maxDate]);

  const onHandleChangeYear = (value: string) => {
    setYearSelected(value);

    const y = parseInt(value);
    if (monthSelected) {
      const m = parseInt(monthSelected);
      let isMonthValid = true;
      if (y === minDate.getFullYear() && m < minDate.getMonth()) isMonthValid = false;
      if (y === maxDate.getFullYear() && m > maxDate.getMonth()) isMonthValid = false;

      if (!isMonthValid) {
        setMonthSelected("");
        setDaySelected("");
      } else if (daySelected) {
        const d = parseInt(daySelected);
        const daysInChoice = getDaysInMonth(new Date(y, m));
        let isDayValid = d <= daysInChoice;
        if (y === minDate.getFullYear() && m === minDate.getMonth() && d < minDate.getDate()) isDayValid = false;
        if (y === maxDate.getFullYear() && m === maxDate.getMonth() && d > maxDate.getDate()) isDayValid = false;

        if (!isDayValid) setDaySelected("");
      }
    }
  };

  const onHandleChangeMonth = (value: string) => {
    setMonthSelected(value);
    if (yearSelected && daySelected) {
      const y = parseInt(yearSelected);
      const m = parseInt(value);
      const d = parseInt(daySelected);

      const daysInChoice = getDaysInMonth(new Date(y, m));
      let isDayValid = d <= daysInChoice;
      if (y === minDate.getFullYear() && m === minDate.getMonth() && d < minDate.getDate()) isDayValid = false;
      if (y === maxDate.getFullYear() && m === maxDate.getMonth() && d > maxDate.getDate()) isDayValid = false;

      if (!isDayValid) setDaySelected("");
    }
  };

  const onHandleChangeDay = (value: string) => {
    setDaySelected(value);
  };

  const previewDate = useMemo(() => {
    if (daySelected && monthSelected && yearSelected) {
      const y = parseInt(yearSelected);
      const m = parseInt(monthSelected);
      const d = parseInt(daySelected);
      return new Date(y, m, d);
    }
    return null;
  }, [daySelected, monthSelected, yearSelected])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !parsedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {parsedDate
            ? format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            : "Selecione uma data"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4">
        <h1 className="text-sm font-medium">
          Data selecionada
        </h1>
        <h2 className="text-2xl mb-4 font-bold">{previewDate
          ? `${format(previewDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
          : "dd de mm de yyyy"}</h2>

        <div className="flex gap-2">
          {/* dia */}
          <Select onValueChange={onHandleChangeDay} value={daySelected}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {dayOptions.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* mes */}
          <Select onValueChange={onHandleChangeMonth} value={monthSelected}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ano */}
          <Select onValueChange={onHandleChangeYear} value={yearSelected}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full mt-4"
          disabled={!previewDate}
          onClick={() => {
            if (previewDate) {
              setDate(previewDate);
              setIsOpen(false);
            }
          }}
        >
          Salvar
        </Button>
      </PopoverContent>
    </Popover>
  );
}