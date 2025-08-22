'use client'
import React, { useState, useEffect } from 'react'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

import { CalendarIcon } from "lucide-react"
import { Spinner } from '@/components/ui/shadcn-io/spinner';

import CampaignTable from "./components/CampaignTable";

import SkeletonTable from "./components/SkeletonTable";
import CreateChannelDialog from './components/CreateChannelDialog'
import { B2C_ChannelProcessWorkingSetup, B2C_ChannelTable } from '@prisma/client'
import { IResponse } from '../api/utility'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { format } from 'date-fns'

// function formatDateRange(dates: DateRange | null) {
//   if (!dates) return ""
//   const { from, to } = dates
//   return `${from?.toISOString().slice(0, 10)}→${to?.toISOString().slice(0, 10)}`
// }

// type IResGETReq<T> = {
//   data: T
//   currentPage: number
//   totalPage: number
// }

async function FetchChannelProcessWorking(page?: number, size?: number, channel?: string, brand?: string, dayType?: string, remark?: string, from?: string, to?: string): Promise<IResponse<B2C_ChannelProcessWorkingSetup[] | null> | null> {
  try {
    const pageParse = page ? page.toString() : "1"
    const sizeParse = size ? size.toString() : "20"
    const channelParse = channel ? channel.trim() : null
    const brandParse = brand ? brand.trim() : null
    const dayTypeParse = dayType ? dayType.trim() : null
    const remarkParse = remark ? remark.trim() : null
    const fromParse = from ? from.trim() : null
    const toParse = to ? to.trim() : null


    const params = new URLSearchParams({
      page: String(pageParse),
      size: String(sizeParse)
    })

    if (channelParse?.trim()) params.set("channel", channelParse?.trim())
    if (brandParse?.trim()) params.set("brand", brandParse?.trim())
    if (dayTypeParse?.trim()) params.set("daytype", dayTypeParse?.trim())
    if (remarkParse?.trim()) params.set("remark", remarkParse?.trim())
    if (fromParse?.trim()) params.set("from", fromParse?.trim())
    if (toParse?.trim()) params.set("to", toParse?.trim())

    const urlAPI = `/api/channel-process-working?${params.toString()}`

    const res = await fetch(urlAPI, { next: { revalidate: 3600 } })

    const data: IResponse<B2C_ChannelProcessWorkingSetup[] | null> = await res.json()
    console.log("res:::", data)
    return data ?? null
  } catch (err) {
    console.log(`fetch [FetchChannelProcessWorkingSetup] : ${err}`)
    return null
  }
}

async function FetchChannelTableData(): Promise<B2C_ChannelTable[] | null> {
  try {
    const res = await fetch("/api/channel-brand", { cache: 'force-cache', next: { revalidate: 3600 } })
    const data: IResponse<B2C_ChannelTable[] | null> = await res.json()
    return data.data ?? null
  } catch (err) {
    console.error(`fetch [FetchChannelTableData] : ${err}`)
    return null
  }
}

