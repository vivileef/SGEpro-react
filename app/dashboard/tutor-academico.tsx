"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Users, FileText, Star, CheckCircle, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  carrera?: string
  telefono?: string
  rol?: string
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

interface Evaluacion {
  id: string
  practicaId: string
  estudianteId: string
  tutorAcademicoId: string
  fecha: string
  calificacion: number
  comentarios: string
  aspectos: {
    puntualidad: number
    responsabilidad: number
    iniciativa: number
    conocimientos: number
    comunicacion: number
  }
}

export default function TutorAcademicoDashboard({ user }: { user: User }) {
  const [estudiantes, setEstudiantes] = useState<User[]>([])
  const [practicas, setPracticas] = useState<PracticaActiva[]>([])
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [nuevaEvaluacion, setNuevaEvaluacion] = useState({
    practicaId: "",
    calificacion: 0,
    comentarios: "",
    aspectos: {
      puntualidad: 0,
      responsabilidad: 0,
      iniciativa: 0,
      conocimientos: 0,
      comunicacion: 0,
    },
  })
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    fechaVencimiento: "",
    estudianteId: "",
  })
  const [mostrarFormularioEvaluacion, setMostrarFormularioEvaluacion] = useState(false)
  const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false)
  const { toast } = useToast()

  const cargarDatos = () => {
    try {
      const usuariosData = localStorage.getItem("users")
      if (usuariosData) {
        const usuarios: User[] = JSON.parse(usuariosData)
        setEstudiantes(usuarios.filter((u) => u.rol === "estudiante"))
      }

      const practicasData = localStorage.getItem("practicas")
      let misPracticas: PracticaActiva[] = []
      if (practicasData) {
        const todasPracticas: PracticaActiva[] = JSON.parse(practicasData)
        misPracticas = todasPracticas.filter((p) => p.tutorAcademicoId === user.id)
        setPracticas(misPracticas)
      }

      const reportesData = localStorage.getItem("reportes")
      if (reportesData) {
        const todosReportes: Reporte[] = JSON.parse(reportesData)
        const estudiantesIds = misPracticas.map((p) => p.estudianteId)
        setReportes(todosReportes.filter((r) => estudiantesIds.includes(r.estudianteId)))
      }

      const evaluacionesData = localStorage.getItem("evaluaciones")
      if (evaluacionesData) {
        const todasEvaluaciones: Evaluacion[] = JSON.parse(evaluacionesData)
        setEvaluaciones(todasEvaluaciones.filter((e) => e.tutorAcademicoId === user.id))
      }

      const tareasData = localStorage.getItem("tareas")
      if (tareasData) {
        const todasTareas: Tarea[] = JSON.parse(tareasData)
        setTareas(todasTareas.filter((t) => t.asignadaPor === user.id && t.tipoAsignador === "tutor_academico"))
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    }
  }

  useEffect(() => {
    cargarDatos()

    const handleDataChange = () => cargarDatos()

    window.addEventListener("userDataChanged", handleDataChange)
    window.addEventListener("taskDataChanged", handleDataChange)
    window.addEventListener("practiceDataChanged", handleDataChange)

    return () => {
      window.removeEventListener("userDataChanged", handleDataChange)
      window.removeEventListener("taskDataChanged", handleDataChange)
      window.removeEventListener("practiceDataChanged", handleDataChange)
    }
  }, [user.id])

  const crearEvaluacion = () => {
    if (!nuevaEvaluacion.practicaId || nuevaEvaluacion.calificacion === 0) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const evaluacionesData = localStorage.getItem("evaluaciones")
    const evaluaciones: Evaluacion[] = evaluacionesData ? JSON.parse(evaluacionesData) : []
    const practica = practicas.find((p) => p.id === nuevaEvaluacion.practicaId)

    if (!practica) return

    const evaluacion: Evaluacion = {
      id: Date.now().toString(),
      ...nuevaEvaluacion,
      estudianteId: practica.estudianteId,
      tutorAcademicoId: user.id,
      fecha: new Date().toISOString(),
    }

    evaluaciones.push(evaluacion)
    localStorage.setItem("evaluaciones", JSON.stringify(evaluaciones))
    window.dispatchEvent(new CustomEvent("practiceDataChanged"))

    setNuevaEvaluacion({
      practicaId: "",
      calificacion: 0,
      comentarios: "",
      aspectos: {
        puntualidad: 0,
        responsabilidad: 0,
        iniciativa: 0,
        conocimientos: 0,
        comunicacion: 0,
      },
    })
    setMostrarFormularioEvaluacion(false)
    cargarDatos()

    toast({
      title: "Evaluación creada",
      description: "La evaluación ha sido guardada correctamente",
    })
  }

  const crearTarea = () => {
    if (!nuevaTarea.titulo.trim() || !nuevaTarea.descripcion.trim() || !nuevaTarea.estudianteId) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const tareasData = localStorage.getItem("tareas")
    const tareas: Tarea[] = tareasData ? JSON.parse(tareasData) : []
    const practica = practicas.find((p) => p.estudianteId === nuevaTarea.estudianteId)

    if (!practica) {
      toast({
        title: "Error",
        description: "El estudiante no tiene una práctica activa",
        variant: "destructive",
      })
      return
    }

    const tarea: Tarea = {
      id: Date.now().toString(),
      ...nuevaTarea,
      fechaCreacion: new Date().toISOString(),
      estado: "pendiente",
      asignadaPor: user.id,
      practicaId: practica.id,
      tipoAsignador: "tutor_academico",
    }

    tareas.push(tarea)
    localStorage.setItem("tareas", JSON.stringify(tareas))
    window.dispatchEvent(new CustomEvent("taskDataChanged"))

    setNuevaTarea({
      titulo: "",
      descripcion: "",
      fechaVencimiento: "",
      estudianteId: "",
    })
    setMostrarFormularioTarea(false)
    cargarDatos()

    toast({
      title: "Tarea creada",
      description: "La tarea ha sido asignada correctamente",
    })
  }

  const calificarTarea = (tareaId: string, calificacion: number, comentarios: string) => {
    const tareasData = localStorage.getItem("tareas")
    if (!tareasData) return

    const tareas: Tarea[] = JSON.parse(tareasData)
    const tarea = tareas.find((t) => t.id === tareaId)

    if (tarea) {
      tarea.calificacion = calificacion
      tarea.comentariosTutor = comentarios
      localStorage.setItem("tareas", JSON.stringify(tareas))
      window.dispatchEvent(new CustomEvent("taskDataChanged"))
      cargarDatos()

      toast({
        title: "Tarea calificada",
        description: "La calificación ha sido guardada",
      })
    }
  }

  const getEstudiante = (estudianteId: string) => {
    return estudiantes.find((e) => e.id === estudianteId)
  }

  const getEstadoBadge = (estado: string) => {
    const colors = {
      en_curso: "bg-blue-100 text-blue-800",
      completada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
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

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 4.5) return "text-green-600"
    if (calificacion >= 3.5) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes Asignados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {practicas.filter((p) => p.estado === "en_curso").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reportes Recibidos</p>
                <p className="text-2xl font-bold text-gray-900">{reportes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evaluaciones</p>
                <p className="text-2xl font-bold text-gray-900">{evaluaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Asignadas</p>
                <p className="text-2xl font-bold text-gray-900">{tareas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
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

      <Tabs defaultValue="estudiantes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estudiantes">Mis Estudiantes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="estudiantes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Estudiantes Asignados</h3>
          </div>

          <div className="grid gap-4">
            {practicas.map((practica) => {
              const estudiante = getEstudiante(practica.estudianteId)
              const reportesEstudiante = reportes.filter((r) => r.estudianteId === practica.estudianteId)
              const evaluacionEstudiante = evaluaciones.find((e) => e.practicaId === practica.id)

              return (
                <Card key={practica.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {estudiante?.nombre} {estudiante?.apellido}
                        </CardTitle>
                        <CardDescription>
                          {estudiante?.carrera} • {estudiante?.email}
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
                          <strong>Teléfono:</strong> {estudiante?.telefono}
                        </div>
                        <div>
                          <strong>Reportes enviados:</strong> {reportesEstudiante.length}
                        </div>
                      </div>

                      {evaluacionEstudiante && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Evaluación:</span>
                            <span className={`font-bold ${getCalificacionColor(evaluacionEstudiante.calificacion)}`}>
                              {evaluacionEstudiante.calificacion.toFixed(1)}/5.0
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{evaluacionEstudiante.comentarios}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNuevaEvaluacion({ ...nuevaEvaluacion, practicaId: practica.id })
                            setMostrarFormularioEvaluacion(true)
                          }}
                          disabled={!!evaluacionEstudiante}
                        >
                          {evaluacionEstudiante ? "Ya Evaluado" : "Evaluar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Tareas</h3>
            <Button onClick={() => setMostrarFormularioTarea(!mostrarFormularioTarea)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>

          {mostrarFormularioTarea && (
            <Card>
              <CardHeader>
                <CardTitle>Asignar Nueva Tarea</CardTitle>
                <CardDescription>Asigna una tarea académica a un estudiante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo-tarea">Título de la Tarea</Label>
                  <Input
                    id="titulo-tarea"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                    placeholder="Ej: Informe de avance semanal"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion-tarea">Descripción</Label>
                  <Textarea
                    id="descripcion-tarea"
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                    placeholder="Describe detalladamente la tarea académica..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estudiante-tarea">Estudiante</Label>
                    <Select
                      value={nuevaTarea.estudianteId}
                      onValueChange={(value) => setNuevaTarea({ ...nuevaTarea, estudianteId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {practicas
                          .filter((p) => p.estado === "en_curso")
                          .map((practica) => {
                            const estudiante = getEstudiante(practica.estudianteId)
                            return (
                              <SelectItem key={practica.estudianteId} value={practica.estudianteId}>
                                {estudiante?.nombre} {estudiante?.apellido}
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fecha-vencimiento">Fecha de Vencimiento</Label>
                    <Input
                      id="fecha-vencimiento"
                      type="date"
                      value={nuevaTarea.fechaVencimiento}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaVencimiento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={crearTarea}>Asignar Tarea</Button>
                  <Button variant="outline" onClick={() => setMostrarFormularioTarea(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {tareas.map((tarea) => {
              const estudiante = getEstudiante(tarea.estudianteId)
              return (
                <Card key={tarea.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{tarea.titulo}</CardTitle>
                        <CardDescription>
                          Asignada a: {estudiante?.nombre} {estudiante?.apellido}
                        </CardDescription>
                      </div>
                      {getEstadoBadge(tarea.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Fecha creación:</strong> {new Date(tarea.fechaCreacion).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Vencimiento:</strong> {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                        </div>
                      </div>

                      {tarea.estado === "completada" && tarea.entregaEstudiante && (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <strong>Entrega del estudiante:</strong>
                            <p className="text-sm text-gray-600 mt-1">{tarea.entregaEstudiante}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Entregado: {tarea.fechaEntrega ? new Date(tarea.fechaEntrega).toLocaleDateString() : ""}
                            </p>
                          </div>

                          {!tarea.calificacion && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Calificación (1-10)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  placeholder="Calificación"
                                  onBlur={(e) => {
                                    const calificacion = Number.parseInt(e.target.value)
                                    const comentarios =
                                      (
                                        e.target.parentElement?.parentElement?.querySelector(
                                          "textarea",
                                        ) as HTMLTextAreaElement
                                      )?.value || ""
                                    if (calificacion >= 1 && calificacion <= 10) {
                                      calificarTarea(tarea.id, calificacion, comentarios)
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Comentarios</Label>
                                <Textarea placeholder="Comentarios sobre la entrega..." />
                              </div>
                            </div>
                          )}

                          {tarea.calificacion && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <strong>Calificación:</strong>{" "}
                              <span className="text-green-600">{tarea.calificacion}/10</span>
                              {tarea.comentariosTutor && (
                                <div className="mt-1">
                                  <strong>Comentarios:</strong>
                                  <p className="text-sm text-gray-600">{tarea.comentariosTutor}</p>
                                </div>
                              )}
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
            <h3 className="text-lg font-semibold">Reportes de Estudiantes</h3>
          </div>

          <div className="grid gap-4">
            {reportes
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((reporte) => {
                const estudiante = getEstudiante(reporte.estudianteId)

                return (
                  <Card key={reporte.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {estudiante?.nombre} {estudiante?.apellido}
                          </CardTitle>
                          <CardDescription>
                            {new Date(reporte.fecha).toLocaleDateString()} • {reporte.horasTrabajadas}h trabajadas
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <strong>Actividades realizadas:</strong>
                          <p className="text-sm text-gray-600 mt-1">{reporte.actividades}</p>
                        </div>
                        {reporte.observaciones && (
                          <div>
                            <strong>Observaciones:</strong>
                            <p className="text-sm text-gray-600 mt-1">{reporte.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evaluaciones</h3>
          </div>

          {mostrarFormularioEvaluacion && (
            <Card>
              <CardHeader>
                <CardTitle>Nueva Evaluación</CardTitle>
                <CardDescription>Evalúa el desempeño del estudiante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-5 gap-4">
                  {["puntualidad", "responsabilidad", "iniciativa", "conocimientos", "comunicacion"].map((aspecto) => (
                    <div key={aspecto}>
                      <Label>{aspecto.charAt(0).toUpperCase() + aspecto.slice(1)}</Label>
                      <Select
                        value={nuevaEvaluacion.aspectos[aspecto as keyof typeof nuevaEvaluacion.aspectos].toString()}
                        onValueChange={(value) =>
                          setNuevaEvaluacion({
                            ...nuevaEvaluacion,
                            aspectos: { ...nuevaEvaluacion.aspectos, [aspecto]: Number.parseInt(value) },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Deficiente</SelectItem>
                          <SelectItem value="2">2 - Regular</SelectItem>
                          <SelectItem value="3">3 - Bueno</SelectItem>
                          <SelectItem value="4">4 - Muy Bueno</SelectItem>
                          <SelectItem value="5">5 - Excelente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div>
                  <Label>Calificación Final</Label>
                  <Select
                    value={nuevaEvaluacion.calificacion.toString()}
                    onValueChange={(value) =>
                      setNuevaEvaluacion({ ...nuevaEvaluacion, calificacion: Number.parseFloat(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0 - Deficiente</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2.0">2.0 - Regular</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3.0">3.0 - Bueno</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                      <SelectItem value="4.0">4.0 - Muy Bueno</SelectItem>
                      <SelectItem value="4.5">4.5</SelectItem>
                      <SelectItem value="5.0">5.0 - Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Comentarios</Label>
                  <Textarea
                    placeholder="Comentarios sobre el desempeño del estudiante..."
                    value={nuevaEvaluacion.comentarios}
                    onChange={(e) => setNuevaEvaluacion({ ...nuevaEvaluacion, comentarios: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={crearEvaluacion}>Guardar Evaluación</Button>
                  <Button variant="outline" onClick={() => setMostrarFormularioEvaluacion(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {evaluaciones.map((evaluacion) => {
              const estudiante = getEstudiante(evaluacion.estudianteId)

              return (
                <Card key={evaluacion.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {estudiante?.nombre} {estudiante?.apellido}
                        </CardTitle>
                        <CardDescription>{new Date(evaluacion.fecha).toLocaleDateString()}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getCalificacionColor(evaluacion.calificacion)}`}>
                          {evaluacion.calificacion.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">/ 5.0</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        {Object.entries(evaluacion.aspectos).map(([aspecto, valor]) => (
                          <div key={aspecto} className="text-center">
                            <div className="font-medium">{aspecto.charAt(0).toUpperCase() + aspecto.slice(1)}</div>
                            <div className={getCalificacionColor(valor)}>{valor}/5</div>
                          </div>
                        ))}
                      </div>

                      {evaluacion.comentarios && (
                        <div>
                          <strong>Comentarios:</strong>
                          <p className="text-sm text-gray-600 mt-1">{evaluacion.comentarios}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
