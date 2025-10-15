import { Store } from "lucide-react";
import Image from "next/image";


enum EnumBrandLogo {
  HUAWEI_MOBILE_THAILAND = "HUAWEI MOBILE THAILAND",
  MSI_TH = "MSI.TH",
  LOGITECH = "LOGITECHTHAILAND",
  Razer_Thailand = "RAZER THAILAND",
}

export function LogoImage({ brand }: { brand: string }) {
  let imgUrl: string;
  let imgAlt: string;
  switch (brand.trim().toUpperCase()) {
    case EnumBrandLogo.HUAWEI_MOBILE_THAILAND:
      imgUrl = "/huawei_brand__logo.png"
      imgAlt = "huawei_logo"
      break;

    case EnumBrandLogo.MSI_TH:
      imgUrl = "/msi_brand__logo.png"
      imgAlt = "msi_logo"
      break;

    case EnumBrandLogo.LOGITECH:
      imgUrl = "/logitech_brand__logo.png"
      imgAlt = "logitech_logo"
      break;
    case EnumBrandLogo.Razer_Thailand:
      imgUrl = "/razer_brand__logo.png"
      imgAlt = "razer_logo"
      break;
    default:
      imgUrl = ""
      imgAlt = ""
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
