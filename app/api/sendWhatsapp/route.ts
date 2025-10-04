import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { to, text } = (await req.json()) as { to: string; text: string }

    const response = await fetch('https://wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WA_SENDER_API_KEY}`,
      },
      body: JSON.stringify({ to, text }),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 })
  }
}
