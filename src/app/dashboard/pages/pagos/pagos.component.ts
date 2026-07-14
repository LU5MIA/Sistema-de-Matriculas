import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Pagos,
  PagosCreatePayload,
  PagosVista,
} from '../../../shared/interfaces/pagos.intreface';
import { PagosService } from '../../../core/services/pagos.service';
import { Padres } from '../../../shared/interfaces/padres.interface';
import { PadresService } from '../../../core/services/padres.service';
import {
  DetallePagoCreate,
  DetallesPago,
} from '../../../shared/interfaces/detalles-pago.interface';
import { catchError, forkJoin, of } from 'rxjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AlertaService } from '../../../core/services/alerta.service';

@Component({
  selector: 'app-pagos',
  standalone: false,
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css',
})
export class PagosComponent {
  constructor(
    private dialog: MatDialog,
    private pagosService: PagosService,
    private padresService: PadresService,
    private alertaService: AlertaService,
  ) {}

  cargando: boolean = false;

  // Variables para controlar los modales
  modoEdicion: boolean = false;
  modalAbierto: boolean = false;
  modalPagoEstudiante: boolean = false;
  seccionActiva: 'datos' | 'pago' = 'datos';
  conceptoSeleccionado: string = '';

  //cambiar cantidad de registros a mostrar
  cantidadRegistros: number = 10;

  // Referencias a los modales
  @ViewChild('modalPago') modalPago!: ElementRef;
  @ViewChild('modalPrincipal') modalPrincipal!: ElementRef;

  //Modal para mostrar los pagos
  pagos: Pagos[] = [];
  pagosVista: PagosVista[] = [];
  pagosVistaBase: PagosVista[] = [];

  filtroConcepto: string = 'todos';
  filtroAnio: string = 'todos';
  conceptos: string[] = [];
  anios: number[] = [];

  //detalles del pago
  detalles: DetallesPago[] = [];

  //detalle de pago actual para mostrar en el modal
  detalle_pago: DetallesPago = {
    detalle_id: 0,
    canal_pago: '',
    monto: '',
    fecha_pago: '',
    pagos_id: 0,
    padre_id: 0,

    //relaciones

    pago: {
      pagos_id: 0,
      concepto: '',
      meses: '',
      monto_total: 0,
      monto_pagado: '',
      estado: '',
      matricula: null,
    },

    pagador: {
      padre_id: 0,
      dni: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo_relacion: '',
      detalles_relacion: '',
      es_contacto_principal: false,
    },
  };

  nuevoDetalle: DetallePagoCreate = {
    canal_pago: '',
    monto: '',
  };

  //fila seleccionada para editar detalle
  detalleOriginal: DetallesPago | null = null;
  detalleEnEdicion: DetallesPago | null = null;
  indiceEdicion: number = -1;

  //busqueda general
  textoBusqueda: string = '';
  padres: Padres[] = [];

  //busqueda matricula
  codigoBusqueda: string = '';
  alumnoNombre: string = '';
  aulaNombre: string = '';
  incripcion: number = 0;
  mensualidad: number = 0;
  totalMatricula: number = 0; // aquí guardaremos el total real
  esMatricula: boolean = false;
  dividirMatricula: boolean = false;
  montoParte1: number = 0;
  montoParte2: number = 0;

  // Padres SOLO del alumno seleccionado
  padresAlumno: any[] = [];
  padresFiltrados: any[] = [];
  padreSeleccionado: any = null;
  textoResponsable: string = '';

  // Variable para mostrar u ocultar la lista de padres filtrados
  mostrarLista: boolean = false;

  //traer de la bd los meses
  meses = [
    { value: 'Enero', label: 'Enero' },
    { value: 'Febrero', label: 'Febrero' },
    { value: 'Marzo', label: 'Marzo' },
    { value: 'Abril', label: 'Abril' },
    { value: 'Mayo', label: 'Mayo' },
    { value: 'Junio', label: 'Junio' },
    { value: 'Julio', label: 'Julio' },
    { value: 'Agosto', label: 'Agosto' },
    { value: 'Septiembre', label: 'Septiembre' },
    { value: 'Octubre', label: 'Octubre' },
    { value: 'Noviembre', label: 'Noviembre' },
    { value: 'Diciembre', label: 'Diciembre' },
  ];

