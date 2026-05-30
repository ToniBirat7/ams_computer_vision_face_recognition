'use client'

import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import toast from 'react-hot-toast'
import {
  Search, CalendarCheck, CalendarX, PieChart, Brain, Sparkles, GraduationCap,
} from 'lucide-react'
import { getStudentReport, predictPerformance } from '@/lib/api'
import type { StudentReport, PredictionResult } from '@/types/api'
import {
  Card, Button, NativeSelect, EmptyState, Avatar, PageHeader, Reveal,
} from '@/components/ui'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']

export default function StudentReportPage() {
  const [studentId, setStudentId] = useState('')
  const [report, setReport] = useState<StudentReport | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [prevGrade, setPrevGrade] = useState('A')
  const [loading, setLoading] = useState(false)
  const [predLoading, setPredLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId.trim()) return
    setLoading(true); setPrediction(null)
    try { setReport(await getStudentReport(Number(studentId))) }
    catch { toast.error('Student not found'); setReport(null) }
    finally { setLoading(false) }
  }

  const handlePredict = async () => {
    if (!report) return
    setPredLoading(true)
    try { setPrediction(await predictPerformance(report.id, prevGrade)) }
    catch { toast.error('Prediction failed') }
    finally { setPredLoading(false) }
  }

  const chartData = report ? {
    labels: report.monthly_attendance.map((m) => m.month),
    datasets: [{
      label: 'Attendance Rate (%)',
      data: report.monthly_attendance.map((m) => m.rate),
      borderColor: '#00a4bd',
      backgroundColor: 'rgba(0,164,189,0.12)',
      tension: 0.4, fill: true, pointBackgroundColor: '#003b5c', pointRadius: 4,
    }],
  } : null

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { callback: (v: number | string) => `${v}%`, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.15)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  }

  return (
    <div className="space-y-6">
      <Reveal><PageHeader title="Student Reports" subtitle="Attendance analytics and AI grade prediction" /></Reveal>

      <Reveal delay={0.05}>
        <Card className="p-5">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Enter Student ID…"
                className="w-full h-11 pl-10 pr-4 text-sm text-fg bg-surface-2 border border-border rounded-input outline-none placeholder:text-muted focus:bg-surface focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] transition-all" />
            </div>
            <Button type="submit" loading={loading} icon={<Search className="w-4 h-4" />}>Search</Button>
          </form>
        </Card>
      </Reveal>

      {!report && !loading && (
        <Card><EmptyState icon={GraduationCap} title="Search for a student" message="Enter a student ID above to view their attendance report and predict performance." /></Card>
      )}

      {report && (
        <div className="space-y-6">
          <Reveal>
            <Card className="p-6 flex items-center gap-4">
              <Avatar name={report.name} size="md" />
              <div>
                <h2 className="text-xl font-bold text-fg">{report.name}</h2>
                <p className="text-muted text-sm">Student ID · #{report.id}</p>
              </div>
            </Card>
          </Reveal>

          {report.courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {report.courses.map((c) => (
                <Reveal key={c.title}>
                  <Card hover className="p-5">
                    <h3 className="font-semibold text-fg mb-3">{c.title}</h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted">Present</span><span className="font-semibold text-success">{c.present_days}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Absent</span><span className="font-semibold text-danger">{c.absent_days}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Rate</span><span className="font-semibold text-accent">{c.attendance_rate.toFixed(1)}%</span></div>
                    </div>
                    <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${c.attendance_rate}%`, background: 'var(--accent)' }} /></div>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <Card className="p-6">
              <h3 className="font-bold text-fg mb-5">Attendance Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { Icon: CalendarCheck, color: 'var(--success)', label: 'Present Days', value: String(report.total_present) },
                  { Icon: CalendarX, color: 'var(--danger)', label: 'Absent Days', value: String(report.total_absent) },
                  { Icon: PieChart, color: 'var(--accent)', label: 'Attendance Rate', value: `${report.attendance_rate.toFixed(1)}%` },
                ].map(({ Icon, color, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}><Icon className="w-6 h-6" style={{ color }} /></div>
                    <div><p className="text-xl font-bold text-fg">{value}</p><p className="text-xs text-muted">{label}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {chartData && (
            <Reveal>
              <Card className="p-6">
                <h3 className="font-bold text-fg mb-5">Monthly Attendance</h3>
                <Line data={chartData} options={chartOptions as never} />
              </Card>
            </Reveal>
          )}

          <Reveal>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center"><Brain className="w-5 h-5 text-accent" /></div>
                <h3 className="font-bold text-fg">AI Performance Prediction</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                <div className="flex-1 max-w-xs">
                  <label className="text-[12px] font-semibold text-fg-soft uppercase tracking-wide mb-1.5 block">Previous Grade</label>
                  <NativeSelect value={prevGrade} onChange={(e) => setPrevGrade(e.target.value)}>
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </NativeSelect>
                </div>
                <Button onClick={handlePredict} loading={predLoading} icon={<Sparkles className="w-4 h-4" />}>Predict Performance</Button>
              </div>

              {prediction && (
                <div className="mt-6 p-5 rounded-card border border-border bg-surface-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Predicted Grade', value: prediction.predicted_grade, big: true },
                      { label: 'Confidence', value: `${Math.round(prediction.confidence)}%` },
                      { label: 'Attendance', value: `${prediction.attendance_rate.toFixed(1)}%` },
                      { label: 'Performance', value: prediction.course_performance },
                    ].map((it) => (
                      <div key={it.label} className="text-center">
                        <p className={it.big ? 'text-3xl font-extrabold text-brand' : 'text-lg font-semibold text-fg'}>{it.value}</p>
                        <p className="text-xs text-muted mt-0.5">{it.label}</p>
                      </div>
                    ))}
                  </div>
                  {prediction.chart_image && (
                    <div className="mt-5 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`data:image/png;base64,${prediction.chart_image}`} alt="Prediction chart" className="max-w-full rounded-input border border-border" />
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Reveal>
        </div>
      )}
    </div>
  )
}
