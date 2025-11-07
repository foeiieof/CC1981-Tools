import { Store } from "lucide-react";
import Image from "next/image";
import { Lgr } from "@/app/api/utility";


enum EnumShopeeBrandLogo {
  HUAWEI_MOBILE_THAILAND = "HUAWEI_OFFICIAL_STORE",
  MSI_TH = "MSI.TH",
  LOGITECH = "LOGI.SHOP",
  Razer_Thailand = "RAZER THAILAND",
  EPSON = "EPSON.OFFICIAL.STORE",
  NINTENDO = "NINTENDO.OFFICIAL.STORE",
  APC = "APC.OFFICIAL.STORE",
  VIEWSONIC = "VIEWSONIC.OFFICIAL.STORE",
  ZIRCON = "ZIRCON.OFFICIAL.STORE",
  RAZER = "RAZER.FLAGSHIP.STORE"
}

export function ShopeeLogoImages({ brand }: { brand: string }) {

  let imgUrl: string;
  let imgAlt: string;
  switch (brand.trim().toUpperCase().replaceAll(" ", ".")) {
    case EnumShopeeBrandLogo.HUAWEI_MOBILE_THAILAND:
      imgUrl = "/huawei_brand__logo.png"
      imgAlt = "huawei_logo"
      break;

    case EnumShopeeBrandLogo.MSI_TH:
      imgUrl = "/msi_brand__logo.png"
      imgAlt = "msi_logo"
      break;

    case EnumShopeeBrandLogo.LOGITECH:
      imgUrl = "/logitech_brand__logo.png"
      imgAlt = "logitech_logo"
      break;
    case EnumShopeeBrandLogo.Razer_Thailand:
      imgUrl = "/razer_brand__logo.png"
      imgAlt = "razer_logo"
      break;
    case EnumShopeeBrandLogo.EPSON:
      imgUrl = "/epson_brand__logo.png"
      imgAlt = "epson_logo"
      break;
    case EnumShopeeBrandLogo.NINTENDO:
      imgUrl = "/nintendo_logo_brand.png"
      imgAlt = "nintendo_logo"
      break;
    case EnumShopeeBrandLogo.APC:
      imgUrl = "/apc_brand_logo.png"
      imgAlt = "apc_logo"
      break;
    case EnumShopeeBrandLogo.ZIRCON:
      imgUrl = "/zircon_logo_brand.png"
      imgAlt = "zircon_logo"
      break;
    case EnumShopeeBrandLogo.VIEWSONIC:
      imgUrl = "/viwesonic_logo_brand.png"
      imgAlt = "viewsonic"
      break;
    case EnumShopeeBrandLogo.RAZER:
      imgUrl = "/razer_brand__logo.png"
      imgAlt = "razer_logo"
      break;

    default:
      imgUrl = ""
      imgAlt = ""

      Lgr.info({ brand: brand.trim().toUpperCase().replaceAll(" ", ".") }, "brand:")
      break;
  }
  // console.log(`[Brand] : ${brand.trim().toUpperCase() + imgUrl + imgAlt}`)

  if (imgUrl != "" && imgAlt != "") {
    return (
      <div className="w-full max-w-6 mx-auto">
        <Image
          src={imgUrl}
          width={120}
          height={120}
          className="w-auto h-auto max-w-6"
          loading="lazy"
          alt={imgAlt}
        // fill
        />
      </div>
    )
  }
  else {
    return (
      <div className="w-full max-w-6 mx-auto">
        <Store size={20} />
      </div>
    )
  }
}
