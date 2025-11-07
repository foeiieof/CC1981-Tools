import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export function CalendarPicker(
  { data, setData, topic }: { data: Date | undefined, setData: Dispatch<SetStateAction<Date | undefined>>, topic?: string }
) {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {data ? data.toLocaleDateString() : topic ? topic : "Select start date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={data}
            captionLayout="dropdown"
            onSelect={(d) => {
              setData(d)
              setOpen(false)
            }}
          />

        </PopoverContent>
      </Popover>
    </div>
  )
}
