"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2, FileText, UserCheck, BarChart3, Plus, Edit, Save, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  carrera?: string
  empresa?: string
  telefono?: string
  tutorAcademicoId?: string
  tutorEmpresarialId?: string
}

interface PracticaActiva {
  id: string
  estudianteId: string
  ofertaId: string
  fechaInicio: string
  fechaFin: string
  estado: "en_curso" | "completada" | "cancelada"
  tutorEmpresarialId: string
  tutorAcademicoId?: string
}

interface OfertaPractica {
  id: string
  titulo: string
  empresa: string
  descripcion: string
  estado: "activa" | "cerrada"
  tutorEmpresarialId: string
}

interface Tarea {
  id: string
  titulo: string
  descripcion: string
  fechaCreacion: string
  fechaVencimiento: string
  estado: "pendiente" | "en_progreso" | "completada" | "vencida"
  asignadaPor: string
  estudianteId: string
  practicaId: string
  tipoAsignador: "tutor_empresarial" | "tutor_academico"
  entregaEstudiante?: string
  fechaEntrega?: string
  calificacion?: number
  comentariosTutor?: string
}

interface Empresa {
  id: string
  nombre: string
  ruc: string
  direccion: string
  telefono: string
  email: string
  sector: string
  descripcion: string
  fechaRegistro: string
}

