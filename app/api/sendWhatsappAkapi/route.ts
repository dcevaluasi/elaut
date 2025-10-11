import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { to, text } = (await req.json()) as { to: string; text: string }

    const formattedTo = to.includes('@s.whatsapp.net')
      ? to
      : `${to}@s.whatsapp.net`

    const response = await fetch('https://wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WA_SENDER_API_KEY}`,
      },
      body: JSON.stringify({
        to: formattedTo,
        text,
      }),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ message: 'Server Error' }, { status: 500 })
  }
}
