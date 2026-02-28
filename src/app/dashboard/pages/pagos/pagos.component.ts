import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Pagos, PagosCreatePayload, PagosVista } from '../../../shared/interfaces/pagos.intreface';
import { PagosService } from '../../../core/services/pagos.service';
import { Padres } from '../../../shared/interfaces/padres.interface';
import { PadresService } from '../../../core/services/padres.service';
import { DetallesPago } from '../../../shared/interfaces/detalles-pago.interface';

@Component({
  selector: 'app-pagos',
  standalone: false,
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent {
  constructor(
    private dialog: MatDialog,
    private pagosService: PagosService,
    private padresService: PadresService
  ) { }

  // Variables para controlar los modales
  modalAbierto: boolean = false;
  modalPagoEstudiante: boolean = false;
  seccionActiva: 'datos' | 'pago' = 'datos';
  conceptoSeleccionado: string = '';

  // Referencias a los modales
  @ViewChild('modalPago') modalPago!: ElementRef;
  @ViewChild('modalPrincipal') modalPrincipal!: ElementRef;

  //Modal para mostrar los pagos
  pagos: Pagos[] = [];
  pagosVista: PagosVista[] = [];
  pagosVistaBase: PagosVista[] = [];

  //detalles del pago
  detalles: DetallesPago[] = [];

  //detalle de pago actual para mostrar en el modal
  detalle_pago: DetallesPago = {
    detalle_id: 0,
    canal_pago: '',
    monto: '',
    fecha_pago: '',
    pagos_id: 0,
    padre_id: 0
  };


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
    { value: 'Diciembre', label: 'Diciembre' }
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
  }

  // Método para inicializar el componente y cargar los pagos y padres

  ngOnInit(): void {
    this.cargarPagos();
    this.cargarPadres();
  }

  // Método para cargar los pagos desde el servicio y preparar la vista

  cargarPagos(): void {
    this.pagosService.getPagos().subscribe(data => {

      const vista = data.map(p => {

        const codigo_matricula = p.matricula?.codigo_matricula ?? '';

        const nombres = p.matricula?.estudiante?.nombres ?? '';
        const apellidoP = p.matricula?.estudiante?.apellido_paterno ?? '';
        const apellidoM = p.matricula?.estudiante?.apellido_materno ?? '';

        return {
          ...p,
          codigoMatricula: codigo_matricula || 'Sin código',
          estudianteNombre: p.matricula?.estudiante
            ? `${nombres} ${apellidoP} ${apellidoM}`.trim()
            : 'Estudiante no asignado'
        };
      });

      this.pagosVistaBase = [...vista];
      this.pagosVista = [...vista];
    });
  }

  // Método para cargar los padres desde el servicio

  cargarPadres(): void {
    this.padresService.getPadres().subscribe((resp: any) => {
      this.padres = resp.data;
      this.padresFiltrados = resp.data;

    });
  }

  // Método para filtrar pagos por nombre del estudiante

  filtrarPagos(): void {

    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      this.pagosVista = [...this.pagosVistaBase];
      return;
    }

    this.pagosVista = this.pagosVistaBase.filter(p =>
      p.estudianteNombre.toLowerCase().includes(texto)
    );
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

        alert('✅ Matrícula encontrada correctamente');
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

        alert('❌ Código de matrícula no encontrado');
      }
    });
  }

  // Método para filtrar padres por nombre dentro del modal de pago

  filtrarPadres() {
    const texto = this.textoResponsable.toLowerCase().trim();

    if (!texto) {
      this.detalle_pago.padre_id = 0;
    }

    this.padresFiltrados = this.padresAlumno.filter(p =>
      p.nombre_completo.toLowerCase().includes(texto)
    );

    this.mostrarLista = true;

  }


  seleccionarPadre(padre: any) {
    this.padreSeleccionado = padre;
    this.textoResponsable = padre.nombre_completo;
    this.detalle_pago.padre_id = padre.padre_id;
    this.padresFiltrados = [];
    this.mostrarLista = false;
  }

  onConceptoChange() {

    this.pago.monto_total = 0;
    this.esMatricula = false;
    this.dividirMatricula = false;
    this.montoParte1 = 0;
    this.montoParte2 = 0;

    // Limpiar monto pagado
    this.detalle_pago.monto = '0';

    if (this.pago.concepto === 'Inscripción') {
      this.pago.monto_total = this.incripcion;
    }

    if (this.pago.concepto === 'Mensualidad') {
      this.pago.monto_total = this.mensualidad;

      // 🔥 NO se permite pago parcial
      this.detalle_pago.monto = this.mensualidad.toString();
    }

    if (this.pago.concepto === 'Matrícula') {
      this.esMatricula = true;
      this.pago.monto_total = this.totalMatricula;
    }
  }

  calcularSegundaParte() {

    if (this.montoParte1 > this.totalMatricula) {
      this.montoParte1 = this.totalMatricula;
    }

    this.montoParte2 = this.totalMatricula - this.montoParte1;
  }

  formatearMonto() {
    if (this.detalle_pago.monto !== null && this.detalle_pago.monto !== undefined && this.detalle_pago.monto !== '') {
      this.detalle_pago.monto = Number(this.detalle_pago.monto).toFixed(2);
    }
  }

  guardarPagoCompleto() {

    // 🔴 VALIDACIONES

    if (!this.pago.matricula?.matricula_id) {
      alert('Debe seleccionar una matrícula válida');
      return;
    }

    if (!this.detalle_pago.padre_id) {
      alert('Debe seleccionar un responsable de pago');
      return;
    }

    if (!this.pago.concepto) {
      alert('Debe seleccionar un concepto');
      return;
    }

    if (this.pago.concepto === 'Mensualidad' && !this.pago.meses) {
      alert('Debe seleccionar el mes correspondiente');
      return;
    }

    if (this.pago.concepto === 'Mensualidad' &&
      this.detalle_pago.monto !== this.pago.monto_total.toString()) {

      alert("La mensualidad debe pagarse completa.");
      return;
    }

    if (!this.detalle_pago.canal_pago) {
      alert('Debe seleccionar un canal de pago');
      return;
    }

    if (!this.detalle_pago.monto || Number(this.detalle_pago.monto) <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    // if (this.pago.concepto === 'Mensualidad' && !this.pago.meses) {
    //   alert('Debe seleccionar el mes correspondiente');
    //   return;
    // }

    const montoActual = Number(this.detalle_pago.monto);
    const total = Number(this.pago.monto_total);
    const yaPagado = Number(this.pago.monto_pagado || 0);

    if (montoActual + yaPagado > total) {
      alert('El monto excede el total pendiente');
      return;
    }


    // 1️⃣ Crear el pago (deuda)
    const payloadPago: PagosCreatePayload = {
      matricula_id: this.pago.matricula.matricula_id, // 👈 AQUÍ está la clave
      concepto: this.pago.concepto,
      monto_total: Number(this.pago.monto_total),
      meses: this.pago.concepto === 'Mensualidad'
        ? this.pago.meses
        : undefined
    };
    console.log('Payload que envío:', payloadPago);

    this.pagosService.addPago(payloadPago).subscribe({

      next: (pagoCreado) => {

        // 2️⃣ Crear el detalle
        const payloadDetalle = {
          pagos_id: Number(pagoCreado.pagos_id),
          padre_id: this.detalle_pago.padre_id,
          monto: this.detalle_pago.monto,
          canal_pago: this.detalle_pago.canal_pago
        };

        this.pagosService.addDetalle(pagoCreado.pagos_id, payloadDetalle)
          .subscribe({

            next: () => {

              alert('✅ Pago registrado correctamente');

              this.cargarPagos(); // refrescar tabla
              this.resetFormulario();
              this.modalAbierto = false;

            },

            error: (err) => {
              console.error('Error al crear detalle:', err);
              alert('Error al registrar el detalle');
            }
          });
      },

      error: (err) => {
        console.error('Error al crear pago:', err);
        alert('Error al crear el pago');
      }

    });
  }

  resetFormulario() {
    this.pago = {
      pagos_id: 0,
      concepto: '',
      monto_total: 0,
      monto_pagado: '',
      estado: '',
      meses: '',
      matricula: null
    };

    this.detalle_pago = {
      detalle_id: 0,
      canal_pago: '',
      monto: '',
      fecha_pago: '',
      pagos_id: 0,
      padre_id: 0
    };

    this.textoResponsable = '';
    this.padreSeleccionado = null;
  }

  descargarRecibo(url: string) {
    window.open(url, '_blank');
  }

  pagoEstudiante() {
    this.modalPagoEstudiante = true;
    this.modalAbierto = false;
  }

  RealizarPago() {
    this.modalPagoEstudiante = false;
    this.modalAbierto = true;
  }

  cerrarModal(element: HTMLElement, tipo: 'pago' | 'principal') {
    element.classList.add('salir');

    setTimeout(() => {
      if (tipo === 'pago') this.modalPagoEstudiante = false;
      else this.modalAbierto = false;
    }, 250); // tiempo que la animación dura
  }

  // rolesSeleccionados: string[] = [];
  // mostrarDropdown = false;

  // toggleDropdown() {
  //   this.mostrarDropdown = !this.mostrarDropdown;
  // }

  // onRoleChange(event: any) {
  //   const value = event.target.value;

  //   if (event.target.checked) {
  //     this.rolesSeleccionados.push(value);
  //   } else {
  //     this.rolesSeleccionados =
  //       this.rolesSeleccionados.filter(r => r !== value);
  //   }
  // }


  // confirmarEliminarPago() {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirmación',
  //       message: '¿Está seguro de eliminar este pago?',
  //       icon: 'fa-solid fa-triangle-exclamation',
  //       confirmText: 'Eliminar',
  //       cancelText: 'Cancelar'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.eliminarEstudiante();
  //     }
  //   });
  // }

  // eliminarEstudiante() {
  //   console.log('Estudiante eliminado');
  // }

}
