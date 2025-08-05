"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EstudianteDashboard from "./estudiante"
import TutorEmpresarialDashboard from "./tutor-empresarial"
import CoordinadorDashboard from "./coordinador"
import TutorAcademicoDashboard from "./tutor-academico"

interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: "estudiante" | "tutor_empresarial" | "coordinador_academico" | "tutor_academico"
  carrera?: string
  empresa?: string
  telefono?: string
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const usuarioLogueado = localStorage.getItem("currentUser")
    if (usuarioLogueado) {
      setCurrentUser(JSON.parse(usuarioLogueado))
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  const renderDashboard = () => {
    switch (currentUser.rol) {
      case "estudiante":
        return <EstudianteDashboard user={currentUser} />
      case "tutor_empresarial":
        return <TutorEmpresarialDashboard user={currentUser} />
      case "coordinador_academico":
        return <CoordinadorDashboard user={currentUser} />
      case "tutor_academico":
        return <TutorAcademicoDashboard user={currentUser} />
      default:
        return <div>Rol no reconocido</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{renderDashboard()}</div>
      </div>
    </div>
  )
}
