import TeacherNav from './TeacherNav'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <TeacherNav />
      <main className="p-5 lg:p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