  //nuevo pago
  pago: Pagos = {
    pagos_id: 0,
    concepto: '',
    monto_total: 0,
    monto_pagado: '',
    estado: '',
    meses: '',
    matricula: null,
  };

  // Método para inicializar el componente y cargar los pagos y padres

  ngOnInit(): void {
    this.cargarPagos();
    // this.cargarPadresPorEstudiante();
  }

  aplicarFiltros(): void {
    let lista = [...this.pagosVistaBase];

    const texto = (this.textoBusqueda || '').toLowerCase().trim();

    if (texto) {
      lista = lista.filter((p) =>
        p.estudianteNombre.toLowerCase().includes(texto),
      );
    }
    if (this.filtroConcepto !== 'todos') {
      lista = lista.filter((p) => p.concepto === this.filtroConcepto);
    }
    if (this.filtroAnio !== 'todos') {
      lista = lista.filter((p) => {
        const anio = Number(p.codigoMatricula?.split('-')[1]);
        return anio === Number(this.filtroAnio);
      });
    }
    if (this.cantidadRegistros > 0) {
      lista = lista.slice(0, this.cantidadRegistros);
    }

    this.pagosVista = lista;
  }

  onFiltroConceptoChange(event: any) {
    this.filtroConcepto = event.target.value;
    this.aplicarFiltros();
  }

  onFiltroAnioChange(event: any) {
    this.filtroAnio = event.target.value;
    this.aplicarFiltros();
  }

  cambiarCantidad(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    this.cantidadRegistros = valor;
    this.aplicarFiltros();
  }

  // Método para cargar los pagos desde el servicio y preparar la vista

  cargarPagos(): void {
    this.pagosService.getPagos().subscribe((data) => {
      const vista: PagosVista[] = data.map((p) => {
        const codigo_matricula = p.matricula?.codigo_matricula ?? '';

        const nombres = p.matricula?.estudiante?.nombres ?? '';
        const apellidoP = p.matricula?.estudiante?.apellido_paterno ?? '';
        const apellidoM = p.matricula?.estudiante?.apellido_materno ?? '';

        return {
          ...p,
          detalles: p.detalles || [], // 👈 ASEGURA QUE SIEMPRE EXISTA
          codigoMatricula: codigo_matricula || 'Sin código',
          estudianteNombre: p.matricula?.estudiante
            ? `${nombres} ${apellidoP} ${apellidoM}`.trim()
            : 'Estudiante no asignado',
        };
      });

      this.pagosVistaBase = [...vista];

      this.conceptos = [
        ...new Set(vista.map((p) => p.concepto).filter((c) => c)),
      ];

      this.anios = [
        ...new Set(
          vista
            .map((m) => m.codigoMatricula?.split('-')[1])
            .filter((anio) => anio)
            .map((anio) => Number(anio)),
        ),
      ];

      console.log(vista);

      this.aplicarFiltros();
    });
  }

  pagoEstudiante(id: number) {
    this.modalPagoEstudiante = true;
    this.modalAbierto = false;
    this.cargarDetallePago(id);
  }

  cargarDetallePago(id: number) {
    forkJoin({
      pago: this.pagosService.getPagoById(id),
      detalles: this.pagosService
        .getDetallesPago(id)
        .pipe(catchError(() => of([]))),
    }).subscribe(({ pago, detalles }) => {
      this.pago = pago;
      this.detalles = detalles;

      this.nuevoDetalle = { canal_pago: '', monto: '' };
      this.onConceptoChange();

      this.textoResponsable = '';
      this.padreSeleccionado = null;

      const estudianteId = pago?.matricula?.estudiante?.estudiante_id;


      if (estudianteId) {
        this.padresService
          .getPadresByEstudiante(estudianteId)
          .subscribe((resp: any[]) => {

            this.padresAlumno = resp;
            this.padresFiltrados = resp;
          });
      } else {
        this.padresAlumno = [];
        this.padresFiltrados = [];
      }
    });
  }

