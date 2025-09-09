import axios from 'axios'

export const translateText = async (text: string, target: string = 'en') => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_URL}?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
      {
        q: text,
        target,
        source: 'id', // optional, auto-detect works if omitted
        format: 'text',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log({ response })

    return response.data.translations[0].translatedText // ✅ correct shape
  } catch (error) {
    console.error('Translation error:', error)
    return ''
  }
}
