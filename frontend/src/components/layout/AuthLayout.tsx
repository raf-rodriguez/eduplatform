import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <GraduationCap className="h-10 w-10 text-primary" />
        <span className="text-2xl font-bold">EduPlatform</span>
      </Link>
      
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
