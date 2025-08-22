// app/campaign/[slug]

export default async function SlugCampaignPage(
  {
    params,
    // searchParams,
  }: {
    params: { slug: string },
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }) {
  return (
    <div >
      <h1 className="text-red-600">{params.slug}</h1>
    </div>
  )
}
