"use client"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, FilePlus2 } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { DaysMapWithColor } from "./CampaignTable"
import { B2C_ChannelTable } from "@prisma/client"
import { Record } from "@prisma/client/runtime/library"
import Form from "next/form"
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from "sonner"

function CheckAvailableDateInForm(start: Date | undefined, end: Date | undefined): boolean {
  if (!start || !end) return false
  return start.getTime() <= end.getTime()

}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}


interface IReqCreateChannelDialog {
  table: B2C_ChannelTable[] | null
}

export default function CreateChannelDialog({ table }: IReqCreateChannelDialog) {


  const [openDateFrom, setOpenDateFrom] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [monthForm, setMonthForm] = useState(new Date())

  const [openDateTo, setOpenDateTo] = useState(false)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  const [dayList, setDayList] = useState<Record<string, boolean>>({
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false
  })

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    ChannelId: "",
    Brand: "",
    WorkDays: "",
    WorkTimeStartTime: "00:00:00",
    WorkTimeEndTime: "00:00:00",
    DayType: "",
    IsWorkOnHolidays: "false",

    ChannelType: "",
    Remark: "",
    StartDate: "",
    EndDate: "",
    CreatedBy: "CC1981",
    ModifiedBy: "CC1981",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleCreate() {
    toast("You submitted the following values", {
      duration: 5000,
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          {JSON.stringify(formData, null, 2)}
        </pre>
      ),
    })

    setIsLoading(true)
    try {
      const res = await fetch("/api/channel-process-working", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })


      if (!res.ok) { throw new Error(`Error Create Channel-table: ${res.status}`) }

      const resJson = await res.json()
      // console.log("res::::", resJson)
      if (resJson != null) {
        setOpenCreate(false)
        window.location.reload()
      }
    }
    catch (err) {
      console.log(`handleCreate - Channel-table : ${err}`)
    }
    finally { setIsLoading(false) }
    console.log("on Click")
  }

  const channelTypeData = table?.reduce<Record<string, B2C_ChannelTable[]>>(
    (acc, item) => {
      const key = item.ChannelType || "unknow"
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

  const [brandData, setBrandData] = useState<(string | null)[]>([])

  // const brandData = Array.from(new Set(table?.map(item => item.Brand).filter(Boolean)))

  const [channelCat, setChannelCat] = useState<B2C_ChannelTable[] | null>(null)

  const [openCreate, setOpenCreate] = useState(false)

  return (
    <Dialog open={openCreate} onOpenChange={setOpenCreate} >
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpenCreate(true)}
          variant="outline"
          className="hover:bg-zinc-800 hover:text-white gap-2"
        >
          <FilePlus2 className="w-4 h-4" />
          Create New
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Channel Setup</DialogTitle>
          <DialogDescription>
            Fill in details to create a new channel process working setup.
          </DialogDescription>
        </DialogHeader>

        <Form action={"/api/channel-table"}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="ChannelId">Channel Type</Label>
                <Select
                  onValueChange={(val) => {
                    setBrandData([])
                    setFormData(formData)

                    if (val === "ALL") {
                      // const brand = Array.from(new Set(table?.map(item => item.Brand).filter(Boolean)))
                      // console.log(brand)
                      // setBrandData(brand)

                      setFormData((prev) => ({ ...prev, ChannelId: "ALL", Brand: "", }))
                    }
                    setFormData((prev) => ({ ...prev, ChannelId: "", Brand: "" }))

                    setFormData((prev) => ({ ...prev, ChannelType: val }))
                    const items = channelTypeData?.[val] || []
                    setChannelCat(items)


                    const brand = Array.from(new Set(items?.map((i) => i.Brand).filter(Boolean)))
                    // console.log("brnad:", brand)
                    setBrandData(brand)
                  }}
                  defaultValue={formData.ChannelType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >

                      <SelectItem key={`key-ALL`} value="ALL" >ALL</SelectItem>

                      {channelTypeData && Object.entries(channelTypeData as Record<string, B2C_ChannelTable[]>).map(([channels,]) => (
                        <SelectItem key={`key-${channels}`} value={channels} >{channels}</SelectItem>))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* <Input */}
                {/*   id="ChannelType" */}
                {/*   name="ChannelType" */}
                {/*   value={formData.ChannelType} */}
                {/*   onChange={handleChange} */}
                {/*   placeholder="101" */}
                {/* /> */}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ChannelId">Shop Name</Label>
                <Select
                  onValueChange={(val) => {
                    if (val === "ALL") {
                      const brand = Array.from(new Set(table?.map(item => item.Brand).filter(Boolean)))
                      console.log("val:::::::::",
                        brandData)
                      setBrandData([...brand])
                      // setFormData((prev) => ({ ...prev, ChannelId: "-1", Brand: "" }))
                    }
                    else {
                      const selected = channelCat?.find(ch => ch.ChannelId.toString() === val)
                      setFormData((prev) => ({
                        ...prev,
                        ChannelId: val,
                        Brand: selected?.Brand ?? ""
                      }))
                      setBrandData([])
                    }

                  }}
                  defaultValue={formData.ChannelId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      {formData.ChannelType != "" ? (
                        <>
                          <SelectItem value="ALL">ALL</SelectItem>
                          {channelCat ? channelCat?.map((ch) => (<SelectItem key={`key-${ch.ChannelId}`} value={ch.ChannelId.toString()} >{ch.Name}</SelectItem>)) : <></>}
                        </>
                      ) : ("")}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="grid gap-2">
              <Label htmlFor="Brand">Brand</Label>

              {
                brandData.length > 1
                  ? (<>
                    <Select
                      onValueChange={
                        (val) => {
                          // const selected = channelCat?.find(ch => ch.ChannelId.toString() === val)
                          setFormData((prev) => ({
                            ...prev,
                            Brand: val ?? ""
                          }))
                        }
                      }
                      defaultValue={formData.Brand}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup >
                          <SelectLabel>Brand</SelectLabel>
                          <SelectItem value="ALL" >ALL</SelectItem>
                          {brandData ? brandData?.map((ch) => (
                            <SelectItem key={`key-${ch}`} value={ch ?? ""} >{ch}</SelectItem>
                          )) : <></>}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </>)
                  : (<>
                    <Input
                      id="ChannelType"
                      name="ChannelType"
                      value={formData.Brand}
                      onChange={handleChange}
                      placeholder="..."
                      disabled={true}
                    />


                  </>)
              }
            </div>

            <div className="grid gap-2">

              <Label htmlFor="WorkDays">Work Days</Label>
              <div className="grid grid-cols-7 gap-1">
                {Object.entries(DaysMapWithColor).map(([k, v]) => {
                  return (
                    <div className={
                      `max-w-8  h-8 hover:border flex justify-center items-center rounded-2xl text-[12px] border font-bold select-none ${dayList[k] ? "bg-black text-white" : ""}`}
                      key={k}
                      onClick={() => {
                        // console.log(k)
                        setDayList((prev) => {
                          const updated = { ...prev, [k]: !prev[k] }
                          setFormData((prev) => ({
                            ...prev,
                            WorkDays: Object.entries(updated)
                              .filter(([, v]) => v)
                              .map(([k]) => k)
                              .join("|"),
                          }))
                          return updated
                        })
                      }
                      }
                    >
                      {v.name}
                    </div>)
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="dayType">Day Type</Label>
                <Select onValueChange={(val) => setFormData((prev) => ({ ...prev, DayType: val }))} defaultValue={formData.DayType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      <SelectItem value="WorkDay">Work Day</SelectItem>
                      <SelectItem value="DayOff">Day off</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="WorkTimeStartTime">Start Time</Label>
                <Input
                  id="WorkTimeStartTime"
                  name="WorkTimeStartTime"
                  type="time"
                  value={formData.WorkTimeStartTime}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="WorkTimeEndTime">End Time</Label>
                <Input
                  id="WorkTimeEndTime"
                  name="WorkTimeEndTime"
                  type="time"
                  value={formData.WorkTimeEndTime}
                  onChange={handleChange}
                />
              </div>
            </div>


            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-2 ">
                <Label htmlFor="dataTo">Work on Holidays</Label>
                <Select
                  onValueChange={(val) => { setFormData((prev) => ({ ...prev, IsWorkOnHolidays: val })) }}
                  defaultValue={formData.IsWorkOnHolidays}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"true"} > True </SelectItem>
                      <SelectItem value={"false"} > False </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 ">
                <Label htmlFor="dataTo">Start Date</Label>
                <div className="relative flex gap-2">
                  <Input
                    // defaultValue={0}
                    id="dateFrom"
                    value={formData.StartDate}
                    placeholder="YYYY-MM-DD"
                    className="bg-background pr-10"
                    onChange={() => { }}
                    onKeyDown={(e) => {

                      console.log(monthForm)

                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setOpenDateFrom(true)
                      }
                    }}
                  />
                  <Popover open={openDateFrom} onOpenChange={setOpenDateFrom} modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker-from"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0 z-50"
                      side="left"
                      align="end"
                      alignOffset={10}
                      sideOffset={-10}
                    >
                      <Calendar
                        id="StartDate"
                        className="z-[55]"
                        mode="single"
                        selected={new Date(formData.StartDate)}
                        captionLayout="dropdown"
                        month={monthForm}
                        onMonthChange={setMonthForm}
                        onSelect={(selected) => {
                          if (!selected) return
                          setDateFrom((prev) => {
                            const updated = { ...prev, dateFrom: selected }
                            setFormData((prev) => ({
                              ...prev,
                              StartDate: format(updated.dateFrom, "yyyy-MM-dd")
                            }))
                            return updated.dateFrom
                          })
                          setMonthForm(selected)
                          setOpenDateFrom(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dataTo">End Date</Label>
                <div className="relative flex gap-2">
                  <Input
                    id="dateTo"
                    value={dateTo ? format(dateTo, "yyyy-MM-dd") : ""}
                    placeholder="YYYY-MM-DD"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      if (isValidDate(newDate)) {
                        setDateTo(newDate)
                        setMonthForm(newDate)
                      } else {
                        setDateTo(undefined)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setOpenDateTo(true)
                      }
                    }}
                  />
                  <Popover open={openDateTo} onOpenChange={setOpenDateTo} modal={true}>
                    <PopoverTrigger asChild>
                      <Button id="date-picker-from"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0 z-50"
                      side="left"
                      align="end"
                      alignOffset={10}
                      sideOffset={-10}
                    >
                      <Calendar
                        className="z-[55]"
                        mode="single"
                        selected={dateTo}
                        captionLayout="dropdown"
                        month={monthForm}
                        onMonthChange={setMonthForm}
                        onSelect={(selected) => {
                          console.log(selected)
                          if (!selected) return
                          if (CheckAvailableDateInForm(dateFrom, selected)) {
                            setDateTo((prev) => {
                              const updated = { ...prev, dateFrom: selected }
                              setFormData((prev) => ({
                                ...prev,
                                EndDate: format(updated.dateFrom, "yyyy-MM-dd")
                              }))
                              return updated.dateFrom
                            })
                            setDateTo(selected)
                            setMonthForm(selected)
                            setOpenDateTo(false)
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="remark-form"> *Remark </Label>
              <Input
                id="Remark"
                name="Remark"
                value={formData.Remark}
                onChange={handleChange}
                placeholder=":)"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button onClick={() => handleCreate()} type="button">
              {!isLoading ? (" Create ") : (<Spinner />)}
            </Button>
            <DialogClose asChild>
              <Button onClick={() => setOpenCreate(false)} type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog >
  )
}

