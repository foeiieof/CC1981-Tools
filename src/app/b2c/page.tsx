"use client"
import { B2C_SalesOrderTable, PrismaClient } from "@prisma/client";
import { IResponse, Lgr } from "@/app/api/utility";
import { B2CDataTable } from "./_components/B2CDatatable";
import SkeletonOrderTable from "./_components/SkeletonOrderTable";
import useSWR from "swr";
import { B2CSaleOrderWithBrand } from "@/app/api/types";
import { useState } from "react";

const prisma = new PrismaClient()


export default function TiktokPage() {
  // useEffect(() => {}, [])
  // Lgr.info(orderData)

  return (
    <div className="font-sans grid items-start justify-items-center p-4 pb-20 sm:p-20">
      <main className="w-full  flex flex-row gap-6 h-[80vh] row-start-2 justify-center items-start">
        <B2CDataTable />
      </main>
    </div>
  )

}

