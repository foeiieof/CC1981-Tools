import { B2C_SalesOrderTable } from "@prisma/client"

export type B2CSaleOrderWithBrand = B2C_SalesOrderTable & {
  Brand?: string,
  Platform?: string
}
