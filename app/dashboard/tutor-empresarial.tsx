"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Building2, FileText, Users, Plus, CheckCircle, XCircle } from "lucide-react"

interface User {
  id: string
  nombre: string
  apellido: string
  empresa?: string
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

export default function TutorEmpresarialDashboard({ user }: { user: User }) {
  const [ofertas, setOfertas] = useState<OfertaPractica[]>([])
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [practicas, setPracticas] = useState<PracticaActiva[]>([])
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [nuevaOferta, setNuevaOferta] = useState({
    titulo: "",
    descripcion: "",
    requisitos: "",
    duracion: "",
    modalidad: "presencial",
    fechaInicio: "",
    fechaFin: "",
    empresaId: "",
  })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const { toast } = useToast()

  const [tareas, setTareas] = useState<Tarea[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    fechaVencimiento: "",
    estudianteId: "",
  })
  const [nuevaEmpresa, setNuevaEmpresa] = useState({
    nombre: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    sector: "",
    descripcion: "",
  })
  const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false)
  const [mostrarFormularioEmpresa, setMostrarFormularioEmpresa] = useState(false)

  useEffect(() => {
    cargarDatos()

    const handleDataChange = () => {
      cargarDatos()
    }

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
    // Cargar estudiantes PRIMERO
    const usuariosData = localStorage.getItem("users")
    if (usuariosData) {
      const usuarios = JSON.parse(usuariosData)
      setEstudiantes(usuarios.filter((u: any) => u.rol === "estudiante"))
    }

    // Cargar ofertas del tutor
    const ofertasData = localStorage.getItem("ofertas")
    let misOfertas: OfertaPractica[] = []
    if (ofertasData) {
      const todasOfertas: OfertaPractica[] = JSON.parse(ofertasData)
      misOfertas = todasOfertas.filter((o) => o.tutorEmpresarialId === user.id)
      setOfertas(misOfertas)
    }

    // Cargar postulaciones a las ofertas del tutor
    const postulacionesData = localStorage.getItem("postulaciones")
    if (postulacionesData) {
      const todasPostulaciones: Postulacion[] = JSON.parse(postulacionesData)
      const misOfertasIds = misOfertas.map((o) => o.id)
      setPostulaciones(todasPostulaciones.filter((p) => misOfertasIds.includes(p.ofertaId)))
    }

    // Cargar prácticas
    const practicasData = localStorage.getItem("practicas")
    if (practicasData) {
      const todasPracticas: PracticaActiva[] = JSON.parse(practicasData)
      setPracticas(todasPracticas.filter((p) => p.tutorEmpresarialId === user.id))
    }

    // Cargar tareas
    const tareasData = localStorage.getItem("tareas")
    if (tareasData) {
      const todasTareas: Tarea[] = JSON.parse(tareasData)
      setTareas(todasTareas.filter((t) => t.asignadaPor === user.id && t.tipoAsignador === "tutor_empresarial"))
    }

    // Cargar empresas
    const empresasData = localStorage.getItem("empresas")
    if (empresasData) {
      setEmpresas(JSON.parse(empresasData))
    }
  }

  const crearOferta = () => {
    if (!nuevaOferta.titulo.trim() || !nuevaOferta.descripcion.trim() || !nuevaOferta.empresaId) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const ofertasData = localStorage.getItem("ofertas")
    const ofertas: OfertaPractica[] = ofertasData ? JSON.parse(ofertasData) : []

    // Buscar la empresa seleccionada
    const empresaSeleccionada = empresas.find((e) => e.id === nuevaOferta.empresaId)

    const oferta: OfertaPractica = {
      id: Date.now().toString(),
      titulo: nuevaOferta.titulo,
      descripcion: nuevaOferta.descripcion,
      requisitos: nuevaOferta.requisitos,
      duracion: nuevaOferta.duracion,
      modalidad: nuevaOferta.modalidad,
      fechaInicio: nuevaOferta.fechaInicio,
      fechaFin: nuevaOferta.fechaFin,
      empresa: empresaSeleccionada?.nombre || "Mi Empresa",
      estado: "activa",
      tutorEmpresarialId: user.id,
    }

    ofertas.push(oferta)
    localStorage.setItem("ofertas", JSON.stringify(ofertas))

    // Disparar evento
    window.dispatchEvent(new CustomEvent("practiceDataChanged"))

    setNuevaOferta({
      titulo: "",
      descripcion: "",
      requisitos: "",
      duracion: "",
      modalidad: "presencial",
      fechaInicio: "",
      fechaFin: "",
      empresaId: "",
    })
    setMostrarFormulario(false)

    toast({
      title: "Oferta creada",
      description: "La oferta ha sido publicada correctamente",
    })
    cargarDatos()
  }

  const gestionarPostulacion = (postulacionId: string, accion: "aceptar" | "rechazar") => {
    const postulacionesData = localStorage.getItem("postulaciones")
    if (!postulacionesData) return

    const postulaciones: Postulacion[] = JSON.parse(postulacionesData)
    const postulacion = postulaciones.find((p) => p.id === postulacionId)

    if (!postulacion) return

    postulacion.estado = accion === "aceptar" ? "aceptada" : "rechazada"
    localStorage.setItem("postulaciones", JSON.stringify(postulaciones))

    // Si se acepta, crear práctica
    if (accion === "aceptar") {
      const practicasData = localStorage.getItem("practicas")
      const practicas: PracticaActiva[] = practicasData ? JSON.parse(practicasData) : []

      const oferta = ofertas.find((o) => o.id === postulacion.ofertaId)
      if (oferta) {
        const practica: PracticaActiva = {
          id: Date.now().toString(),
          estudianteId: postulacion.estudianteId,
          ofertaId: postulacion.ofertaId,
          fechaInicio: oferta.fechaInicio,
          fechaFin: oferta.fechaFin,
          estado: "en_curso",
          tutorEmpresarialId: user.id,
        }

        practicas.push(practica)
        localStorage.setItem("practicas", JSON.stringify(practicas))
      }
    }

    // Disparar evento
    window.dispatchEvent(new CustomEvent("practiceDataChanged"))

    toast({
      title: accion === "aceptar" ? "Postulación aceptada" : "Postulación rechazada",
      description: `La postulación ha sido ${accion === "aceptar" ? "aceptada" : "rechazada"} correctamente`,
    })
    cargarDatos()
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
      tipoAsignador: "tutor_empresarial",
    }

    tareas.push(tarea)
    localStorage.setItem("tareas", JSON.stringify(tareas))

    // Disparar evento
    window.dispatchEvent(new CustomEvent("taskDataChanged"))

    setNuevaTarea({
      titulo: "",
      descripcion: "",
      fechaVencimiento: "",
      estudianteId: "",
    })
    setMostrarFormularioTarea(false)

    toast({
      title: "Tarea creada",
      description: "La tarea ha sido asignada correctamente",
    })
    cargarDatos()
  }

  const crearEmpresa = () => {
    if (!nuevaEmpresa.nombre.trim() || !nuevaEmpresa.ruc.trim()) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const empresasData = localStorage.getItem("empresas")
    const empresas: Empresa[] = empresasData ? JSON.parse(empresasData) : []

    const empresa: Empresa = {
      id: Date.now().toString(),
      ...nuevaEmpresa,
      fechaRegistro: new Date().toISOString(),
    }

    empresas.push(empresa)
    localStorage.setItem("empresas", JSON.stringify(empresas))

    setNuevaEmpresa({
      nombre: "",
      ruc: "",
      direccion: "",
      telefono: "",
      email: "",
      sector: "",
      descripcion: "",
    })
    setMostrarFormularioEmpresa(false)

    toast({
      title: "Empresa registrada",
      description: "La empresa ha sido registrada correctamente",
    })
    cargarDatos()
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

      toast({
        title: "Tarea calificada",
        description: "La calificación ha sido guardada",
      })
    }
    cargarDatos()
  }

  const getEstadoBadge = (estado: string) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      aceptada: "bg-green-100 text-green-800",
      rechazada: "bg-red-100 text-red-800",
      activa: "bg-blue-100 text-blue-800",
      cerrada: "bg-gray-100 text-gray-800",
      en_curso: "bg-blue-100 text-blue-800",
      completada: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[estado as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {estado.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getEstudiante = (estudianteId: string) => {
    return estudiantes.find((e) => e.id === estudianteId)
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mis Ofertas</p>
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
                <p className="text-sm font-medium text-gray-600">Postulaciones</p>
                <p className="text-2xl font-bold text-gray-900">{postulaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Practicantes</p>
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
              <Building2 className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{empresas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ofertas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ofertas">Mis Ofertas</TabsTrigger>
          <TabsTrigger value="postulaciones">Postulaciones</TabsTrigger>
          <TabsTrigger value="practicantes">Practicantes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
        </TabsList>

        <TabsContent value="ofertas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ofertas de Práctica</h3>
            <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Oferta
            </Button>
          </div>

          {mostrarFormulario && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nueva Oferta</CardTitle>
                <CardDescription>Completa la información de la oferta de práctica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título de la Oferta</Label>
                    <Input
                      id="titulo"
                      value={nuevaOferta.titulo}
                      onChange={(e) => setNuevaOferta({ ...nuevaOferta, titulo: e.target.value })}
                      placeholder="Ej: Desarrollador Frontend"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duracion">Duración</Label>
                    <Input
                      id="duracion"
                      value={nuevaOferta.duracion}
                      onChange={(e) => setNuevaOferta({ ...nuevaOferta, duracion: e.target.value })}
                      placeholder="Ej: 3 meses"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="empresa">Empresa</Label>
                  <Select
                    value={nuevaOferta.empresaId}
                    onValueChange={(value) => setNuevaOferta({ ...nuevaOferta, empresaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={nuevaOferta.descripcion}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, descripcion: e.target.value })}
                    placeholder="Describe las actividades y responsabilidades..."
                  />
                </div>

                <div>
                  <Label htmlFor="requisitos">Requisitos</Label>
                  <Textarea
                    id="requisitos"
                    value={nuevaOferta.requisitos}
                    onChange={(e) => setNuevaOferta({ ...nuevaOferta, requisitos: e.target.value })}
                    placeholder="Lista los requisitos necesarios..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="modalidad">Modalidad</Label>
                    <Select
                      value={nuevaOferta.modalidad}
                      onValueChange={(value) => setNuevaOferta({ ...nuevaOferta, modalidad: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="remoto">Remoto</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={nuevaOferta.fechaInicio}
                      onChange={(e) => setNuevaOferta({ ...nuevaOferta, fechaInicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaFin">Fecha de Fin</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={nuevaOferta.fechaFin}
                      onChange={(e) => setNuevaOferta({ ...nuevaOferta, fechaFin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={crearOferta}>Crear Oferta</Button>
                  <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {ofertas.map((oferta) => (
              <Card key={oferta.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{oferta.titulo}</CardTitle>
                      <CardDescription>
                        {oferta.empresa} • {oferta.modalidad}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(oferta.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{oferta.descripcion}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Duración:</strong> {oferta.duracion}
                      </div>
                      <div>
                        <strong>Inicio:</strong> {new Date(oferta.fechaInicio).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="postulaciones" className="space-y-4">
          <div className="grid gap-4">
            {postulaciones.map((postulacion) => {
              const estudiante = getEstudiante(postulacion.estudianteId)
              const oferta = ofertas.find((o) => o.id === postulacion.ofertaId)

              return (
                <Card key={postulacion.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {estudiante?.nombre} {estudiante?.apellido}
                        </CardTitle>
                        <CardDescription>
                          {oferta?.titulo} • {estudiante?.carrera}
                        </CardDescription>
                      </div>
                      {getEstadoBadge(postulacion.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <strong>Carta de presentación:</strong>
                        <p className="text-sm text-gray-600 mt-1">{postulacion.cartaPresentacion}</p>
                      </div>
                      <div>
                        <strong>Fecha de postulación:</strong>{" "}
                        {new Date(postulacion.fechaPostulacion).toLocaleDateString()}
                      </div>
                      {postulacion.estado === "pendiente" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => gestionarPostulacion(postulacion.id, "aceptar")}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aceptar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => gestionarPostulacion(postulacion.id, "rechazar")}
                            className="flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="practicantes" className="space-y-4">
          <div className="grid gap-4">
            {practicas.map((practica) => {
              const estudiante = getEstudiante(practica.estudianteId)
              const oferta = ofertas.find((o) => o.id === practica.ofertaId)

              return (
                <Card key={practica.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {estudiante?.nombre} {estudiante?.apellido}
                        </CardTitle>
                        <CardDescription>
                          {oferta?.titulo} • {estudiante?.carrera}
                        </CardDescription>
                      </div>
                      {getEstadoBadge(practica.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Inicio:</strong> {new Date(practica.fechaInicio).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Fin:</strong> {new Date(practica.fechaFin).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Email:</strong> {estudiante?.email}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {estudiante?.telefono}
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
                <CardDescription>Asigna una tarea a un estudiante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo-tarea">Título de la Tarea</Label>
                  <Input
                    id="titulo-tarea"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                    placeholder="Ej: Análisis de requerimientos"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion-tarea">Descripción</Label>
                  <Textarea
                    id="descripcion-tarea"
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                    placeholder="Describe detalladamente la tarea..."
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

        <TabsContent value="empresas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Empresas</h3>
            <Button onClick={() => setMostrarFormularioEmpresa(!mostrarFormularioEmpresa)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Empresa
            </Button>
          </div>

          {mostrarFormularioEmpresa && (
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nueva Empresa</CardTitle>
                <CardDescription>Agrega una nueva empresa al sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre-empresa">Nombre de la Empresa</Label>
                    <Input
                      id="nombre-empresa"
                      value={nuevaEmpresa.nombre}
                      onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })}
                      placeholder="Ej: TechCorp S.A."
                    />
                  </div>
                  <div>
                    <Label htmlFor="ruc-empresa">RUC</Label>
                    <Input
                      id="ruc-empresa"
                      value={nuevaEmpresa.ruc}
                      onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, ruc: e.target.value })}
                      placeholder="20123456789"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion-empresa">Dirección</Label>
                  <Input
                    id="direccion-empresa"
                    value={nuevaEmpresa.direccion}
                    onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, direccion: e.target.value })}
                    placeholder="Av. Principal 123, Lima"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefono-empresa">Teléfono</Label>
                    <Input
                      id="telefono-empresa"
                      value={nuevaEmpresa.telefono}
                      onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, telefono: e.target.value })}
                      placeholder="01-234-5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-empresa">Email</Label>
                    <Input
                      id="email-empresa"
                      type="email"
                      value={nuevaEmpresa.email}
                      onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sector-empresa">Sector</Label>
                  <Select
                    value={nuevaEmpresa.sector}
                    onValueChange={(value) => setNuevaEmpresa({ ...nuevaEmpresa, sector: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="comercio">Comercio</SelectItem>
                      <SelectItem value="construccion">Construcción</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descripcion-empresa">Descripción</Label>
                  <Textarea
                    id="descripcion-empresa"
                    value={nuevaEmpresa.descripcion}
                    onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, descripcion: e.target.value })}
                    placeholder="Describe la empresa y sus actividades..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={crearEmpresa}>Registrar Empresa</Button>
                  <Button variant="outline" onClick={() => setMostrarFormularioEmpresa(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {empresas.map((empresa) => (
              <Card key={empresa.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{empresa.nombre}</CardTitle>
                      <CardDescription>
                        {empresa.sector} • RUC: {empresa.ruc}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Dirección:</strong> {empresa.direccion}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {empresa.telefono}
                      </div>
                      <div>
                        <strong>Email:</strong> {empresa.email}
                      </div>
                      <div>
                        <strong>Registrada:</strong> {new Date(empresa.fechaRegistro).toLocaleDateString()}
                      </div>
                    </div>
                    {empresa.descripcion && (
                      <div>
                        <strong>Descripción:</strong>
                        <p className="text-sm text-gray-600 mt-1">{empresa.descripcion}</p>
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
