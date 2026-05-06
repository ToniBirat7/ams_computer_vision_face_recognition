import TeacherNav from './TeacherNav'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-poppins">
      <TeacherNav />
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