  NuevoPago() {
    this.modalPagoEstudiante = false;
    this.modalAbierto = true;
  }

  realizarPago() {
    if (!this.pago.pagos_id) {
      this.alertaService.mostrar('No se ha cargado un pago válido', 'error');
      return;
    }

    const nuevos = this.detalles.filter(
      (d) => !d.detalle_id || d.detalle_id === 0,
    );

    if (nuevos.length === 0) {
      this.alertaService.mostrar('Debe agregar un detalle', 'info');
      return;
    }

    nuevos.forEach((det) => {
      const payload = {
        pagos_id: this.pago.pagos_id,
        padre_id: det.padre_id,
        monto: det.monto,
        canal_pago: det.canal_pago,
      };

      this.pagosService.addDetalle(this.pago.pagos_id, payload).subscribe({
        next: () => {
          this.cargarPagos();
        },
      });
    });

    this.modalPagoEstudiante = false;

    this.mostrarMensajeSimple('Pago registrado correctamente', 'success');
  }

  // Método para filtrar pagos por nombre del estudiante

  filtrarPagos(): void {
    this.aplicarFiltros();
  }

  // Método para buscar matrícula por código

  buscarMatriculaPorCodigo() {
    const codigo = String(this.codigoBusqueda || '').trim();

    this.pagosService.getMatriculaByCodigo(codigo).subscribe({
      next: (response: any) => {
        console.log('Respuesta matrícula:', response);
        this.pago.matricula = response;

        this.alumnoNombre = response.estudiante || '';
        this.aulaNombre = response.aulaNombre || '';

        this.padresAlumno = response.padres || [];
        this.padresFiltrados = this.padresAlumno;
        this.textoResponsable = '';
        this.padreSeleccionado = null;

        this.incripcion = response.inscripcion || 0;
        this.mensualidad = response.mensualidad || 0;
        this.totalMatricula = response.matricula || 0;

        this.alertaService.mostrar(
          'Matrícula encontrada correctamente',
          'success',
        );
        console.log(this.padresAlumno);
      },

      error: (err) => {
        console.error('Error al buscar matrícula:', err);

        this.alumnoNombre = '';
        this.aulaNombre = '';
        this.textoResponsable = '';
        this.incripcion = 0;
        this.mensualidad = 0;
        this.totalMatricula = 0;
        this.pago.matricula = null;

        this.alertaService.mostrar(
          'Código de matrícula no encontrado',
          'error',
        );
      },
    });
  }

