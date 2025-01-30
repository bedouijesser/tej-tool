import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const taxId = searchParams.get('taxId')

  if (!taxId) {
    return NextResponse.json(
      { error: 'Tax ID is required' },
      { status: 400 }
    )
  }

  const cleanTaxId = taxId.replace('/', '')

  try {
    const response = await fetch(
      `https://api-tej.finances.gov.tn/v0/tax_file/generate?identify=${cleanTaxId}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Origin': 'https://tej.finances.gov.tn',
          'Referer': 'https://tej.finances.gov.tn/',
          'startTimestamp': Date.now().toString(),
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to download file')
    }

    const buffer = await response.arrayBuffer()
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=tax_file_${taxId}.pdf`,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}