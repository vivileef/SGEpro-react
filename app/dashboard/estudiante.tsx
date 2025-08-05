"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Building2, FileText, Calendar, Plus, CheckCircle } from "lucide-react"

interface User {
  id: string
  nombre: string
  apellido: string
  carrera?: string
}

interface OfertaPractica {
  id: string
  titulo: string
  empresa: string
  descripcion: string
  requisitos: string
  duracion: string
  modalidad: string
  fechaInicio: string
  fechaFin: string
  estado: "activa" | "cerrada"
  tutorEmpresarialId: string
}

interface Postulacion {
  id: string
  estudianteId: string
  ofertaId: string
  fechaPostulacion: string
  estado: "pendiente" | "aceptada" | "rechazada"
  cartaPresentacion: string
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

interface Reporte {
  id: string
  practicaId: string
  estudianteId: string
  fecha: string
  actividades: string
  observaciones: string
  horasTrabajadas: number
}

// Agregar interfaces para tareas al inicio del archivo, después de las interfaces existentes
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

export default function EstudianteDashboard({ user }: { user: User }) {
  const [ofertas, setOfertas] = useState<OfertaPractica[]>([])
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [practicaActiva, setPracticaActiva] = useState<PracticaActiva | null>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cartaPresentacion, setCartaPresentacion] = useState("")
  const [nuevoReporte, setNuevoReporte] = useState({
    actividades: "",
    observaciones: "",
    horasTrabajadas: 0,
  })
  // En el componente EstudianteDashboard, agregar estados para tareas después de los estados existentes
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null)
  const [entregaTarea, setEntregaTarea] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    cargarDatos()
  }, [user.id])

  useEffect(() => {
    cargarDatos()

    const handleUserDataChange = () => {
      cargarDatos()
    }

    const handleTaskDataChange = () => {
      cargarDatos()
    }

    const handlePracticeDataChange = () => {
      cargarDatos()
    }

    window.addEventListener("userDataChanged", handleUserDataChange)
    window.addEventListener("taskDataChanged", handleTaskDataChange)
    window.addEventListener("practiceDataChanged", handlePracticeDataChange)

    return () => {
      window.removeEventListener("userDataChanged", handleUserDataChange)
      window.removeEventListener("taskDataChanged", handleTaskDataChange)
      window.removeEventListener("practiceDataChanged", handlePracticeDataChange)
    }
  }, [user.id])

  const cargarDatos = () => {
    // Cargar ofertas
    const ofertasData = localStorage.getItem("ofertas")
    if (ofertasData) {
      const todasOfertas: OfertaPractica[] = JSON.parse(ofertasData)
      setOfertas(todasOfertas.filter((o) => o.estado === "activa"))
    }

    // Cargar postulaciones del estudiante
    const postulacionesData = localStorage.getItem("postulaciones")
    if (postulacionesData) {
      const todasPostulaciones: Postulacion[] = JSON.parse(postulacionesData)
      setPostulaciones(todasPostulaciones.filter((p) => p.estudianteId === user.id))
    }

    // Cargar práctica activa
    const practicasData = localStorage.getItem("practicas")
    let practicaActual: PracticaActiva | null = null
    if (practicasData) {
      const todasPracticas: PracticaActiva[] = JSON.parse(practicasData)
      practicaActual = todasPracticas.find((p) => p.estudianteId === user.id && p.estado === "en_curso") || null
      setPracticaActiva(practicaActual)
    }

    // Cargar reportes
    const reportesData = localStorage.getItem("reportes")
    if (reportesData) {
      const todosReportes: Reporte[] = JSON.parse(reportesData)
      setReportes(todosReportes.filter((r) => r.estudianteId === user.id))
    }

    // Cargar tareas del estudiante
    const tareasData = localStorage.getItem("tareas")
    if (tareasData) {
      const todasTareas: Tarea[] = JSON.parse(tareasData)
      setTareas(todasTareas.filter((t) => t.estudianteId === user.id))
    }
  }

  const postularseOferta = (ofertaId: string) => {
    if (!cartaPresentacion.trim()) {
      toast({
        title: "Error",
        description: "Debes escribir una carta de presentación",
        variant: "destructive",
      })
      return
    }

    const postulacionesData = localStorage.getItem("postulaciones")
    const postulaciones: Postulacion[] = postulacionesData ? JSON.parse(postulacionesData) : []

    // Verificar si ya se postuló
    if (postulaciones.find((p) => p.estudianteId === user.id && p.ofertaId === ofertaId)) {
      toast({
        title: "Error",
        description: "Ya te has postulado a esta oferta",
        variant: "destructive",
      })
      return
    }

    const nuevaPostulacion: Postulacion = {
      id: Date.now().toString(),
      estudianteId: user.id,
      ofertaId,
      fechaPostulacion: new Date().toISOString(),
      estado: "pendiente",
      cartaPresentacion,
    }

    postulaciones.push(nuevaPostulacion)
    localStorage.setItem("postulaciones", JSON.stringify(postulaciones))
    window.dispatchEvent(new CustomEvent("practiceDataChanged"))

    setCartaPresentacion("")
    cargarDatos()

    toast({
      title: "Postulación enviada",
      description: "Tu postulación ha sido enviada correctamente",
    })
  }

  const crearReporte = () => {
    if (!practicaActiva) return

    if (!nuevoReporte.actividades.trim()) {
      toast({
        title: "Error",
        description: "Debes describir las actividades realizadas",
        variant: "destructive",
      })
      return
    }

    const reportesData = localStorage.getItem("reportes")
    const reportes: Reporte[] = reportesData ? JSON.parse(reportesData) : []

    const reporte: Reporte = {
      id: Date.now().toString(),
      practicaId: practicaActiva.id,
      estudianteId: user.id,
      fecha: new Date().toISOString(),
      ...nuevoReporte,
    }

    reportes.push(reporte)
    localStorage.setItem("reportes", JSON.stringify(reportes))
    window.dispatchEvent(new CustomEvent("practiceDataChanged"))

    setNuevoReporte({
      actividades: "",
      observaciones: "",
      horasTrabajadas: 0,
    })

    cargarDatos()

    toast({
      title: "Reporte creado",
      description: "Tu reporte ha sido guardado correctamente",
    })
  }

  // Agregar función para completar tarea después de la función crearReporte
  const completarTarea = (tareaId: string) => {
    if (!entregaTarea.trim()) {
      toast({
        title: "Error",
        description: "Debes escribir tu entrega",
        variant: "destructive",
      })
      return
    }

    const tareasData = localStorage.getItem("tareas")
    if (!tareasData) return

    const tareas: Tarea[] = JSON.parse(tareasData)
    const tarea = tareas.find((t) => t.id === tareaId)

    if (tarea) {
      tarea.estado = "completada"
      tarea.entregaEstudiante = entregaTarea
      tarea.fechaEntrega = new Date().toISOString()
      localStorage.setItem("tareas", JSON.stringify(tareas))
      window.dispatchEvent(new CustomEvent("taskDataChanged"))

      setEntregaTarea("")
      setTareaSeleccionada(null)
      cargarDatos()

      toast({
        title: "Tarea completada",
        description: "Tu tarea ha sido enviada correctamente",
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pendiente: "default",
      aceptada: "default",
      rechazada: "destructive",
      en_curso: "default",
      completada: "default",
    }

    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      aceptada: "bg-green-100 text-green-800",
      rechazada: "bg-red-100 text-red-800",
      en_curso: "bg-blue-100 text-blue-800",
      completada: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[estado as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {estado.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      {/* Actualizar el grid de resumen para incluir tareas (reemplazar el grid existente) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ofertas Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{ofertas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mis Postulaciones</p>
                <p className="text-2xl font-bold text-gray-900">{postulaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tareas.filter((t) => t.estado === "pendiente").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reportes</p>
                <p className="text-2xl font-bold text-gray-900">{reportes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tareas.filter((t) => t.estado === "completada").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ofertas" className="space-y-4">
        {/* Actualizar las TabsList para incluir tareas */}
        <TabsList>
          <TabsTrigger value="ofertas">Ofertas Disponibles</TabsTrigger>
          <TabsTrigger value="postulaciones">Mis Postulaciones</TabsTrigger>
          <TabsTrigger value="tareas">Mis Tareas</TabsTrigger>
          <TabsTrigger value="practica">Mi Práctica</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="ofertas" className="space-y-4">
          <div className="grid gap-4">
            {ofertas.map((oferta) => (
              <Card key={oferta.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{oferta.titulo}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium text-blue-600">{oferta.empresa}</span>
                          <span>•</span>
                          <span>{oferta.modalidad}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge>{oferta.modalidad}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Empresa:</strong> {oferta.empresa}
                        </div>
                        <div>
                          <strong>Duración:</strong> {oferta.duracion}
                        </div>
                        <div>
                          <strong>Modalidad:</strong> {oferta.modalidad}
                        </div>
                        <div>
                          <strong>Inicio:</strong> {new Date(oferta.fechaInicio).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <strong>Descripción:</strong>
                      <p className="text-sm text-gray-600 mt-1">{oferta.descripcion}</p>
                    </div>

                    {oferta.requisitos && (
                      <div>
                        <strong>Requisitos:</strong>
                        <p className="text-sm text-gray-600 mt-1">{oferta.requisitos}</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor={`carta-${oferta.id}`}>Carta de Presentación</Label>
                      <Textarea
                        id={`carta-${oferta.id}`}
                        placeholder="Escribe tu carta de presentación..."
                        value={cartaPresentacion}
                        onChange={(e) => setCartaPresentacion(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={() => postularseOferta(oferta.id)}
                      className="w-full"
                      disabled={postulaciones.some((p) => p.ofertaId === oferta.id)}
                    >
                      {postulaciones.some((p) => p.ofertaId === oferta.id) ? "Ya Postulado" : "Postularme"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="postulaciones" className="space-y-4">
          <div className="grid gap-4">
            {postulaciones.map((postulacion) => {
              const oferta = ofertas.find((o) => o.id === postulacion.ofertaId)
              return (
                <Card key={postulacion.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{oferta?.titulo || "Oferta no encontrada"}</CardTitle>
                        <CardDescription>{oferta?.empresa}</CardDescription>
                      </div>
                      {getEstadoBadge(postulacion.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Fecha de postulación:</strong>{" "}
                        {new Date(postulacion.fechaPostulacion).toLocaleDateString()}
                      </p>
                      <div>
                        <strong>Carta de presentación:</strong>
                        <p className="text-sm text-gray-600 mt-1">{postulacion.cartaPresentacion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Agregar TabsContent para tareas después del TabsContent de postulaciones */}
        <TabsContent value="tareas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mis Tareas</h3>
          </div>

          <div className="grid gap-4">
            {tareas.map((tarea) => (
              <Card key={tarea.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tarea.titulo}</CardTitle>
                      <CardDescription>Vence: {new Date(tarea.fechaVencimiento).toLocaleDateString()}</CardDescription>
                    </div>
                    {getEstadoBadge(tarea.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Asignada por:</strong>{" "}
                        {tarea.tipoAsignador === "tutor_empresarial" ? "Tutor Empresarial" : "Tutor Académico"}
                      </div>
                      <div>
                        <strong>Fecha creación:</strong> {new Date(tarea.fechaCreacion).toLocaleDateString()}
                      </div>
                    </div>

                    {tarea.estado === "completada" && tarea.entregaEstudiante && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <strong>Tu entrega:</strong>
                        <p className="text-sm text-gray-600 mt-1">{tarea.entregaEstudiante}</p>
                        {tarea.calificacion && (
                          <div className="mt-2">
                            <strong>Calificación:</strong>{" "}
                            <span className="text-green-600">{tarea.calificacion}/10</span>
                          </div>
                        )}
                        {tarea.comentariosTutor && (
                          <div className="mt-2">
                            <strong>Comentarios del tutor:</strong>
                            <p className="text-sm text-gray-600">{tarea.comentariosTutor}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {tarea.estado === "pendiente" && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`entrega-${tarea.id}`}>Tu entrega</Label>
                          <Textarea
                            id={`entrega-${tarea.id}`}
                            placeholder="Describe tu trabajo realizado..."
                            value={tareaSeleccionada?.id === tarea.id ? entregaTarea : ""}
                            onChange={(e) => {
                              setTareaSeleccionada(tarea)
                              setEntregaTarea(e.target.value)
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => completarTarea(tarea.id)}
                          disabled={!tareaSeleccionada || tareaSeleccionada.id !== tarea.id || !entregaTarea.trim()}
                        >
                          Entregar Tarea
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practica" className="space-y-4">
          {practicaActiva ? (
            <Card>
              <CardHeader>
                <CardTitle>Práctica en Curso</CardTitle>
                <CardDescription>Información de tu práctica actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Fecha de inicio:</strong> {new Date(practicaActiva.fechaInicio).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Fecha de fin:</strong> {new Date(practicaActiva.fechaFin).toLocaleDateString()}
                    </div>
                  </div>
                  {getEstadoBadge(practicaActiva.estado)}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No tienes una práctica activa actualmente</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          {practicaActiva && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Reporte</CardTitle>
                <CardDescription>Registra tus actividades diarias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="actividades">Actividades Realizadas</Label>
                  <Textarea
                    id="actividades"
                    placeholder="Describe las actividades que realizaste..."
                    value={nuevoReporte.actividades}
                    onChange={(e) => setNuevoReporte({ ...nuevoReporte, actividades: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={nuevoReporte.observaciones}
                    onChange={(e) => setNuevoReporte({ ...nuevoReporte, observaciones: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="horas">Horas Trabajadas</Label>
                  <Input
                    id="horas"
                    type="number"
                    min="0"
                    max="12"
                    value={nuevoReporte.horasTrabajadas}
                    onChange={(e) =>
                      setNuevoReporte({ ...nuevoReporte, horasTrabajadas: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <Button onClick={crearReporte} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Reporte
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {reportes.map((reporte) => (
              <Card key={reporte.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Reporte del {new Date(reporte.fecha).toLocaleDateString()}</CardTitle>
                    <Badge>{reporte.horasTrabajadas}h</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <strong>Actividades:</strong>
                      <p className="text-sm text-gray-600">{reporte.actividades}</p>
                    </div>
                    {reporte.observaciones && (
                      <div>
                        <strong>Observaciones:</strong>
                        <p className="text-sm text-gray-600">{reporte.observaciones}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
