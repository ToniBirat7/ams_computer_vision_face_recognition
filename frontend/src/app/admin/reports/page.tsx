'use client'

import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import toast from 'react-hot-toast'
import { getStudentReport, predictPerformance } from '@/lib/api'
import type { StudentReport, PredictionResult } from '@/types/api'

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
    setLoading(true)
    setPrediction(null)
    try {
      const data = await getStudentReport(Number(studentId))
      setReport(data)
    } catch {
      toast.error('Student not found')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!report) return
    setPredLoading(true)
    try {
      const data = await predictPerformance(report.id, prevGrade)
      setPrediction(data)
    } catch {
      toast.error('Prediction failed')
    } finally {
      setPredLoading(false)
    }
  }

  const chartData = report
    ? {
        labels: report.monthly_attendance.map((m) => m.month),
        datasets: [
          {
            label: 'Attendance Rate (%)',
            data: report.monthly_attendance.map((m) => m.rate),
            borderColor: '#00a4bd',
            backgroundColor: 'rgba(0,164,189,0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#003b5c',
            pointRadius: 5,
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { callback: (v: number | string) => `${v}%` } },
    },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2d3748]">Student Progress Report</h1>
        <p className="text-[#4a5568] text-sm mt-1">View detailed attendance and performance reports</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-card shadow-sm p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]" />
            <input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID..."
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-input text-sm outline-none focus:border-[#00a4bd] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#003b5c] text-white text-sm font-medium rounded-input hover:bg-[#002d47] transition-colors disabled:opacity-60"
          >
            <i className="bx bx-search-alt text-lg" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Report */}
      {report && (
        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white rounded-card shadow-sm p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#003b5c]/10 flex items-center justify-center flex-shrink-0">
              <i className="bx bxs-user-circle text-4xl text-[#003b5c]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2d3748]">{report.name}</h2>
              <p className="text-[#4a5568] text-sm">Student ID: #{report.id}</p>
            </div>
          </div>

          {/* Course Cards */}
          {report.courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {report.courses.map((c) => (
                <div key={c.title} className="bg-white rounded-card shadow-sm p-5">
                  <h3 className="font-semibold text-[#2d3748] mb-3">{c.title}</h3>
                  <div className="space-y-2 text-sm text-[#4a5568]">
                    <div className="flex justify-between"><span>Present</span><span className="font-medium text-green-600">{c.present_days}</span></div>
                    <div className="flex justify-between"><span>Absent</span><span className="font-medium text-red-600">{c.absent_days}</span></div>
                    <div className="flex justify-between"><span>Rate</span><span className="font-medium text-[#00a4bd]">{c.attendance_rate.toFixed(1)}%</span></div>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00a4bd] rounded-full" style={{ width: `${c.attendance_rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Overall stats */}
          <div className="bg-white rounded-card shadow-sm p-6">
            <h3 className="font-semibold text-[#2d3748] mb-5">Attendance Overview</h3>
            <div className="grid grid-cols-3 gap-5">
              {[
                { icon: 'bx bxs-calendar-check', color: '#34d399', label: 'Present Days', value: report.total_present },
                { icon: 'bx bxs-calendar-x', color: '#ef4444', label: 'Absent Days', value: report.total_absent },
                { icon: 'bx bxs-pie-chart-alt-2', color: '#00a4bd', label: 'Attendance Rate', value: `${report.attendance_rate.toFixed(1)}%` },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-input flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <i className={`${s.icon} text-xl`} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#2d3748]">{s.value}</p>
                    <p className="text-xs text-[#4a5568]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Chart */}
          {chartData && (
            <div className="bg-white rounded-card shadow-sm p-6">
              <h3 className="font-semibold text-[#2d3748] mb-5">Monthly Attendance</h3>
              <Line data={chartData} options={chartOptions as never} />
            </div>
          )}

          {/* Prediction */}
          <div className="bg-white rounded-card shadow-sm p-6">
            <h3 className="font-semibold text-[#2d3748] mb-4">Performance Prediction</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#4a5568] mb-1.5 block">Previous Grade</label>
                <select
                  value={prevGrade}
                  onChange={(e) => setPrevGrade(e.target.value)}
                  className="w-full sm:w-48 px-4 py-3 border border-gray-200 rounded-input text-sm outline-none focus:border-[#00a4bd] bg-white transition-colors"
                >
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button
                onClick={handlePredict}
                disabled={predLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#00a4bd] text-white text-sm font-medium rounded-input hover:bg-[#0092a8] transition-colors disabled:opacity-60"
              >
                <i className="bx bx-brain text-lg" />
                {predLoading ? 'Predicting...' : 'Predict Performance'}
              </button>
            </div>

            {prediction && (
              <div className="mt-6 p-5 bg-[#003b5c]/5 rounded-card border border-[#003b5c]/10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Predicted Grade', value: prediction.predicted_grade, bold: true },
                    { label: 'Confidence', value: `${(prediction.confidence * 100).toFixed(1)}%` },
                    { label: 'Attendance Rate', value: `${prediction.attendance_rate.toFixed(1)}%` },
                    { label: 'Performance', value: prediction.course_performance },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className={`text-lg ${item.bold ? 'text-2xl font-bold text-[#003b5c]' : 'font-semibold text-[#2d3748]'}`}>{item.value}</p>
                      <p className="text-xs text-[#4a5568] mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
                {prediction.chart_image && (
                  <div className="mt-5 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${prediction.chart_image}`} alt="Prediction chart" className="max-w-full rounded-input" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