  evitarEspacios(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  limpiarEspacios() {
    if (this.codigoBusqueda) {
      this.codigoBusqueda = this.codigoBusqueda.replace(/\s/g, '');
    }
  }

  guardarPagoCompleto() {
    if (!this.pago.matricula?.matricula_id) {
      this.alertaService.mostrar(
        'Debe seleccionar una matrícula válida',
        'error',
      );
      return;
    }

    if (!this.detalle_pago.padre_id) {
      this.alertaService.mostrar(
        'Debe seleccionar un responsable de pago',
        'error',
      );
      return;
    }

    if (!this.pago.concepto) {
      this.alertaService.mostrar('Debe seleccionar un concepto', 'error');
      return;
    }

    const pagoExistente = this.pagos.find(
      (p) =>
        p.concepto?.trim().toLowerCase() ===
          this.pago.concepto?.trim().toLowerCase() &&
        p.matricula?.matricula_id === this.pago.matricula?.matricula_id,
    );

    this.pagos.forEach((p) => {
      console.log(
        'Comparando -> concepto:',
        p.concepto,
        'matricula:',
        p.matricula?.matricula_id,
      );
    });

    console.log('Pago encontrado:', pagoExistente);

    if (this.pago.concepto === 'Inscripción' && pagoExistente) {
      this.alertaService.mostrar(
        'La inscripción ya fue registrada para este estudiante',
        'error',
      );
      return;
    }

    if (this.pago.concepto === 'Matrícula' && pagoExistente) {
      const añoActual = new Date().getFullYear();

      const yaPagoEsteAño = pagoExistente.detalles?.some(
        (d) => new Date(d.fecha_pago).getFullYear() === añoActual,
      );

      if (yaPagoEsteAño) {
        this.alertaService.mostrar(
          'La matrícula ya fue pagada este año',
          'error',
        );
        return;
      }
    }

    if (this.pago.concepto === 'Mensualidad' && !this.pago.meses) {
      this.alertaService.mostrar(
        'Debe seleccionar el mes correspondiente',
        'error',
      );
      return;
    }

    if (
      this.pago.concepto === 'Mensualidad' &&
      this.detalle_pago.monto !== this.pago.monto_total.toString()
    ) {
      this.alertaService.mostrar(
        'La mensualidad debe pagarse completa.',
        'error',
      );
      return;
    }

    if (!this.detalle_pago.canal_pago) {
      this.alertaService.mostrar('Debe seleccionar un canal de pago', 'error');
      return;
    }

    if (!this.detalle_pago.monto || Number(this.detalle_pago.monto) <= 0) {
      this.alertaService.mostrar('El monto debe ser mayor a 0', 'error');
      return;
    }

    const montoActual = Number(this.detalle_pago.monto);
    const total = Number(this.pago.monto_total);
    const yaPagado = Number(this.pago.monto_pagado || 0);

    if (montoActual + yaPagado > total) {
      this.alertaService.mostrar('El monto excede el total pendiente', 'error');
      return;
    }

    if (pagoExistente) {
      const payloadDetalle = {
        pagos_id: pagoExistente.pagos_id,
        padre_id: this.detalle_pago.padre_id,
        monto: montoActual.toString(),
        canal_pago: this.detalle_pago.canal_pago,
      };

      this.pagosService
        .addDetalle(pagoExistente.pagos_id, payloadDetalle)
        .subscribe({
          next: () => {
            this.cargarPagos();
            this.resetFormulario();
            this.modalAbierto = false;
          },
          error: (err) => {
            console.error(err);
            this.alertaService.mostrar(
              'Error al registrar el detalle',
              'error',
            );
          },
        });

      return;
    }

    const payloadPago = {
      matricula_id: this.pago.matricula.matricula_id,
      concepto: this.pago.concepto,
      monto_total: total,
      monto_pagado: montoActual,
      meses: this.pago.concepto === 'Mensualidad' ? this.pago.meses : undefined,
    };

    this.pagosService.addPago(payloadPago).subscribe({
      next: (pagoCreado) => {
        const payloadDetalle = {
          pagos_id: pagoCreado.pagos_id,
          padre_id: this.detalle_pago.padre_id,
          monto: montoActual.toString(),
          canal_pago: this.detalle_pago.canal_pago,
        };

        this.pagosService
          .addDetalle(pagoCreado.pagos_id, payloadDetalle)
          .subscribe({
            next: () => {
              this.mostrarMensajeSimple(
                'Pago registrado correctamente',
                'success',
              );
              this.cargarPagos();
              this.resetFormulario();
              this.modalAbierto = false;
            },
            error: (err) => {
              console.error(err);
              this.alertaService.mostrar(
                'Error al registrar el detalle',
                'error',
              );
            },
          });
      },
      error: (err) => {
        console.error(err);

        const mensaje = err?.error?.message || 'Error al crear el pago';
        this.alertaService.mostrar(mensaje, 'error');
      },
    });
  }

  get pagoCompleto(): boolean {
    const total = Number(this.pago.monto_total || 0);
    const pagado = Number(this.pago.monto_pagado || 0);
    return pagado >= total && total > 0;
  }

  agregarDetalle() {
    if (!this.padreSeleccionado) {
      this.alertaService.mostrar('Seleccione un responsable de pago', 'info');
      return;
    }

    if (!this.nuevoDetalle.canal_pago) {
      this.alertaService.mostrar('Seleccione un canal de pago', 'info');
      return;
    }

    this.formatearMonto(this.nuevoDetalle);
    if (!this.validarMonto()) return;

    const montoIngresado = this.nuevoDetalle.monto.toString();

    if (this.detalleEnEdicion) {
      const indice = this.indiceEdicion;
      const original = this.detalles[indice];

      const haCambiado =
        original.monto !== montoIngresado ||
        original.canal_pago !== this.nuevoDetalle.canal_pago ||
        original.pagador.padre_id !== this.padreSeleccionado.padre_id;

      if (!haCambiado) {
        this.alertaService.mostrar(
          'No se detectaron cambios para actualizar',
          'info',
        );
        this.finalizarEdicion();
        return;
      }

      const detalleActualizado: DetallesPago = {
        ...original,
        padre_id: this.padreSeleccionado.padre_id,
        pagador: this.padreSeleccionado,
        monto: montoIngresado,
        canal_pago: this.nuevoDetalle.canal_pago,
      };

      if (detalleActualizado.detalle_id > 0) {
        this.pagosService
          .updateDetalle(detalleActualizado.detalle_id, {
            monto: detalleActualizado.monto,
            canal_pago: detalleActualizado.canal_pago,
            padre_id: detalleActualizado.padre_id,
          })
          .subscribe({
            next: (resp) => {
              this.detalles[indice] = { ...resp };
              this.alertaService.mostrar(
                'Detalle actualizado correctamente',
                'success',
              );
              this.finalizarEdicion();
            },
            error: (err) => {
              console.error(err);
              this.alertaService.mostrar('Error al actualizar', 'info');
            },
          });
      } else {
        this.detalles[indice] = { ...detalleActualizado };
        this.finalizarEdicion();
      }
    } else {
      // ➕ AGREGAR
      const detalle: DetallesPago = {
        detalle_id: 0,
        pagos_id: this.pago.pagos_id,
        padre_id: this.padreSeleccionado.padre_id,
        canal_pago: this.nuevoDetalle.canal_pago,
        monto: montoIngresado,
        fecha_pago: new Date().toISOString(),
        pago: this.pago,
        pagador: this.padreSeleccionado,
      };

      this.detalles.push(detalle);
      this.finalizarEdicion();
    }
  }

  validarMonto(): boolean {
    let monto = Number(this.nuevoDetalle.monto);
    const restante = this.calcularSaldoRestante();

    if (isNaN(monto) || monto <= 0) {
      this.alertaService.mostrar('Ingrese un monto válido', 'info');
      return false;
    }

    if (monto > restante) {
      this.alertaService.mostrar(
        `Solo puedes pagar hasta ${restante.toFixed(2)}`,
        'info',
      );
      return false;
    }

    return true;
  }

  calcularSaldoRestante(): number {
    const total = Number(this.pago.monto_total || 0);
    const pagado = this.obtenerMontoPagado();

    return total - pagado;
  }

  obtenerMontoPagado(): number {
    let pagado = Number(this.pago.monto_pagado || 0);

    if (this.detalleEnEdicion) {
      const montoAnterior = Number(this.detalleEnEdicion.monto || 0);
      pagado -= montoAnterior;
    }

    return pagado;
  }

  obtenerClaseVencimiento(fecha?: string): string {
    if (!fecha) return 'sin-vencimiento';

    const hoy = new Date();

    const vencimiento = new Date(fecha);

    // quitar horas
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);

    const diferenciaDias = Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diferenciaDias < 0) {
      return 'vencido';
    }

