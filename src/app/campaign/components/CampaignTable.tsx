import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { B2C_ChannelProcessWorkingSetup, B2C_ChannelTable } from "@prisma/client";
import { Trash } from 'lucide-react'
import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz"
import DeleChannelDialog from "./DeleteChannelDialog";
export type DayInfo = { name: string; style: string; }

export const DaysMapWithColor: Record<string, DayInfo> = {
  "0": { name: "อา", style: "bg-red-500" },
  "1": { name: "จัน", style: "bg-yellow-400" },
  "2": { name: "อัง", style: "bg-rose-500" },
  "3": { name: "พุธ", style: "bg-green-500" },
  "4": { name: "พฤ", style: "bg-orange-500" },
  "5": { name: "ศุก", style: "bg-sky-500" },
  "6": { name: "เส", style: "bg-purple-500" }
}

export interface B2CChannelProcessWorkingSetup {
  ChannelId: number
  ChannelType: string
  Brand: string
  IsWorkOnHolidays: boolean | 0 | 1
  WorkDays: string // เช่น '1|2|3|4|5|6|0'
  WorkTimeStartTime: string // 'HH:mm:ss'
  WorkTimeEndTime: string // 'HH:mm:ss'
  Remark?: string
  StartDate: string // 'YYYY-MM-DD'
  EndDate: string // 'YYYY-MM-DD'
  CreationDate: string // 'YYYY-MM-DD HH:mm:ss.SSS'
  CreatedBy: string
  ModifiedDate: string // 'YYYY-MM-DD HH:mm:ss.SSS'
  ModifiedBy: string
  DayType: 'WorkDay' | 'Holiday' | string
}

export const mockB2CData: B2CChannelProcessWorkingSetup[] = [
  {
    ChannelId: 101,
    ChannelType: "Online",
    Brand: "Brand A",
    IsWorkOnHolidays: 1,
    WorkDays: "1|2|3|4|5",
    WorkTimeStartTime: "08:00:00",
    WorkTimeEndTime: "17:00:00",
    Remark: "Main sales channel",
    StartDate: "2025-01-01",
    EndDate: "2025-12-31",
    CreationDate: "2025-01-01 08:00:00.000",
    CreatedBy: "admin",
    ModifiedDate: "2025-03-01 10:15:00.000",
    ModifiedBy: "admin",
    DayType: "WorkDay",
  },
  {
    ChannelId: 102,
    ChannelType: "Retail",
    Brand: "Brand B",
    IsWorkOnHolidays: 0,
    WorkDays: "1|2|3|4|5|6",
    WorkTimeStartTime: "09:30:00",
    WorkTimeEndTime: "18:30:00",
    Remark: "Flagship store",
    StartDate: "2025-02-01",
    EndDate: "2025-12-31",
    CreationDate: "2025-02-01 09:30:00.000",
    CreatedBy: "manager",
    ModifiedDate: "2025-04-01 14:20:00.000",
    ModifiedBy: "manager",
    DayType: "WorkDay",
  },
  {
    ChannelId: 103,
    ChannelType: "Kiosk",
    Brand: "Brand C",
    IsWorkOnHolidays: 1,
    WorkDays: "0|6",
    WorkTimeStartTime: "10:00:00",
    WorkTimeEndTime: "16:00:00",
    Remark: "Weekend promotion spot",
    StartDate: "2025-05-01",
    EndDate: "2025-09-30",
    CreationDate: "2025-05-01 10:00:00.000",
    CreatedBy: "ops",
    ModifiedDate: "2025-06-15 12:00:00.000",
    ModifiedBy: "ops",
    DayType: "Holiday",
  },
]

function WorkDayConvertToText(input: string): DayInfo[] | null {
  return input.split("|").map(num => DaysMapWithColor[parseInt(num)]).filter(Boolean) ?? null
}


interface IReqCampaignTable {
  data: B2C_ChannelProcessWorkingSetup[] | null
  table: B2C_ChannelTable[] | null

}

// async function handleDelete(id: number) {
//   setTargetDel(id)
// }

export default function CampaignTable(data: IReqCampaignTable) {
  // const daysMap = data.data.map((r) => r.WorkDays)

  // const dayArray = daysMap.split("|")

  const [dataUpdate, setDataUpdate] = useState<B2C_ChannelProcessWorkingSetup | null>(null)
  const [isModal, setIsModal] = useState(false)

  const [openDel, setOpenDel] = useState(false)
  const [targetDel, setTargetDel] = useState<number>(0)

  const workingList = data ? data.data : []


  return (
    <>
      <Table className="border">
        {/* <TableCaption>Channel Process Working Setup</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Channel Type</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead className="hidden lg:table-cell">Work Days</TableHead>
            <TableHead className="hidden lg:table-cell">Time</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Day Type</TableHead>
            <TableHead className="hidden lg:table-cell">* Remark</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {
            workingList?.map((item: B2C_ChannelProcessWorkingSetup) => {
              // console.log(item.WorkTimeStartTime)
              const dayConvert = WorkDayConvertToText(item?.WorkDays)
              return (
                <TableRow key={item.RecId}>
                  <TableCell >{item.RecId}</TableCell>
                  <TableCell>{item.ChannelId}</TableCell>
                  <TableCell >{item.ChannelType}</TableCell>
                  <TableCell>{item.Brand || "-"}</TableCell>

                  <TableCell className=" flex-row  hidden lg:flex">{dayConvert?.map(day => {
                    return (<div key={day.name} className={`w-6 h-8  flex justify-center items-center border rounded-[12px] text-black text-[10px]`}>{day.name}</div>)
                  })}</TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {item?.WorkTimeStartTime
                      ? formatInTimeZone(item.WorkTimeStartTime, "UTC", "HH:mm") : '-'}
                    {' - '}
                    {item?.WorkTimeEndTime
                      ? formatInTimeZone(item.WorkTimeEndTime, "UTC", "HH:mm") : '-'}
                  </TableCell>
                  <TableCell>
                    {formatInTimeZone(item.StartDate, "UTC", "yyyy-MM-dd")} → {formatInTimeZone(item.EndDate, "UTC", "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell
                    className={
                      item.DayType === "Holiday"
                        ? "text-red-600 font-medium"
                        : "text-green-600 font-medium"
                    }
                  >
                    {item.DayType}
                  </TableCell>
                  <TableCell className="text-gray-400 hover:text-gray-600 hidden lg:table-cell">{item.Remark ?? "-"}</TableCell>
                  <TableCell className="flex flex-row gap-2 justify-center items-center">
                    <div
                      onClick={() => {
                        setTargetDel(item.RecId)
                        setOpenDel(true)
                      }}

                      className="flex justify-center items-center w-8 h-8 border hover:bg-black text-black hover:text-white rounded-md p-2 ">
                      <Trash size={16} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table >

      <DeleChannelDialog open={openDel} setOpen={setOpenDel} deleteId={targetDel} />
      {/* <UpdateChannelDialog state={EStateCreateChannelDialog.UPDATE} table={data?.table} data={dataUpdate} open={isModal} onClose={() => { setIsModal(false) }} /> */}
    </>
  )
}
