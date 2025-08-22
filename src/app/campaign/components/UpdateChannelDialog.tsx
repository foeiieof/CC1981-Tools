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
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { format } from "date-fns"
import { DaysMapWithColor } from "./CampaignTable"
import { toast } from "sonner"
import { B2C_ChannelProcessWorkingSetup, B2C_ChannelTable } from "@prisma/client"
import { Record } from "@prisma/client/runtime/library"
import Form from "next/form"
import { Spinner } from '@/components/ui/shadcn-io/spinner';

// function formatDateRangeInForm<T extends Record<string, string>>(date: DateRange, setState: Dispatch<SetStateAction<T>>) {
//   if (!date?.from || !date.to) return ""

//   const formatFrom = format(date.from, "yyyy-MM-dd")
//   const formatTo = format(date.to, "yyyy-MM-dd")

//   setState(prev => ({
//     ...prev,
//     StartDate: formatFrom,
//     EndDate: formatTo
//   }))
//   return `${formatFrom} → ${formatTo}`
// }

function CheckAvailableDateInForm(start: Date | undefined, end: Date | undefined): boolean {
  if (!start || !end) return false
  return start.getTime() <= end.getTime()

}

// function parseLocalDate(value: string) {
//   const [year, month, day] = value.split("-").map(Number)
//   return new Date(year, month - 1, day)
// }

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export enum EStateCreateChannelDialog { CREATE, UPDATE }

interface IReqCreateChannelDialog {
  data?: B2C_ChannelProcessWorkingSetup | null,
  table: B2C_ChannelTable[] | null
  state?: EStateCreateChannelDialog,
  open: boolean
  onClose: () => void
}

export default function UpdateChannelDialog({
  data,
  table,
  state = EStateCreateChannelDialog.CREATE,
  open = false,
  onClose
}: IReqCreateChannelDialog) {


  // console.log(data)
  const [openDateFrom, setOpenDateFrom] = useState(false)
  // const [dataChannel, setDataChannel] = useState<B2C_ChannelTable[] | null>(null)
  // const [value, setValue] = useState("")
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
    "5": false, "6": false
  })

  const [isOpenForm, setIsOpenForm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    ChannelId: "",
    Brand: "",
    WorkDays: "",
    WorkTimeStartTime: "00:00",
    WorkTimeEndTime: "00:00",
    DayType: "",

    ChannelType: "",
    Remark: "",
    StartDate: "",
    EndDate: "",
    ModifiedBy: "CC1981",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target
    toast("Changes values", {
      duration: 5000,
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify({ name, value }, null, 2)}</code>
        </pre>
      ),
    })

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleCreate() {
    const update = {}
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
      const res = await fetch("/api/channel-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        throw new Error(`Error Create Channel-table: ${res.status}`)
      }

      const resData = await res.json()
      // console.log(`Res handleCreate: ${resData}`)
    }
    catch (err) {
      console.log(`handleCreate - Channel-table : ${err}`)
    }
    finally { setIsLoading(false) }
    // console.log("on Click")
  }

  async function handleUpdate() {

    toast("Update Working process", {
      duration: 3000,
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(formData, null, 2)}</code>
        </pre>)
    })
    // console.log("Click update")
  }

  const channelTypeData = table?.reduce<Record<string, B2C_ChannelTable[]>>(
    (acc, item) => {
      const key = item.ChannelType || "unknow"
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

  const [channelCat, setChannelCat] = useState<B2C_ChannelTable[] | null>(null)

  useEffect((() => {
    if (data != null) {
      setFormData((prev) => ({
        ...prev,
        ChannelId: data?.ChannelId?.toString(),
        Brand: data.Brand,
        WorkDays: data.WorkDays,
        WorkTimeStartTime: data.WorkTimeStartTime ? new Date(data.WorkTimeStartTime).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) : "",
        WorkTimeEndTime: data.WorkTimeEndTime ? new Date(data.WorkTimeEndTime).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) : "",
        DayType: data.DayType,
        ChannelType: data.ChannelType,
        Remark: data.Remark ?? "",
        StartDate: format(data.StartDate, "yyyy-MM-dd"),
        EndDate: format(data.EndDate, "yyyy-MM-dd"),
      }))
    }
  }), [data])

  return (
    <Dialog open={open} onOpenChange={onClose} >
      {
        state === EStateCreateChannelDialog.CREATE && data == null ?
          (
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-zinc-800 hover:text-white gap-2"
              >
                <FilePlus2 className="w-4 h-4" />
                Create New
              </Button>
            </DialogTrigger>


          )
          : (<></>)

      }
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {state === EStateCreateChannelDialog.CREATE && data == null ?
            <><DialogTitle>Create Channel Setup</DialogTitle>
              <DialogDescription>
                Fill in details to create a new channel process working setup.
              </DialogDescription>
            </>
            : (<><DialogTitle>Update Channel</DialogTitle>
              <DialogDescription>
                Fill up in details !
              </DialogDescription>
            </>)
          }
        </DialogHeader>

        <Form action={"/api/channel-table"}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="ChannelId">Channel Type</Label>
                <Select
                  onValueChange={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      ChannelId: "",
                      Brand: ""
                    }))

                    setFormData((prev) => ({ ...prev, ChannelType: val }))
                    const items = channelTypeData?.[val] || []
                    setChannelCat(items)
                  }}
                  defaultValue={formData.ChannelType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      {channelTypeData && Object.entries(channelTypeData as Record<string, B2C_ChannelTable[]>).map(([channels,]) => (
                        <SelectItem
                          key={`key-${channels}`} value={channels}
                        >{channels}</SelectItem>
                      ))}
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
                <Label htmlFor="ChannelId">Channel Name</Label>
                <Select
                  onValueChange={(val) => {
                    const selected = channelCat?.find(ch => ch.ChannelId.toString() === val)
                    setFormData((prev) => ({
                      ...prev,
                      ChannelId: val,
                      Brand: selected?.Brand ?? ""
                    }))
                  }}
                  defaultValue={formData.ChannelId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      <SelectLabel>Channel</SelectLabel>
                      {channelCat ? channelCat?.map((ch) => (
                        <SelectItem key={`key-${ch.ChannelId}`} value={ch.ChannelId.toString()} >{ch.Name}</SelectItem>
                      )) : <></>}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="grid gap-2">
              <Label htmlFor="Brand">Brand</Label>
              <Input
                id="ChannelType"
                name="ChannelType"
                value={formData.Brand}
                onChange={handleChange}
                placeholder="..."
                disabled={true}
              />
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


            <div className="grid grid-cols-2 gap-2">
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
                        captionLayout="label"
                        month={monthForm}
                        onMonthChange={setMonthForm}
                        onSelect={(selected) => {
                          toast("Start Date", {
                            duration: 5000,
                            description: (
                              <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                                <code className="text-white">{JSON.stringify(selected, null, 2)}</code>
                              </pre>
                            )
                          })
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
                        captionLayout="label"
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

            {state != EStateCreateChannelDialog.UPDATE ?
              <Button onClick={() => handleCreate()} type="button">
                {!isLoading ?
                  (" Create ")
                  :
                  (<Spinner />)
                }
              </Button>
              : <Button onClick={() => handleUpdate()} type="button">
                {!isLoading ?
                  (" Update ")
                  :
                  (<Spinner />)
                }
              </Button>
            }
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog >
  )
}