    if (diferenciaDias <= 3) {
      return 'proximo';
    }

    return 'normal';
  }

  finalizarEdicion() {
    this.detalleEnEdicion = null;
    this.indiceEdicion = -1;
    this.textoResponsable = '';
    this.padreSeleccionado = null;
    this.nuevoDetalle = { canal_pago: '', monto: '' };
  }

  seleccionarDetalle(detalle: DetallesPago, index: number) {
    if (this.indiceEdicion === index) {
      return;
    }

    this.indiceEdicion = index;
    this.detalleEnEdicion = JSON.parse(JSON.stringify(detalle));
    this.padreSeleccionado = detalle.pagador;
    this.textoResponsable = `${detalle.pagador.nombres} ${detalle.pagador.apellido_paterno}`;
    this.nuevoDetalle = {
      monto: detalle.monto.toString(),
      canal_pago: detalle.canal_pago,
    };
  }

  getMontoPagado(detalles: any[]): number {
    return detalles.reduce((sum, d) => sum + (Number(d.monto) || 0), 0);
  }

  eliminarDetalle(id: number, index: number) {
    const montoEliminado = this.detalles[index].monto;

    if (confirm('¿Seguro que deseas eliminar este detalle?')) {
      this.pagosService.deleteDetalle(id).subscribe(() => {
        this.detalles = this.detalles.filter((d) => d.detalle_id !== id);
        this.cargarPagos();
      });
    }
  }

  filtrarPadres() {
    const texto = (this.textoResponsable || '').toLowerCase().trim();

    if (!texto) {
      this.padresFiltrados = [];
      this.mostrarLista = false;
      return;
    }

    this.padresFiltrados = (this.padresAlumno || []).filter((p) =>
      (p.nombre_completo || '').toLowerCase().includes(texto),
    );

    this.mostrarLista = this.padresFiltrados.length > 0;
  }

  cargarPadresPorEstudiante(estudiante_id: number): void {
    this.padresService
      .getPadresByEstudiante(estudiante_id)
      .subscribe((resp: any) => {
        this.padresAlumno = resp;
        this.padresFiltrados = resp;
      });
  }

  onSeleccionarMatricula(matricula: any) {
    const estudiante_id = matricula.estudiante.estudiante_id;

    this.cargarPadresPorEstudiante(estudiante_id);
  }

  seleccionarPadre(padre: any) {
    this.padreSeleccionado = padre;
    this.textoResponsable = padre.nombre_completo;
    this.detalle_pago.padre_id = padre.padre_id;
    this.padresFiltrados = [];
    this.mostrarLista = false;
  }

  onConceptoChange() {
    this.esMatricula = false;
    this.dividirMatricula = false;

    // 🔥 limpiar primero
    this.nuevoDetalle.monto = '';

    // SOLO mensualidad
    if (this.pago.concepto === 'Mensualidad') {
      const total = Number(this.pago.monto_total || 0);

      this.nuevoDetalle.monto = total.toFixed(2);
    }

    // Solo lógica visual
    if (this.pago.concepto === 'Matrícula') {
      this.esMatricula = true;
    }
  }

  formatearMonto(obj: any) {
    if (!obj.monto) return;

    let monto = Number(obj.monto);

    if (isNaN(monto)) {
      monto = 0;
    }

    obj.monto = monto.toFixed(2);
  }

  resetFormulario() {
    this.pago = {
      pagos_id: 0,
      concepto: '',
      monto_total: 0,
      monto_pagado: '',
      estado: '',
      meses: '',
      matricula: null,
    };

    this.detalle_pago = {
      detalle_id: 0,
      canal_pago: '',
      monto: '',
      fecha_pago: '',
      pagos_id: 0,
      padre_id: 0,

      pago: {
        pagos_id: 0,
        concepto: '',
        meses: '',
        monto_total: 0,
        monto_pagado: '',
        estado: '',
        matricula: null,
      },

      pagador: {
        padre_id: 0,
        dni: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        email: '',
        direccion: '',
        tipo_relacion: '',
        detalles_relacion: '',
        es_contacto_principal: false,
      },
    };
    // 🔥 ESTA PARTE ERA CLAVE (ANTES solo limpiabas propiedades)
    this.nuevoDetalle = {
      canal_pago: '',
      monto: '',
    };

    this.codigoBusqueda = '';
    this.alumnoNombre = '';
    this.aulaNombre = '';
    this.incripcion = 0;
    this.mensualidad = 0;
    this.totalMatricula = 0;
    this.seccionActiva = 'datos';

    this.textoResponsable = '';
    this.padreSeleccionado = null;

    this.detalleEnEdicion = null;
    this.indiceEdicion = -1;
  }

  /* ALERTA SIMPLE */
  mensajeSimple: string = '';
  tipoMensajeSimple: 'success' | 'error' = 'success';

  /* ALERTA MODERNA */
  mensajeModal: string = '';
  tipoMensajeModal: 'success' | 'error' | 'info' = 'success';

  mostrarModal: boolean = false;

  ocultando = false;

  mostrarMensajeSimple(texto: string, tipo: 'success' | 'error') {
    this.mensajeSimple = texto;
    this.tipoMensajeSimple = tipo;

    setTimeout(() => {
      this.mensajeSimple = '';
    }, 3000);
  }

  cerrarAlertaSimple() {
    this.mensajeSimple = '';
  }

  imprimirReciboDesdePago(pago: PagosVista) {
    this.pagosService.getDetallesPago(pago.pagos_id).subscribe({
      next: (detalles) => {
        if (!detalles || detalles.length === 0) {
          this.alertaService.mostrar('No hay detalles para este pago', 'info');
          return;
        }

        const detalle = detalles[0];
        this.imprimirReciboPDF(detalle);
      },

      error: (err) => {
        if (err.status === 404) {
          this.alertaService.mostrar('No se puede generar el recibo', 'info');
        } else {
          console.error(err);
        }
      },
    });
  }

  async imprimirReciboPDF(detalle: DetallesPago) {
    const existingPdfBytes = await fetch('assets/BOLETA DE PAGO.pdf').then(
      (res) => res.arrayBuffer(),
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const nombre =
      `${detalle.pagador.nombres} ${detalle.pagador.apellido_materno}  ${detalle.pagador.apellido_paterno}`.toUpperCase();
    const montoNumero = Number(detalle.monto);
    const montoTexto = this.numeroALetras(montoNumero);
    const concepto = detalle.pago.concepto.toUpperCase(); 
    const fecha = new Date(detalle.fecha_pago);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = fecha.toLocaleString('es-PE', { month: 'long' }).toUpperCase();
    const canal_pago = detalle.canal_pago.toUpperCase(); 
    const numeroRecibo = this.generarNumeroRecibo(detalle.detalle_id);

    const colorAzul = rgb(0, 0, 0);
    let marcarEfectivo = '';
    let marcarDeposito = '';
    let marcarOtros = '';
    let detalleOtros = '';

    if (canal_pago === 'EFECTIVO') {
      marcarEfectivo = 'X';
    } else if (['BCP', 'BBVA'].includes(canal_pago)) {
      marcarDeposito = 'X';
    } else if (['YAPE', 'PLIN', 'TUNKI'].includes(canal_pago)) {
      marcarOtros = 'X';
      detalleOtros = canal_pago;
    }

    const data = {
      nombre,
      montoTexto,
      monto: detalle.monto,
      concepto,
      dia,
      mes,
      marcarEfectivo,
      marcarDeposito,
      marcarOtros,
      detalleOtros,
      numeroRecibo,
      font,
      color: colorAzul,
    };

    const dataAbajo = {
      nombre: '',
      montoTexto,
      monto: detalle.monto,
      concepto,
      dia,
      mes,
      marcarEfectivo,
      marcarDeposito,
      marcarOtros,
      detalleOtros,
      numeroRecibo,
      font,
      color: colorAzul,
    };

    this.dibujarRecibo(page, data, -165);
    this.dibujarRecibo(page, dataAbajo, 170);

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    window.open(url);
  }

  generarNumeroRecibo(numero: number): string {
    return `${numero.toString().padStart(5, '0')}`;
  }

  numeroALetras(monto: number): string {
    const unidades = [
      '',
      'UNO',
      'DOS',
      'TRES',
      'CUATRO',
      'CINCO',
      'SEIS',
      'SIETE',
      'OCHO',
      'NUEVE',
      'DIEZ',
      'ONCE',
      'DOCE',
      'TRECE',
      'CATORCE',
      'QUINCE',
    ];

    const decenas = [
      '',
      '',
      'VEINTE',
      'TREINTA',
      'CUARENTA',
      'CINCUENTA',
      'SESENTA',
      'SETENTA',
      'OCHENTA',
      'NOVENTA',
    ];

    const centenas = [
      '',
      'CIENTO',
      'DOSCIENTOS',
      'TRESCIENTOS',
      'CUATROCIENTOS',
      'QUINIENTOS',
      'SEISCIENTOS',
      'SETECIENTOS',
      'OCHOCIENTOS',
      'NOVECIENTOS',
    ];

    const entero = Math.floor(monto);
    const decimal = Math.round((monto - entero) * 100);

    let letras = '';

    if (entero === 100) {
      letras = 'CIEN';
    } else {
      if (entero > 99) {
        letras += centenas[Math.floor(entero / 100)] + ' ';
      }

      const resto = entero % 100;

      if (resto <= 15) {
        letras += unidades[resto];
      } else if (resto < 20) {
        letras += 'DIECI' + unidades[resto - 10];
      } else if (resto === 20) {
        letras += 'VEINTE';
      } else if (resto < 30) {
        letras += 'VEINTI' + unidades[resto - 20];
      } else {
        letras += decenas[Math.floor(resto / 10)];
        if (resto % 10 !== 0) {
          letras += ' Y ' + unidades[resto % 10];
        }
      }
    }

    return `${letras.trim().toUpperCase()} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
  }

  dibujarRecibo(page: any, data: any, offsetY = 0) {
    const {
      nombre,
      montoTexto,
      monto,
      concepto,
      dia,
      mes,
      marcarEfectivo,
      marcarDeposito,
      marcarOtros,
      detalleOtros,
      numeroRecibo,
      font,
      color,
    } = data;

    // 👇 Detecta si es el de abajo (no tiene nombre)
    const ajusteExtra = nombre ? 0 : 40; // ajusta 20–40 según veas

    // NOMBRE
    if (nombre) {
      page.drawText(nombre, {
        x: 200,
        y: 490 - offsetY,
        size: 10,
        font,
        color,
      });
    }

    // MONTO EN LETRAS
    page.drawText(montoTexto, {
      x: 200,
      y: 460 - offsetY,
      size: 10,
      font,
      color,
    });

    // MONTO EN NÚMERO 👇 (AQUÍ APLICAMOS AJUSTE)
    page.drawText(`S/ ${monto}`, {
      x: 485,
      y: 530 - offsetY - ajusteExtra,
      size: 10,
      font,
      color,
    });

    // CONCEPTO
    page.drawText(concepto, {
      x: 200,
      y: 430 - offsetY,
      size: 10,
      font,
      color,
    });

    // FECHA
    page.drawText(dia, {
      x: 160,
      y: 380 - offsetY,
      size: 10,
      font,
      color,
    });

    page.drawText(mes, {
      x: 240,
      y: 380 - offsetY,
      size: 10,
      font,
      color,
    });

    // CHECKS
    page.drawText(marcarEfectivo, {
      x: 175,
      y: 335 - offsetY,
      size: 12,
      font,
      color,
    });

    page.drawText(marcarDeposito, {
      x: 175,
      y: 315 - offsetY,
      size: 12,
      font,
      color,
    });

    page.drawText(marcarOtros, {
      x: 175,
      y: 295 - offsetY,
      size: 12,
      font,
      color,
    });

    // DETALLE
    page.drawText(detalleOtros, {
      x: 320,
      y: 300 - offsetY,
      size: 10,
      font,
      color,
    });

    // NÚMERO DE RECIBO 👇 (AQUÍ TAMBIÉN)
    page.drawText(numeroRecibo, {
      x: 490,
      y: 555 - offsetY - ajusteExtra,
      size: 10,
      font,
      color,
    });
  }

  cerrarModal(element: HTMLElement, tipo: 'pago' | 'principal') {
    element.classList.add('salir');

    setTimeout(() => {
      if (tipo === 'pago') {
        this.modalPagoEstudiante = false;
      } else {
        this.modalAbierto = false;
      }
      this.resetFormulario();
    }, 250);
  }

  eliminarPago(pagoId: number) {
    if (confirm('¿Eliminar este pago?')) {
      this.pagosService.deletePago(pagoId).subscribe(() => {
        this.cargarPagos();
      });
    }
  }
}
