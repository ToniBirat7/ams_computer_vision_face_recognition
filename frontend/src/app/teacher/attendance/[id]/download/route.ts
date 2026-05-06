import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieHeader = req.headers.get('cookie') ?? ''

  const djangoUrl = process.env.DJANGO_INTERNAL_URL ?? 'http://127.0.0.1:8000'
  const upstream = await fetch(`${djangoUrl}/teacher/download-report/${id}/`, {
    headers: { Cookie: cookieHeader },
  })

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Download failed' }, { status: upstream.status })
  }

  const contentDisposition = upstream.headers.get('Content-Disposition') ?? `attachment; filename="attendance_${id}.xlsx"`
  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': contentDisposition,
    },
  })
}