export default function CoordinadorDashboard({ user }: { user: User }) {
  const [estudiantes, setEstudiantes] = useState<User[]>([])
  const [tutoresEmpresariales, setTutoresEmpresariales] = useState<User[]>([])
  const [tutoresAcademicos, setTutoresAcademicos] = useState<User[]>([])
  const [practicas, setPracticas] = useState<PracticaActiva[]>([])
  const [ofertas, setOfertas] = useState<OfertaPractica[]>([])
  const [reportes, setReportes] = useState<any[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    rol: "estudiante" as User["rol"],
    empresa: "",
    carrera: "",
    telefono: "",
  })
  const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false)

  // Estados para edición de usuarios
  const [usuarioEditando, setUsuarioEditando] = useState<User | null>(null)
  const [datosEdicion, setDatosEdicion] = useState<Partial<User>>({})

  const { toast } = useToast()

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarDatos()

    const handleDataChange = () => {
      cargarDatos()
    }

    window.addEventListener("userDataChanged", handleDataChange)
    window.addEventListener("taskDataChanged", handleDataChange)
    window.addEventListener("practiceDataChanged", handleDataChange)

    return () => {
      window.removeEventListener("userDataChanged", handleDataChange)
      window.removeEventListener("taskDataChanged", handleDataChange)
      window.removeEventListener("practiceDataChanged", handleDataChange)
    }
  }, [])

  const cargarDatos = () => {
    // Cargar usuarios
    const usuariosData = localStorage.getItem("users")
    if (usuariosData) {
      const usuarios: User[] = JSON.parse(usuariosData)
      setEstudiantes(usuarios.filter((u) => u.rol === "estudiante"))
      setTutoresEmpresariales(usuarios.filter((u) => u.rol === "tutor_empresarial"))
      setTutoresAcademicos(usuarios.filter((u) => u.rol === "tutor_academico"))
    }

    // Cargar prácticas
    const practicasData = localStorage.getItem("practicas")
    if (practicasData) {
      setPracticas(JSON.parse(practicasData))
    }

    // Cargar ofertas
    const ofertasData = localStorage.getItem("ofertas")
    if (ofertasData) {
      setOfertas(JSON.parse(ofertasData))
    }

    // Cargar reportes
    const reportesData = localStorage.getItem("reportes")
    if (reportesData) {
      setReportes(JSON.parse(reportesData))
    }

    // Cargar tareas
    const tareasData = localStorage.getItem("tareas")
    if (tareasData) {
      setTareas(JSON.parse(tareasData))
    }

    // Cargar empresas
    const empresasData = localStorage.getItem("empresas")
    if (empresasData) {
      setEmpresas(JSON.parse(empresasData))
    }
  }

  const asignarTutorAcademico = (practicaId: string, tutorId: string) => {
    try {
      const practicasData = localStorage.getItem("practicas")
      if (!practicasData) return

      const practicas: PracticaActiva[] = JSON.parse(practicasData)
      const practica = practicas.find((p) => p.id === practicaId)

      if (practica) {
        practica.tutorAcademicoId = tutorId
        localStorage.setItem("practicas", JSON.stringify(practicas))
        window.dispatchEvent(new CustomEvent("practiceDataChanged"))
        cargarDatos()

        toast({
          title: "Tutor asignado",
          description: "El tutor académico ha sido asignado correctamente",
        })
      }
    } catch (error) {
      console.error("Error asignando tutor:", error)
      toast({
        title: "Error",
        description: "Error al asignar el tutor académico",
        variant: "destructive",
      })
    }
  }

  const crearUsuario = () => {
    if (!nuevoUsuario.email.trim() || !nuevoUsuario.password.trim() || !nuevoUsuario.nombre.trim()) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      const usuariosData = localStorage.getItem("users")
      const usuarios: User[] = usuariosData ? JSON.parse(usuariosData) : []

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
      window.dispatchEvent(new CustomEvent("userDataChanged"))

      setNuevoUsuario({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        rol: "estudiante",
        empresa: "",
        carrera: "",
        telefono: "",
      })
      setMostrarFormularioUsuario(false)

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      })

      cargarDatos()
    } catch (error) {
      console.error("Error creando usuario:", error)
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      })
    }
  }

  const eliminarUsuario = (usuarioId: string) => {
    try {
      const usuariosData = localStorage.getItem("users")
      if (!usuariosData) return

      const usuarios: User[] = JSON.parse(usuariosData)
      const usuariosFiltrados = usuarios.filter((u) => u.id !== usuarioId)

      localStorage.setItem("users", JSON.stringify(usuariosFiltrados))
      window.dispatchEvent(new CustomEvent("userDataChanged"))

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })

      cargarDatos()
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  // Funciones para edición de usuarios
  const iniciarEdicion = (usuario: User) => {
    setUsuarioEditando(usuario)
    setDatosEdicion({ ...usuario })
  }

  const cancelarEdicion = () => {
    setUsuarioEditando(null)
    setDatosEdicion({})
  }

  const guardarEdicion = () => {
    if (!usuarioEditando || !datosEdicion.nombre?.trim() || !datosEdicion.apellido?.trim()) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      const usuariosData = localStorage.getItem("users")
      if (!usuariosData) return

      const usuarios: User[] = JSON.parse(usuariosData)
      const indice = usuarios.findIndex((u) => u.id === usuarioEditando.id)

      if (indice !== -1) {
        usuarios[indice] = { ...usuarios[indice], ...datosEdicion }
        localStorage.setItem("users", JSON.stringify(usuarios))
        window.dispatchEvent(new CustomEvent("userDataChanged"))

        toast({
          title: "Usuario actualizado",
          description: "La información del usuario ha sido actualizada correctamente",
        })

        setUsuarioEditando(null)
        setDatosEdicion({})
        cargarDatos()
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el usuario",
        variant: "destructive",
      })
    }
  }

  const asignarTutorAEstudiante = (estudianteId: string, tutorId: string, tipoTutor: "academico" | "empresarial") => {
    try {
      const usuariosData = localStorage.getItem("users")
      if (!usuariosData) return

      const usuarios: User[] = JSON.parse(usuariosData)
      const estudiante = usuarios.find((u) => u.id === estudianteId)

      if (estudiante) {
        if (tipoTutor === "academico") {
          estudiante.tutorAcademicoId = tutorId === "sin_asignar" ? undefined : tutorId
        } else {
          estudiante.tutorEmpresarialId = tutorId === "sin_asignar" ? undefined : tutorId
        }

        localStorage.setItem("users", JSON.stringify(usuarios))
        window.dispatchEvent(new CustomEvent("userDataChanged"))
        cargarDatos()

        toast({
          title: "Tutor asignado",
          description: `El tutor ${tipoTutor} ha sido asignado correctamente`,
        })
      }
    } catch (error) {
      console.error("Error asignando tutor:", error)
      toast({
        title: "Error",
        description: "Error al asignar el tutor",
        variant: "destructive",
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const colors = {
      en_curso: "bg-blue-100 text-blue-800",
      completada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
      activa: "bg-green-100 text-green-800",
      cerrada: "bg-gray-100 text-gray-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      en_progreso: "bg-blue-100 text-blue-800",
      vencida: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[estado as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {estado.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getUsuario = (userId: string) => {
    const todosUsuarios = [...estudiantes, ...tutoresEmpresariales, ...tutoresAcademicos]
    return todosUsuarios.find((u) => u.id === userId)
  }

  const getOferta = (ofertaId: string) => {
    return ofertas.find((o) => o.id === ofertaId)
  }

  const estadisticas = {
    totalEstudiantes: estudiantes.length,
    estudiantesConPractica: practicas.filter((p) => p.estado === "en_curso").length,
    practicasCompletadas: practicas.filter((p) => p.estado === "completada").length,
    ofertasActivas: ofertas.filter((o) => o.estado === "activa").length,
    totalReportes: reportes.length,
    totalTareas: tareas.length,
    totalEmpresas: empresas.length,
    tareasCompletadas: tareas.filter((t) => t.estado === "completada").length,
  }

  return (
    <div className="space-y-6">
      {/* Resumen Estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEstudiantes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Práctica</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.estudiantesConPractica}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalTareas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEmpresas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="practicas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="practicas">Gestión de Prácticas</TabsTrigger>
          <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
          <TabsTrigger value="tutores">Tutores</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="practicas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Prácticas en Curso</h3>
          </div>

          <div className="grid gap-4">
            {practicas.map((practica) => {
              const estudiante = getUsuario(practica.estudianteId)
              const tutorEmpresarial = getUsuario(practica.tutorEmpresarialId)
              const tutorAcademico = practica.tutorAcademicoId ? getUsuario(practica.tutorAcademicoId) : null
              const oferta = getOferta(practica.ofertaId)

              return (
                <Card key={practica.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {estudiante?.nombre} {estudiante?.apellido}
                        </CardTitle>
                        <CardDescription>
                          {oferta?.titulo} • {oferta?.empresa}
                        </CardDescription>
                      </div>
                      {getEstadoBadge(practica.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Inicio:</strong> {new Date(practica.fechaInicio).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Fin:</strong> {new Date(practica.fechaFin).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Carrera:</strong> {estudiante?.carrera}
                        </div>
                        <div>
                          <strong>Tutor Empresarial:</strong> {tutorEmpresarial?.nombre} {tutorEmpresarial?.apellido}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label>Tutor Académico</Label>
                          <Select
                            value={practica.tutorAcademicoId || "default"}
                            onValueChange={(value) => asignarTutorAcademico(practica.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  tutorAcademico
                                    ? `${tutorAcademico.nombre} ${tutorAcademico.apellido}`
                                    : "Asignar tutor académico"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {tutoresAcademicos.map((tutor) => (
                                <SelectItem key={tutor.id} value={tutor.id}>
                                  {tutor.nombre} {tutor.apellido}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {tutorAcademico && (
                          <div className="text-sm text-green-600 font-medium">
                            ✓ Asignado: {tutorAcademico.nombre} {tutorAcademico.apellido}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="estudiantes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lista de Estudiantes</h3>
          </div>

          <div className="grid gap-4">
            {estudiantes.map((estudiante) => {
              const practicaActual = practicas.find((p) => p.estudianteId === estudiante.id && p.estado === "en_curso")
              const practicasCompletadas = practicas.filter(
                (p) => p.estudianteId === estudiante.id && p.estado === "completada",
              ).length
              const tutorAcademico = estudiante.tutorAcademicoId ? getUsuario(estudiante.tutorAcademicoId) : null
              const tutorEmpresarial = estudiante.tutorEmpresarialId ? getUsuario(estudiante.tutorEmpresarialId) : null

              return (
                <Card key={estudiante.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {estudiante.nombre} {estudiante.apellido}
                        </CardTitle>
                        <CardDescription>
                          {estudiante.carrera} • {estudiante.email}
                        </CardDescription>
                      </div>
                      <Badge className={practicaActual ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {practicaActual ? "EN PRÁCTICA" : "DISPONIBLE"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Teléfono:</strong> {estudiante.telefono}
                        </div>
                        <div>
                          <strong>Prácticas completadas:</strong> {practicasCompletadas}
                        </div>
                        {practicaActual && (
                          <>
                            <div>
                              <strong>Empresa actual:</strong> {getOferta(practicaActual.ofertaId)?.empresa}
                            </div>
                            <div>
                              <strong>Fin de práctica:</strong> {new Date(practicaActual.fechaFin).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Asignación de tutores */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tutor Académico</Label>
                          <Select
                            value={estudiante.tutorAcademicoId || "sin_asignar"}
                            onValueChange={(value) => asignarTutorAEstudiante(estudiante.id, value, "academico")}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  tutorAcademico
                                    ? `${tutorAcademico.nombre} ${tutorAcademico.apellido}`
                                    : "Asignar tutor académico"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                              {tutoresAcademicos.map((tutor) => (
                                <SelectItem key={tutor.id} value={tutor.id}>
                                  {tutor.nombre} {tutor.apellido}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Tutor Empresarial</Label>
                          <Select
                            value={estudiante.tutorEmpresarialId || "sin_asignar"}
                            onValueChange={(value) => asignarTutorAEstudiante(estudiante.id, value, "empresarial")}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  tutorEmpresarial
                                    ? `${tutorEmpresarial.nombre} ${tutorEmpresarial.apellido}`
                                    : "Asignar tutor empresarial"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sin_asignar">Sin asignar</SelectItem> 
                              {tutoresEmpresariales.map((tutor) => (
                                <SelectItem key={tutor.id} value={tutor.id}>
                                  {tutor.nombre} {tutor.apellido} - {tutor.empresa}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tutores" className="space-y-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tutores Empresariales</h3>
              <div className="grid gap-4">
                {tutoresEmpresariales.map((tutor) => {
                  const practicasActivas = practicas.filter(
                    (p) => p.tutorEmpresarialId === tutor.id && p.estado === "en_curso",
                  ).length
                  const ofertasActivas = ofertas.filter(
                    (o) => o.tutorEmpresarialId === tutor.id && o.estado === "activa",
                  ).length

                  return (
                    <Card key={tutor.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>
                              {tutor.nombre} {tutor.apellido}
                            </CardTitle>
                            <CardDescription>
                              {tutor.empresa} • {tutor.email}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <strong>Teléfono:</strong> {tutor.telefono}
                          </div>
                          <div>
                            <strong>Practicantes actuales:</strong> {practicasActivas}
                          </div>
                          <div>
                            <strong>Ofertas activas:</strong> {ofertasActivas}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tutores Académicos</h3>
              <div className="grid gap-4">
                {tutoresAcademicos.map((tutor) => {
                  const estudiantesAsignados = practicas.filter(
                    (p) => p.tutorAcademicoId === tutor.id && p.estado === "en_curso",
                  ).length

                  return (
                    <Card key={tutor.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>
                              {tutor.nombre} {tutor.apellido}
                            </CardTitle>
                            <CardDescription>{tutor.email}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Teléfono:</strong> {tutor.telefono}
                          </div>
                          <div>
                            <strong>Estudiantes asignados:</strong> {estudiantesAsignados}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
            <Button onClick={() => setMostrarFormularioUsuario(!mostrarFormularioUsuario)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          {mostrarFormularioUsuario && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Usuario</CardTitle>
                <CardDescription>Agrega un nuevo usuario al sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email-usuario">Email</Label>
                    <Input
                      id="email-usuario"
                      type="email"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-usuario">Contraseña</Label>
                    <Input
                      id="password-usuario"
                      type="password"
                      value={nuevoUsuario.password}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre-usuario">Nombre</Label>
                    <Input
                      id="nombre-usuario"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido-usuario">Apellido</Label>
                    <Input
                      id="apellido-usuario"
                      value={nuevoUsuario.apellido}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rol-usuario">Rol</Label>
                    <Select
                      value={nuevoUsuario.rol}
                      onValueChange={(value: User["rol"]) => setNuevoUsuario({ ...nuevoUsuario, rol: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="estudiante">Estudiante</SelectItem>
                        <SelectItem value="tutor_empresarial">Tutor Empresarial</SelectItem>
                        <SelectItem value="coordinador_academico">Coordinador Académico</SelectItem>
                        <SelectItem value="tutor_academico">Tutor Académico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="telefono-usuario">Teléfono</Label>
                    <Input
                      id="telefono-usuario"
                      value={nuevoUsuario.telefono}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>
                </div>

                {nuevoUsuario.rol === "estudiante" && (
                  <div>
                    <Label htmlFor="carrera-usuario">Carrera</Label>
                    <Input
                      id="carrera-usuario"
                      value={nuevoUsuario.carrera}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, carrera: e.target.value })}
                      placeholder="Ingeniería de Sistemas"
                    />
                  </div>
                )}

                {nuevoUsuario.rol === "tutor_empresarial" && (
                  <div>
                    <Label htmlFor="empresa-usuario">Empresa</Label>
                    <Input
                      id="empresa-usuario"
                      value={nuevoUsuario.empresa}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, empresa: e.target.value })}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={crearUsuario}>Crear Usuario</Button>
                  <Button variant="outline" onClick={() => setMostrarFormularioUsuario(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {["estudiante", "tutor_empresarial", "coordinador_academico", "tutor_academico"].map((rol) => {
              const usuariosDelRol = [...estudiantes, ...tutoresEmpresariales, ...tutoresAcademicos].filter(
                (u) => u.rol === rol,
              )
              const nombreRol = {
                estudiante: "Estudiantes",
                tutor_empresarial: "Tutores Empresariales",
                coordinador_academico: "Coordinadores Académicos",
                tutor_academico: "Tutores Académicos",
              }[rol]

              return (
                <div key={rol}>
                  <h4 className="text-md font-semibold mb-3">{nombreRol}</h4>
                  <div className="grid gap-3">
                    {usuariosDelRol.map((usuario) => (
                      <Card key={usuario.id}>
                        <CardContent className="p-4">
                          {usuarioEditando?.id === usuario.id ? (
                            // Modo edición
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Nombre</Label>
                                  <Input
                                    value={datosEdicion.nombre || ""}
                                    onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Apellido</Label>
                                  <Input
                                    value={datosEdicion.apellido || ""}
                                    onChange={(e) => setDatosEdicion({ ...datosEdicion, apellido: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Email</Label>
                                  <Input
                                    value={datosEdicion.email || ""}
                                    onChange={(e) => setDatosEdicion({ ...datosEdicion, email: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Teléfono</Label>
                                  <Input
                                    value={datosEdicion.telefono || ""}
                                    onChange={(e) => setDatosEdicion({ ...datosEdicion, telefono: e.target.value })}
                                  />
                                </div>
                              </div>
                              {usuario.rol === "estudiante" && (
                                <div>
                                  <Label>Carrera</Label>
                                  <Input
                                    value={datosEdicion.carrera || ""}
                                    onChange={(e) => setDatosEdicion({ ...datosEdicion, carrera: e.target.value })}
                                  />
                                </div>
                              )}
                              {usuario.rol === "tutor_empresarial" && (
                                <div>
                                  <Label>Empresa</Label>
                                  <Input
                                    value={datosEdicion.empresa || ""}
                                    onChange={(e) => setDatosEdicion({ ...datosEdicion, empresa: e.target.value })}
                                  />
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button onClick={guardarEdicion} size="sm">
                                  <Save className="w-4 h-4 mr-1" />
                                  Guardar
                                </Button>
                                <Button variant="outline" onClick={cancelarEdicion} size="sm">
                                  <X className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Modo visualización
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <strong>
                                    {usuario.nombre} {usuario.apellido}
                                  </strong>
                                  <Badge variant="outline">{usuario.rol.replace("_", " ")}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>Email: {usuario.email}</div>
                                  <div>Teléfono: {usuario.telefono}</div>
                                  {usuario.carrera && <div>Carrera: {usuario.carrera}</div>}
                                  {usuario.empresa && <div>Empresa: {usuario.empresa}</div>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => iniciarEdicion(usuario)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => eliminarUsuario(usuario.id)}>
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Tareas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tareas.filter((t) => t.estado === "pendiente").length}
                  </div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{estadisticas.tareasCompletadas}</div>
                  <div className="text-sm text-gray-600">Completadas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      tareas.filter((t) => new Date(t.fechaVencimiento) < new Date() && t.estado !== "completada")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Vencidas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {tareas.map((tarea) => {
              const estudiante = getUsuario(tarea.estudianteId)
              const tutor = getUsuario(tarea.asignadaPor)

              return (
                <Card key={tarea.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tarea.titulo}</CardTitle>
                        <CardDescription>
                          Estudiante: {estudiante?.nombre} {estudiante?.apellido} • Asignada por: {tutor?.nombre}{" "}
                          {tutor?.apellido} ({tarea.tipoAsignador.replace("_", " ")})
                        </CardDescription>
                      </div>
                      {getEstadoBadge(tarea.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Creada:</strong> {new Date(tarea.fechaCreacion).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Vence:</strong> {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                        </div>
                        {tarea.fechaEntrega && (
                          <div>
                            <strong>Entregada:</strong> {new Date(tarea.fechaEntrega).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {tarea.entregaEstudiante && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <strong>Entrega:</strong>
                          <p className="text-sm text-gray-600 mt-1">{tarea.entregaEstudiante}</p>
                          {tarea.calificacion && (
                            <div className="mt-2">
                              <strong>Calificación:</strong>{" "}
                              <span className="text-green-600">{tarea.calificacion}/10</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reportes del Sistema</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resumen de Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>En curso:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {practicas.filter((p) => p.estado === "en_curso").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completadas:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {practicas.filter((p) => p.estado === "completada").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Canceladas:</span>
                    <Badge className="bg-red-100 text-red-800">
                      {practicas.filter((p) => p.estado === "cancelada").length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Empresas Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total empresas:</span>
                    <Badge>{new Set(tutoresEmpresariales.map((t) => t.empresa)).size}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Con ofertas activas:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {new Set(ofertas.filter((o) => o.estado === "activa").map((o) => o.empresa)).size}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Con practicantes:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {
                        new Set(
                          practicas
                            .filter((p) => p.estado === "en_curso")
                            .map((p) => {
                              const tutor = getUsuario(p.tutorEmpresarialId)
                              return tutor?.empresa
                            }),
                        ).size
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimos reportes de estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportes
                  .slice(-5)
                  .reverse()
                  .map((reporte) => {
                    const estudiante = getUsuario(reporte.estudianteId)
                    return (
                      <div key={reporte.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <strong>
                              {estudiante?.nombre} {estudiante?.apellido}
                            </strong>
                            <Badge variant="outline">{new Date(reporte.fecha).toLocaleDateString()}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{reporte.actividades}</p>
                          <div className="mt-2 text-xs text-gray-500">Horas trabajadas: {reporte.horasTrabajadas}h</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}