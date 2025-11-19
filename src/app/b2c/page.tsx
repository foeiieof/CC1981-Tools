"use client"
import { B2CDataTable } from "./_components/B2CDatatable";

export default function TiktokPage() {

  return (
    <div className="font-sans grid items-start justify-items-center p-4 pb-20 sm:p-20">
      <main className="w-full  flex flex-row gap-6 h-[80vh] row-start-2 justify-center items-start">
        <B2CDataTable />
      </main>
    </div>
  )

}