export default function CampaignPage() {

  const [isLoadData, setIsLoadData] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [date, setDate] = useState<DateRange | null>(null)
  // const [value, setValue] = useState("")
  const [month, setMonth] = useState(new Date())

  const [openFrom, setOpenFrom] = useState(false)
  const [openTo, setOpenTo] = useState(false)

  const [dataTable, setDataTable] = useState<B2C_ChannelTable[] | null>(null)
  const [workingData, setWorkingData] = useState<B2C_ChannelProcessWorkingSetup[] | null>(null)


  // for api
  const [currPG, setCurrPG] = useState<number>(1)

  const [sizeInput, setSizeInput] = useState<number>(20)
  const [sizePG, setSizePG] = useState<number>(20)

  const [totalPG, setTotalPG] = useState<number>(0)
  const [channelSearch, setChannelSearch] = useState<string>("ALL")
  const [brandSearch, setBrandSearch] = useState<string>("ALL")
  const [dayTypeSearch, setDayTypeSearch] = useState<string>("ALL")

  const [remarkInput, setRemarkInput] = useState<string>("")
  const [remarkSearch, setRemarkSearch] = useState<string>("")

  const [fromSearch, setFromSearch] = useState<string>("")
  const [toSearch, setToSearch] = useState<string>("")



  // for selector
  const channelTypeSelector = dataTable?.reduce<Record<string, B2C_ChannelTable[]>>(
    (acc, item) => {
      const key = item.ChannelType || "unknow"
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

  useEffect(() => {
    const handle = setTimeout(() => {
      setSizePG(sizeInput)
    }, 2000)
    return () => clearTimeout(handle)
  }, [sizeInput])

  useEffect(() => {
    const handle = setTimeout(() => {
      setRemarkSearch(remarkInput)
    }, 1000)
    return () => clearTimeout(handle)
  }, [remarkInput])

  useEffect(() => {
    FetchChannelProcessWorking(currPG, sizePG, channelSearch, (brandSearch.split(":")[2]), dayTypeSearch, remarkSearch, fromSearch, toSearch).then(data => {
      setWorkingData(data?.data ?? null)
      setTotalPG(data?.total_page ?? 0)
      setCurrPG(data?.current_page ?? 1)
      setLoading(true)
    })
    FetchChannelTableData().then(data => { setDataTable(data) })
    setIsLoadData(true)
    // console.log(`dddd- ${workingData}`)
    // const timer = setTimeout(() => setLoading(true), 2000)
    // return () => clearTimeout(timer)
  }, [currPG, sizePG, channelSearch, brandSearch, dayTypeSearch, remarkSearch, fromSearch, toSearch])


  return (
    <div className="font-sans grid items-start justify-items-center p-8 pb-20 sm:p-20">
      <main className="w-full  flex flex-col gap-[32px] h-[80vh] row-start-2 justify-center items-center sm:items-start">
        {!isLoadData ? (<><Spinner className='self-center' /></>)
          : (
            <>
              <div className='w-full flex justify-end'>
                <CreateChannelDialog table={dataTable} />
              </div>

              <div className="w-full flex flex-row gap-2 justify-end md:justify-between items-end">
                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="search-bar" className="font-bold">Channel Type</Label>

                  <Select
                    defaultValue={channelSearch}
                    onValueChange={(val) => {
                      if (val === 'ALL') { setChannelSearch("") }
                      else { setChannelSearch(val) }
                      setCurrPG(1)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue className='w-full' placeholder="Select a Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup >
                        <SelectItem
                          value='ALL'
                        >
                          All
                        </SelectItem>
                        {channelTypeSelector && Object.entries(channelTypeSelector as Record<string, B2C_ChannelTable[]>).map(([channels,]) => (
                          <SelectItem
                            key={`key-${channels}`}
                            value={channels}
                          >{channels}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="search-bar" className="font-bold">Brand</Label>
                  <Select
                    defaultValue={brandSearch}
                    onValueChange={(val) => {
                      if (val === 'ALL') { setBrandSearch("") }
                      else { setBrandSearch(val) }
                      setCurrPG((prev) => prev != 1 ? 1 : prev)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue className='w-full' placeholder="Select a Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup >
                        <SelectItem value='ALL' > All </SelectItem>
                        {channelSearch != ""
                          && channelTypeSelector
                          && Object.entries(channelTypeSelector as Record<string, B2C_ChannelTable[]>).filter(([g,]) => g === channelSearch).map(([channels, list]) => {
                            return (<React.Fragment key={`channels-${channels}`}>
                              <SelectLabel>
                                {channels}
                              </SelectLabel>
                              {
                                list.map((i) => (
                                  <SelectItem
                                    key={`channel-key-${i.ChannelId}`}
                                    value={i.ChannelId + ":" + i.ChannelGroup + ":" + i.Brand}
                                  >{i.ChannelId} : {i.ChannelGroup} : {i.Brand}</SelectItem>))
                              }
                            </React.Fragment>
                            )
                          })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="search-bar" className="font-bold">Day Type</Label>

                  <Select
                    defaultValue={channelSearch}
                    onValueChange={(val) => {
                      if (val === 'ALL') { setDayTypeSearch("") }
                      else { setDayTypeSearch(val) }
                      setCurrPG(1)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue className='w-full' placeholder="Select a Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup >
                        <SelectItem value='ALL' >
                          ALL
                        </SelectItem>
                        <SelectItem value='WorkDay' >
                          WorkDay
                        </SelectItem>
                        <SelectItem value='DayOff'>
                          DayOff
                        </SelectItem>

                      </SelectGroup>
                    </SelectContent>
                  </Select>

                </div>

                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="search-bar" className="font-bold">*Remark</Label>
                  <Input id="search-bar" value={remarkInput} placeholder="Channel ID, Day Type, Remark"
                    onChange={(e) => { setRemarkInput(e.target.value) }} />
                </div>

                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="date" className="px-1 font-bold">
                    From Date
                  </Label>
                  <div className="relative flex gap-1">
                    <Input
                      id="date"
                      value={fromSearch}
                      placeholder="xxxx-xx-xx"
                      className="w-full bg-background pr-10"
                      onChange={(e) => {
                        const inputValue = e.target.value
                        const fromDate = new Date(inputValue)

                        if (!isNaN(fromDate.getTime())) {
                          setFromSearch(fromDate.toISOString())
                          // setFromDate(fromDate)
                          // const dateRange: DateRange = { from: fromDate, to: fromDate }
                          // setDate(dateRange)
                          setMonth(fromDate)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault()
                          setOpenFrom(true)
                        }
                      }}
                    />
                    <Popover open={openFrom} onOpenChange={setOpenFrom}>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-picker"
                          variant="ghost"
                          className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                          <CalendarIcon className="size-3.5" />
                          <span className="sr-only">Select date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                      >
                        <Calendar
                          mode="single"
                          selected={new Date(fromSearch)}
                          captionLayout="dropdown"
                          month={month}
                          onMonthChange={setMonth}
                          onSelect={(selectedDate) => {

                            console.log(selectedDate)
                            // const [strt] = [selectedDate?.from ?? new Date()]
                            if (!selectedDate) return
                            // if (strt > new Date()) return
                            setFromSearch(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")
                            // setToSearch(selectedDate?.toISOString() ?? "")
                            // setDate(selectedDate)
                            // setValue(formatDateRange(selectedDate))
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>


                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="date" className="px-1 font-bold">
                    To Date
                  </Label>
                  <div className="relative flex gap-1">
                    <Input
                      id="date"
                      value={toSearch}
                      placeholder="xxxx-xx-xx"
                      className="w-full bg-background pr-10"
                      onChange={(e) => {
                        const inputValue = e.target.value
                        // setValue(inputValue)

                        const fromDate = new Date(inputValue)
                        if (!isNaN(fromDate.getTime())) {
                          // const dateRange: DateRange = { from: fromDate, to: fromDate }
                          // setDate(dateRange)
                          setMonth(fromDate)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault()
                          setOpenTo(true)
                        }
                      }}
                    />
                    <Popover open={openTo} onOpenChange={setOpenTo}>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-picker"
                          variant="ghost"
                          className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                          <CalendarIcon className="size-3.5" />
                          <span className="sr-only">Select date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                      >
                        <Calendar
                          mode="single"
                          selected={new Date(toSearch)}
                          captionLayout="dropdown"
                          month={month}
                          onMonthChange={setMonth}
                          onSelect={(selectedDate) => {

                            // const [strt] = [selectedDate?.from ?? new Date()]
                            if (!selectedDate) return

                            if (selectedDate.getDay() < new Date(fromSearch).getDay()) return
                            setToSearch(format(selectedDate, "yyyy-MM-dd"))
                            setOpenTo(false)
                            // setValue(formatDateRange(selectedDate))
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* <Button */}
                {/*   // onClick={onSub} */}
                {/*   onClick={() => */}
                {/*     toast("Event has been created", { */}
                {/*       description: "Sunday, December 03, 2023 at 9:00 AM", */}
                {/*       action: { */}
                {/*         label: "Undo", */}
                {/*         onClick: () => console.log("Undo"), */}
                {/*       }, */}
                {/*     }) */}
                {/*   } */}
                {/* > */}
                {/*   <Search /> */}
                {/*   Search */}
                {/* </Button> */}
              </div>
              {loading ?
                <CampaignTable data={workingData} table={dataTable} />
                :
                <SkeletonTable />
              }
            </>)}
        <Pagination>
          <PaginationContent >


            {
              totalPG > 1 ? (
                <>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => { setCurrPG((prev) => (prev > 1 ? prev - 1 : 1)) }} />
                  </PaginationItem>

                  {Array.from({ length: totalPG }, (_, i) => (
                    <PaginationItem key={`page-${i}`} >
                      <PaginationLink

                        onClick={
                          () => setCurrPG(i + 1)
                        }
                        isActive={(i + 1) === currPG}>{i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {/* <PaginationItem> */}
                  {/*   <PaginationEllipsis /> */}
                  {/* </PaginationItem> */}

                  <PaginationItem>
                    <PaginationNext onClick={() => {
                      setCurrPG((prev) => prev < totalPG ? (prev + 1) : totalPG)
                    }} />
                  </PaginationItem>

                  <div className='flex flex-row justify-center items-center gap-2'>
                    <Label className='font-bold'>Size</Label>

                    <Select
                      defaultValue={sizeInput.toString()}
                      onValueChange={(val) => { setSizeInput(parseInt(val)) }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue className='w-full' placeholder="Select a Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup >
                          {
                            Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((i) => (<SelectItem key={`pg-size-${i}`} value={i.toString()} > {i} </SelectItem>))
                          }
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                  </div>

                </>
              ) : (<></>)


            }

          </PaginationContent>
        </Pagination>
      </main>

    </div>
  )
}
