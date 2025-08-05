"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Building2, GraduationCap, Users, BookOpen } from "lucide-react"

interface User {
  id: string
  email: string
  password: string
  nombre: string
  apellido: string
  rol: "estudiante" | "tutor_empresarial" | "coordinador_academico" | "tutor_academico"
  carrera?: string
  empresa?: string
  telefono?: string
}

// Estructura para asignaciones de tutores académicos
interface AsignacionTutor {
  id: string
  tutorAcademicoId: string
  estudianteId: string
  fechaAsignacion: string
  estado: "activa" | "completada" | "cancelada"
}

// Importar los componentes de dashboard
import EstudianteDashboard from "./dashboard/estudiante"
import TutorEmpresarialDashboard from "./dashboard/tutor-empresarial"
import CoordinadorDashboard from "./dashboard/coordinador"
import TutorAcademicoDashboard from "./dashboard/tutor-academico"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [mostrarRegistro, setMostrarRegistro] = useState(false)
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    rol: "estudiante" as User["rol"],
    carrera: "",
    empresa: "",
    telefono: "",
  })
  const [emailRecuperacion, setEmailRecuperacion] = useState("")

  useEffect(() => {
    const initializeApp = () => {
      try {
        // Inicializar usuarios por defecto
        const usuariosExistentes = localStorage.getItem("users")

        if (!usuariosExistentes) {
          const usuariosIniciales: User[] = [
            {
              id: "1",
              email: "estudiante@test.com",
              password: "123456",
              nombre: "Juan",
              apellido: "Pérez",
              rol: "estudiante",
              carrera: "Ingeniería de Sistemas",
              telefono: "987654321",
            },
            {
              id: "2",
              email: "tutor.empresarial@test.com",
              password: "123456",
              nombre: "María",
              apellido: "García",
              rol: "tutor_empresarial",
              empresa: "TechCorp S.A.",
              telefono: "987654322",
            },
            {
              id: "3",
              email: "coordinador@test.com",
              password: "123456",
              nombre: "Carlos",
              apellido: "López",
              rol: "coordinador_academico",
              telefono: "987654323",
            },
            {
              id: "4",
              email: "tutor.academico@test.com",
              password: "123456",
              nombre: "Ana",
              apellido: "Martínez",
              rol: "tutor_academico",
              telefono: "987654324",
            },
          ]

          localStorage.setItem("users", JSON.stringify(usuariosIniciales))
        }

        // Inicializar asignaciones de tutores si no existen
        const asignacionesExistentes = localStorage.getItem("asignacionesTutores")
        if (!asignacionesExistentes) {
          const asignacionesIniciales: AsignacionTutor[] = []
          localStorage.setItem("asignacionesTutores", JSON.stringify(asignacionesIniciales))
        }

        // Inicializar otras estructuras de datos necesarias
        const inicializarDatos = () => {
          // Ofertas de práctica
          if (!localStorage.getItem("ofertas")) {
            localStorage.setItem("ofertas", JSON.stringify([]))
          }
          
          // Postulaciones
          if (!localStorage.getItem("postulaciones")) {
            localStorage.setItem("postulaciones", JSON.stringify([]))
          }
          
          // Evaluaciones
          if (!localStorage.getItem("evaluaciones")) {
            localStorage.setItem("evaluaciones", JSON.stringify([]))
          }
          
          // Reportes
          if (!localStorage.getItem("reportes")) {
            localStorage.setItem("reportes", JSON.stringify([]))
          }
        }

        inicializarDatos()

        // Verificar si hay usuario logueado
        const usuarioLogueado = localStorage.getItem("currentUser")
        if (usuarioLogueado) {
          const user = JSON.parse(usuarioLogueado)
          setCurrentUser(user)
        }
      } catch (error) {
        console.error("Error inicializando la aplicación:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()

    // Escuchar cambios en los datos para recargar cuando sea necesario
    const handleDataChange = () => {
      // Recargar usuario actual si ha cambiado
      const usuarioLogueado = localStorage.getItem("currentUser")
      if (usuarioLogueado) {
        const user = JSON.parse(usuarioLogueado)
        setCurrentUser(user)
      }
    }

    window.addEventListener("userDataChanged", handleDataChange)
    window.addEventListener("asignacionesChanged", handleDataChange)

    return () => {
      window.removeEventListener("userDataChanged", handleDataChange)
      window.removeEventListener("asignacionesChanged", handleDataChange)
    }
  }, [])

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      const usuariosData = localStorage.getItem("users")

      if (!usuariosData) {
        toast({
          title: "Error",
          description: "Error del sistema: no hay usuarios registrados",
          variant: "destructive",
        })
        return
      }

      const usuarios: User[] = JSON.parse(usuariosData)
      const usuario = usuarios.find((u) => u.email === email && u.password === password)

      if (usuario) {
        localStorage.setItem("currentUser", JSON.stringify(usuario))
        setCurrentUser(usuario)
        toast({
          title: "Bienvenido",
          description: `Hola ${usuario.nombre}, has iniciado sesión correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: "Credenciales incorrectas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error en login:", error)
      toast({
        title: "Error",
        description: "Error al iniciar sesión",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("currentUser")
      setCurrentUser(null)
      setEmail("")
      setPassword("")
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
    } catch (error) {
      console.error("Error en logout:", error)
    }
  }

  const handleRegistro = () => {
    if (!nuevoUsuario.email || !nuevoUsuario.password || !nuevoUsuario.nombre || !nuevoUsuario.apellido) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validaciones específicas por rol
    if (nuevoUsuario.rol === "estudiante" && !nuevoUsuario.carrera.trim()) {
      toast({
        title: "Error",
        description: "Los estudiantes deben especificar su carrera",
        variant: "destructive",
      })
      return
    }

    if (nuevoUsuario.rol === "tutor_empresarial" && !nuevoUsuario.empresa.trim()) {
      toast({
        title: "Error",
        description: "Los tutores empresariales deben especificar su empresa",
        variant: "destructive",
      })
      return
    }

    try {
      const usuarios: User[] = JSON.parse(localStorage.getItem("users") || "[]")

      if (usuarios.find((u) => u.email === nuevoUsuario.email)) {
        toast({
          title: "Error",
          description: "El email ya está registrado",
          variant: "destructive",
        })
        return
      }

      const usuario: User = {
        id: Date.now().toString(),
        ...nuevoUsuario,
      }

      usuarios.push(usuario)
      localStorage.setItem("users", JSON.stringify(usuarios))

      // Disparar evento para actualizar datos
      window.dispatchEvent(new CustomEvent("userDataChanged"))

      toast({
        title: "Registro exitoso",
        description: `Tu cuenta como ${getRolDisplayName(nuevoUsuario.rol)} ha sido creada correctamente`,
      })

      // Resetear formulario
      setNuevoUsuario({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        rol: "estudiante",
        carrera: "",
        empresa: "",
        telefono: "",
      })
      setMostrarRegistro(false)
    } catch (error) {
      console.error("Error en registro:", error)
      toast({
        title: "Error",
        description: "Error al crear la cuenta",
        variant: "destructive",
      })
    }
  }

  const handleRecuperacion = () => {
    if (!emailRecuperacion) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email",
        variant: "destructive",
      })
      return
    }

    try {
      const usuarios: User[] = JSON.parse(localStorage.getItem("users") || "[]")
      const usuario = usuarios.find((u) => u.email === emailRecuperacion)

      if (usuario) {
        toast({
          title: "Contraseña enviada",
          description: `Tu contraseña es: ${usuario.password}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Email no encontrado",
          variant: "destructive",
        })
      }

      setEmailRecuperacion("")
      setMostrarRecuperacion(false)
    } catch (error) {
      console.error("Error en recuperación:", error)
      toast({
        title: "Error",
        description: "Error al recuperar contraseña",
        variant: "destructive",
      })
    }
  }

  const getRolDisplayName = (rol: string) => {
    const nombres = {
      estudiante: "Estudiante",
      tutor_empresarial: "Tutor Empresarial",
      coordinador_academico: "Coordinador Académico",
      tutor_academico: "Tutor Académico",
    }
    return nombres[rol as keyof typeof nombres] || rol
  }

  const getRolDescription = (rol: string) => {
    const descripciones = {
      estudiante: "Busca y realiza prácticas preprofesionales",
      tutor_empresarial: "Supervisa estudiantes en prácticas empresariales",
      coordinador_academico: "Administra y coordina el sistema de prácticas",
      tutor_academico: "Supervisa académicamente a los estudiantes",
    }
    return descripciones[rol as keyof typeof descripciones] || ""
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Dashboard view
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-semibold text-gray-900">Sistema de Prácticas</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {currentUser.nombre} {currentUser.apellido} ({getRolDisplayName(currentUser.rol)})
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {currentUser.rol === "estudiante" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard del Estudiante</h2>
                  <p className="text-gray-600">Gestiona tus prácticas preprofesionales</p>
                </div>
                <EstudianteDashboard user={currentUser} />
              </div>
            )}

            {currentUser.rol === "tutor_empresarial" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard del Tutor Empresarial</h2>
                  <p className="text-gray-600">Gestiona ofertas y practicantes</p>
                </div>
                <TutorEmpresarialDashboard user={currentUser} />
              </div>
            )}

            {currentUser.rol === "coordinador_academico" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard del Coordinador Académico</h2>
                  <p className="text-gray-600">Administra el sistema de prácticas</p>
                </div>
                <CoordinadorDashboard user={currentUser} />
              </div>
            )}

            {currentUser.rol === "tutor_academico" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard del Tutor Académico</h2>
                  <p className="text-gray-600">Supervisa estudiantes y evaluaciones</p>
                </div>
                <TutorAcademicoDashboard user={currentUser} />
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Login/Register view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sistema de Prácticas</h2>
          <p className="mt-2 text-sm text-gray-600">Gestión de Prácticas Preprofesionales</p>
        </div>

        {/* Login Form */}
        {!mostrarRegistro && !mostrarRecuperacion && (
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Iniciar Sesión
              </Button>

              <div className="flex justify-between text-sm">
                <Button variant="link" className="p-0 h-auto" onClick={() => setMostrarRegistro(true)}>
                  ¿No tienes cuenta? Regístrate
                </Button>
                <Button variant="link" className="p-0 h-auto" onClick={() => setMostrarRecuperacion(true)}>
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        {mostrarRegistro && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Cuenta</CardTitle>
              <CardDescription>Regístrate en el sistema seleccionando tu rol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={nuevoUsuario.apellido}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email-registro">Correo Electrónico *</Label>
                <Input
                  id="email-registro"
                  type="email"
                  value={nuevoUsuario.email}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="password-registro">Contraseña *</Label>
                <Input
                  id="password-registro"
                  type="password"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={nuevoUsuario.telefono}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
                  placeholder="987654321"
                />
              </div>

              <div>
                <Label htmlFor="rol">Tipo de Usuario *</Label>
                <Select
                  value={nuevoUsuario.rol}
                  onValueChange={(value: User["rol"]) => {
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      rol: value,
                      carrera: value === "estudiante" ? nuevoUsuario.carrera : "",
                      empresa: value === "tutor_empresarial" ? nuevoUsuario.empresa : "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estudiante">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Estudiante</span>
                        <span className="text-xs text-gray-500">Busca y realiza prácticas</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tutor_empresarial">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Tutor Empresarial</span>
                        <span className="text-xs text-gray-500">Supervisa estudiantes en empresa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tutor_academico">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Tutor Académico</span>
                        <span className="text-xs text-gray-500">Supervisa académicamente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="coordinador_academico">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Coordinador Académico</span>
                        <span className="text-xs text-gray-500">Administra el sistema</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">{getRolDescription(nuevoUsuario.rol)}</p>
              </div>

              {nuevoUsuario.rol === "estudiante" && (
                <div>
                  <Label htmlFor="carrera">Carrera *</Label>
                  <Input
                    id="carrera"
                    value={nuevoUsuario.carrera}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, carrera: e.target.value })}
                    placeholder="Ingeniería de Sistemas"
                  />
                </div>
              )}

              {nuevoUsuario.rol === "tutor_empresarial" && (
                <div>
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={nuevoUsuario.empresa}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, empresa: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Rol seleccionado:</strong> {getRolDisplayName(nuevoUsuario.rol)}
                    <br />
                    <span className="text-blue-600">{getRolDescription(nuevoUsuario.rol)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleRegistro} className="w-full">
                Registrarse como {getRolDisplayName(nuevoUsuario.rol)}
              </Button>
              <Button variant="outline" onClick={() => setMostrarRegistro(false)} className="w-full">
                Volver al Login
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Password Recovery Form */}
        {mostrarRecuperacion && (
          <Card>
            <CardHeader>
              <CardTitle>Recuperar Contraseña</CardTitle>
              <CardDescription>Ingresa tu email para recuperar tu contraseña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email-recuperacion">Correo Electrónico</Label>
                <Input
                  id="email-recuperacion"
                  type="email"
                  value={emailRecuperacion}
                  onChange={(e) => setEmailRecuperacion(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <Button onClick={handleRecuperacion} className="w-full">
                Recuperar Contraseña
              </Button>
              <Button variant="outline" onClick={() => setMostrarRecuperacion(false)} className="w-full">
                Volver al Login
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Demo Accounts */}
        {!mostrarRegistro && !mostrarRecuperacion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cuentas de Demostración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Estudiante</p>
                    <p className="text-xs text-gray-600">estudiante@test.com / 123456</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tutor Empresarial</p>
                    <p className="text-xs text-gray-600">tutor.empresarial@test.com / 123456</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Coordinador</p>
                    <p className="text-xs text-gray-600">coordinador@test.com / 123456</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-orange-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tutor Académico</p>
                    <p className="text-xs text-gray-600">tutor.academico@test.com / 123456</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-sm">⚠️</div>
                  <div className="text-xs text-yellow-800">
                    <strong>Nota:</strong> Estas son cuentas de demostración con datos de prueba. 
                    En un entorno de producción, las credenciales deben ser seguras y únicas.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del sistema */}
        {!mostrarRegistro && !mostrarRecuperacion && (
          <div className="text-center text-xs text-gray-500 mt-6">
            <p>Sistema de Gestión de Prácticas Preprofesionales</p>
            <p className="mt-1">Desarrollado para instituciones educativas</p>
          </div>
        )}
      </div>
    </div>
  )
}