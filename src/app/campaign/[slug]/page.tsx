// app/campaign/[slug]
export default async function SlugCampaignPage(
  {
    params,
  }: {
    params: Promise<{ slug: string }>,
  }) {
  const param = await params
  return (
    <div >
      <h1 className="text-red-600">{param.slug}</h1>
    </div>
  )
}
