

export async function GET() {
  // Sample
  return new Response("Hello!", { status: 200, headers: { 'Content-Type': 'application/json' } })
}
