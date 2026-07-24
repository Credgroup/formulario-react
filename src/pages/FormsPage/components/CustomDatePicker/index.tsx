import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CustomDatePicker({ field, date, setDate }: any) {
  const [inputDate, setInputDate] = useState(
    date ? format(date, "dd/MM/yyyy") : ""
  );
  const fromDate =
    field.dateConfig === "minToday" ? new Date() : new Date(1900, 0, 1);
  const toDate =
    field.dateConfig === "maxToday" ? new Date() : new Date(2100, 11, 31);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    
    if (val.length > 4) {
      val = val.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    } else if (val.length > 2) {
      val = val.replace(/(\d{2})(\d{1,4})/, "$1/$2");
    }
    
    setInputDate(val);
  }

  function handleInputBlur() {
    const parsed = parse(inputDate, "dd/MM/yyyy", new Date());
    if (isValid(parsed) && parsed >= fromDate && parsed <= toDate) {
      setDate(parsed); // atualiza data selecionada no calendário
    } else {
      console.log("data", date);
      // Se inválido, pode resetar input para a data atual selecionada
      if (!date) {
        setInputDate("");
        toast.error("Data inválida");
        return;
      }

      setInputDate(format(date, "dd/MM/yyyy"));
    }
  }

  return (
    <Popover>
      <PopoverTrigger className="w-full" asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
          ) : (
            <span>Selecione uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-2">
        <Label
          htmlFor="input_date"
          className="flex flex-col justify-start items-start space-y-2 text-zinc-600"
        >
          Digite a data
          <Input
            id="input_date"
            value={inputDate}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            maxLength={10}
            placeholder="DD/MM/AAAA"
          />
        </Label>

        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              setDate(d);
              setInputDate(format(d, "dd/MM/yyyy"));
            }
          }}
          fromDate={fromDate}
          toDate={toDate}
          locale={ptBR}
          month={date}
          disableNavigation={true}
        />
      </PopoverContent>
    </Popover>
  );
}
