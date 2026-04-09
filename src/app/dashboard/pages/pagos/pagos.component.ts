import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Pagos, PagosCreatePayload, PagosVista } from '../../../shared/interfaces/pagos.intreface';
import { PagosService } from '../../../core/services/pagos.service';
import { Padres } from '../../../shared/interfaces/padres.interface';
import { PadresService } from '../../../core/services/padres.service';
import { DetallePagoCreate, DetallesPago } from '../../../shared/interfaces/detalles-pago.interface';
import { forkJoin } from 'rxjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
      matricula: null
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
      es_contacto_principal: false
    }
  };

  nuevoDetalle: DetallePagoCreate = {
    canal_pago: '',
    monto: ''
  };

  //fila seleccionada para editar detalle
  detalleOriginal: DetallesPago | null = null;
  detalleEnEdicion: DetallesPago | null = null
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


  aplicarFiltros(): void {
    let lista = [...this.pagosVistaBase];

    // filtro por búsqueda (opcional, si quieres combinar)
    const texto = (this.textoBusqueda || '').toLowerCase().trim();

    if (texto) {
      lista = lista.filter(p =>
        p.estudianteNombre.toLowerCase().includes(texto)
      );
    }

    // 🔥 AQUÍ ENTRA TU SELECT
    if (this.cantidadRegistros > 0) {
      lista = lista.slice(0, this.cantidadRegistros);
    }

    this.pagosVista = lista;
  }

  cambiarCantidad(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    this.cantidadRegistros = valor;
    this.aplicarFiltros();
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
      this.aplicarFiltros(); // 👈 usa el filtro
    });
  }

  cargarDetallePago(id: number) {

    this.pagosService.getDetallesPago(id).subscribe(resp => {

      this.detalles = resp;

      if (resp.length > 0) {

        this.detalle_pago = resp[0];
        this.pago = resp[0].pago;

        // limpia los campos
        this.nuevoDetalle = { canal_pago: '', monto: '' };
        this.textoResponsable = '';
        this.padreSeleccionado = null;

        // obtener estudiante
        const estudianteId = resp[0]?.pago?.matricula?.estudiante?.estudiante_id;

        if (estudianteId) {

          this.padresService.getPadresByEstudiante(estudianteId)
            .subscribe((padres: any[]) => {

              this.padresAlumno = padres;
              this.padresFiltrados = padres;

            });

        } else {

          this.padresAlumno = [];
          this.padresFiltrados = [];

        }

      }

    });
  }

  realizarPago() {

    if (!this.pago.pagos_id) {
      alert('No hay pago seleccionado');
      return;
    }

    const nuevos = this.detalles.filter(d => !d.detalle_id || d.detalle_id === 0);

    // 🔥 VALIDACIÓN CORRECTA
    if (nuevos.length === 0) {
      alert('Debe agregar al menos un detalle nuevo');
      return;
    }

    nuevos.forEach(det => {

      const payload = {
        pagos_id: this.pago.pagos_id,
        padre_id: det.padre_id,
        monto: det.monto,
        canal_pago: det.canal_pago
      };

      this.pagosService.addDetalle(this.pago.pagos_id, payload).subscribe({
        next: () => {
          this.cargarPagos();
        }
      });

    });

    this.modalPagoEstudiante = false;

    alert('✅ Pago registrado correctamente');
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

    // 👉 Buscar si ya existe un pago de este concepto para este alumno
    const pagoExistente = this.pagos.find(p =>
      p.concepto?.trim().toLowerCase() === this.pago.concepto?.trim().toLowerCase() &&
      p.matricula?.matricula_id === this.pago.matricula?.matricula_id
    );

    // ===============================
    // 🔴 VALIDACIONES IMPORTANTES
    // ===============================

    // ✅ INSCRIPCIÓN (solo una vez)

    console.log('Concepto actual:', this.pago.concepto);
    console.log('Pagos:', this.pagos);
    // 🔍 DEBUG AQUÍ
    console.log('Concepto actual:', this.pago.concepto);
    console.log('Matrícula actual:', this.pago.matricula?.matricula_id);
    console.log('Lista de pagos:', this.pagos);

    this.pagos.forEach(p => {
      console.log('Comparando -> concepto:', p.concepto, 'matricula:', p.matricula?.matricula_id);
    });

    console.log('Pago encontrado:', pagoExistente);

    if (this.pago.concepto === 'Inscripción' && pagoExistente) {
      alert('La inscripción ya fue registrada para este estudiante');
      return;
    }

    // ✅ MATRÍCULA (una vez por año)
    if (this.pago.concepto === 'Matrícula' && pagoExistente) {

      const añoActual = new Date().getFullYear();

      const yaPagoEsteAño = pagoExistente.detalles?.some(d =>
        new Date(d.fecha_pago).getFullYear() === añoActual
      );

      if (yaPagoEsteAño) {
        alert('La matrícula ya fue pagada este año');
        return;
      }
    }

    // ✅ MENSUALIDAD
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

    const montoActual = Number(this.detalle_pago.monto);
    const total = Number(this.pago.monto_total);
    const yaPagado = Number(this.pago.monto_pagado || 0);

    if (montoActual + yaPagado > total) {
      alert('El monto excede el total pendiente');
      return;
    }

    // ===============================
    // 🟢 SI YA EXISTE → SOLO DETALLE
    // ===============================
    if (pagoExistente) {

      const payloadDetalle = {
        pagos_id: pagoExistente.pagos_id,
        padre_id: this.detalle_pago.padre_id,
        monto: montoActual.toString(),
        canal_pago: this.detalle_pago.canal_pago
      };

      this.pagosService.addDetalle(pagoExistente.pagos_id, payloadDetalle)
        .subscribe({
          next: () => {
            alert('✅ Pago agregado al registro existente');
            this.cargarPagos();
            this.resetFormulario();
            this.modalAbierto = false;
          },
          error: (err) => {
            console.error(err);
            alert('Error al registrar el detalle');
          }
        });

      return;
    }

    // ===============================
    // 🔵 SI NO EXISTE → CREAR PAGO
    // ===============================
    const payloadPago = {
      matricula_id: this.pago.matricula.matricula_id,
      concepto: this.pago.concepto,
      monto_total: total,
      monto_pagado: montoActual,
      meses: this.pago.concepto === 'Mensualidad'
        ? this.pago.meses
        : undefined
    };

    this.pagosService.addPago(payloadPago).subscribe({
      next: (pagoCreado) => {

        const payloadDetalle = {
          pagos_id: pagoCreado.pagos_id,
          padre_id: this.detalle_pago.padre_id,
          monto: montoActual.toString(),
          canal_pago: this.detalle_pago.canal_pago
        };

        this.pagosService.addDetalle(pagoCreado.pagos_id, payloadDetalle)
          .subscribe({
            next: () => {
              alert('✅ Pago registrado correctamente');
              this.cargarPagos();
              this.resetFormulario();
              this.modalAbierto = false;
            },
            error: (err) => {
              console.error(err);
              alert('Error al registrar el detalle');
            }
          });
      },
      error: (err) => {
        console.error(err);

        const mensaje = err?.error?.message || 'Error al crear el pago';
        alert(mensaje);
      }
    });
  }

  get pagoCompleto(): boolean {
    const total = Number(this.pago.monto_total || 0);
    const pagado = Number(this.pago.monto_pagado || 0);
    return pagado >= total && total > 0;
  }

  agregarDetalle() {

    // ✅ FORMATO Y VALIDACIÓN
    this.formatearMonto(this.nuevoDetalle);
    if (!this.validarMonto()) return;

    // ✅ CAMPOS OBLIGATORIOS
    if (!this.padreSeleccionado || !this.nuevoDetalle.canal_pago) {
      alert("Complete todos los campos");
      return;
    }

    const montoIngresado = this.nuevoDetalle.monto.toString();

    // 🔄 EDICIÓN
    if (this.detalleEnEdicion) {
      const indice = this.indiceEdicion;
      const original = this.detalles[indice];

      const haCambiado =
        original.monto !== montoIngresado ||
        original.canal_pago !== this.nuevoDetalle.canal_pago ||
        original.pagador.padre_id !== this.padreSeleccionado.padre_id;

      if (!haCambiado) {
        alert("No se detectaron cambios para actualizar");
        this.finalizarEdicion();
        return;
      }

      const detalleActualizado: DetallesPago = {
        ...original,
        padre_id: this.padreSeleccionado.padre_id,
        pagador: this.padreSeleccionado,
        monto: montoIngresado,
        canal_pago: this.nuevoDetalle.canal_pago,
        // fecha_pago: new Date().toISOString(),
      };

      if (detalleActualizado.detalle_id > 0) {
        this.pagosService.updateDetalle(detalleActualizado.detalle_id, {
          monto: detalleActualizado.monto,
          canal_pago: detalleActualizado.canal_pago,
          padre_id: detalleActualizado.padre_id,
          // fecha_pago: detalleActualizado.fecha_pago
        }).subscribe({
          next: (resp) => {
            this.detalles[indice] = { ...resp };
            alert('✅ Detalle actualizado correctamente');
            this.finalizarEdicion();
          },
          error: (err) => {
            console.error(err);
            alert('❌ Error al actualizar');
          }
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
        pagador: this.padreSeleccionado
      };

      this.detalles.push(detalle);
      this.finalizarEdicion();
    }
  }

  validarMonto(): boolean {
    let monto = Number(this.nuevoDetalle.monto);
    const restante = this.calcularSaldoRestante();

    if (isNaN(monto) || monto <= 0) {
      alert('Ingrese un monto válido');
      return false;
    }

    if (monto > restante) {
      alert(`Solo puedes pagar hasta ${restante.toFixed(2)}`);
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

  finalizarEdicion() {
    this.detalleEnEdicion = null;
    this.indiceEdicion = -1;
    this.textoResponsable = '';
    this.padreSeleccionado = null;
    this.nuevoDetalle = { canal_pago: '', monto: '' };
  }

  seleccionarDetalle(detalle: DetallesPago, index: number) {
    if (this.indiceEdicion === index) {
      // this.finalizarEdicion();
      return;
    }

    this.indiceEdicion = index;
    // Creamos una copia para que el formulario no modifique la tabla "en vivo"
    this.detalleEnEdicion = JSON.parse(JSON.stringify(detalle));

    this.padreSeleccionado = detalle.pagador;
    this.textoResponsable = `${detalle.pagador.nombres} ${detalle.pagador.apellido_paterno}`;

    // Sincronizamos el formulario
    this.nuevoDetalle = {
      monto: detalle.monto.toString(),
      canal_pago: detalle.canal_pago
    };
  }

  getMontoPagado(detalles: any[]): number {
    return detalles.reduce((sum, d) => sum + (Number(d.monto) || 0), 0);
  }


  eliminarDetalle(id: number, index: number) {
    // ... validaciones previas ...

    const montoEliminado = this.detalles[index].monto;

    if (confirm('¿Seguro que deseas eliminar este detalle?')) {
      this.pagosService.deleteDetalle(id).subscribe(() => {
        this.detalles = this.detalles.filter(d => d.detalle_id !== id);
        this.cargarPagos(); // 🔥 sincroniza con backend
      });
    }
  }

  // Método para filtrar padres por nombre dentro del modal de pago

  filtrarPadres() {
    const texto = this.textoResponsable.toLowerCase().trim();


    if (!texto) {
      this.mostrarLista = false;
      return;
    }

    this.padresFiltrados = this.padresAlumno.filter(p =>
      p.nombre_completo.toLowerCase().includes(texto)
    );

    this.mostrarLista = true;

  }

  // Método para cargar los padres desde el servicio

  cargarPadres(): void {
    this.padresService.getPadres().subscribe((resp: any) => {
      this.padres = resp.data;
      this.padresFiltrados = resp.data;

    });
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

    this.detalle_pago.monto = '0';

    if (this.pago.concepto === 'Inscripción') {
      this.pago.monto_total = this.incripcion;
    }

    if (this.pago.concepto === 'Mensualidad') {
      this.pago.monto_total = this.mensualidad;

      this.detalle_pago.monto = this.mensualidad.toString();
    }

    if (this.pago.concepto === 'Matrícula') {
      this.esMatricula = true;
      this.pago.monto_total = this.totalMatricula;
    }
  }

  // calcularSegundaParte() {

  //   if (this.montoParte1 > this.totalMatricula) {
  //     this.montoParte1 = this.totalMatricula;
  //   }

  //   this.montoParte2 = this.totalMatricula - this.montoParte1;
  // }

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
      matricula: null
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
        matricula: null
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
        es_contacto_principal: false
      }

    };
    // 🔥 ESTA PARTE ERA CLAVE (ANTES solo limpiabas propiedades)
    this.nuevoDetalle = {
      canal_pago: '',
      monto: ''
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

    // 🔥 MUY IMPORTANTE: regresar a la primera pestaña
    // this.tabActual = 'datos'; // 👈 cambia según como controles tus tabs
  }

  imprimirReciboDesdePago(pago: PagosVista) {

    this.pagosService.getDetallesPago(pago.pagos_id).subscribe(detalles => {

      if (!detalles || detalles.length === 0) {
        alert('No hay detalles para este pago');
        return;
      }

      // 🔥 puedes elegir cuál imprimir
      const detalle = detalles[0]; // o el último, o todos

      this.imprimirReciboPDF(detalle);
    });
  }

  async imprimirReciboPDF(detalle: DetallesPago) {

    const existingPdfBytes = await fetch('assets/HOSANNA RECIBO.pdf')
      .then(res => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // DATOS
    const nombre = `${detalle.pagador.nombres} ${detalle.pagador.apellido_materno}  ${detalle.pagador.apellido_paterno}`.toUpperCase();
    const montoNumero = Number(detalle.monto);
    const montoTexto = this.numeroALetras(montoNumero);
    const concepto = detalle.pago.concepto.toUpperCase(); // o concepto real
    const fecha = new Date(detalle.fecha_pago);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = fecha.toLocaleString('es-PE', { month: 'long' }).toUpperCase();
    const canal_pago = detalle.canal_pago.toUpperCase(); // ej: "EFECTIVO"
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

    // RECIBI DE:
    page.drawText(nombre, {
      x: 200,
      y: 490,
      size: 10,
      font,
      color: colorAzul,
    });

    // LA CANTIDAD DE:
    page.drawText(`${montoTexto}`, {
      x: 200,
      y: 460,
      size: 10,
      font,
      color: colorAzul,
    });

    // EL MONTO DE:
    page.drawText(`S/ ${detalle.monto}`, {
      x: 485,
      y: 530,
      size: 10,
      font,
      color: colorAzul,
    });

    // POR CONCEPTO DE:
    page.drawText(concepto, {
      x: 200,
      y: 430,
      size: 10,
      font,
      color: colorAzul,
    });

    // Día
    page.drawText(dia.toString(), {
      x: 160,
      y: 380,
      size: 10,
      font,
      color: colorAzul,
    });

    // Mes
    page.drawText(mes, {
      x: 240, //más a la derecha
      y: 380,
      size: 10,
      font,
      color: colorAzul,
    });

    //Efectivo
    page.drawText(marcarEfectivo, {
      x: 175, // ajusta según tu recibo
      y: 335,
      size: 12,
      font,
      color: colorAzul,
    });

    // Depósito
    page.drawText(marcarDeposito, {
      x: 175,
      y: 315,
      size: 12,
      font,
      color: colorAzul,
    });

    // Otros
    page.drawText(marcarOtros, {
      x: 175,
      y: 295,
      size: 12,
      font,
      color: colorAzul,
    });

    // Detalle para otros (YAPE, PLIN, etc)

    page.drawText(detalleOtros, {
      x: 320,
      y: 300,
      size: 10,
      font,
      color: colorAzul,
    });

    // Número de recibo
    page.drawText(numeroRecibo, {
      x: 490,
      y: 555,
      size: 10,
      font,
      color: colorAzul,

    });

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
      '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO',
      'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
      'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE'
    ];

    const decenas = [
      '', '', 'VEINTE', 'TREINTA', 'CUARENTA',
      'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
    ];

    const centenas = [
      '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS',
      'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS',
      'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
    ];

    const entero = Math.floor(monto);
    const decimal = Math.round((monto - entero) * 100);

    let letras = '';

    if (entero === 100) return 'CIEN';

    if (entero > 99) {
      letras += centenas[Math.floor(entero / 100)] + ' ';
    }

    const resto = entero % 100;

    if (resto <= 15) {
      letras += unidades[resto];
    } else if (resto < 20) {
      letras += 'DIECI' + unidades[resto - 10].toLowerCase();
    } else if (resto === 20) {
      letras += 'VEINTE';
    } else if (resto < 30) {
      letras += 'VEINTI' + unidades[resto - 20].toLowerCase();
    } else {
      letras += decenas[Math.floor(resto / 10)];
      if (resto % 10 !== 0) {
        letras += ' Y ' + unidades[resto % 10];
      }
    }

    return `${letras.toUpperCase()} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
  }


  pagoEstudiante(id: number) {
    this.modalPagoEstudiante = true;
    this.modalAbierto = false;
    this.cargarDetallePago(id);
  }

  NuevoPago() {
    this.modalPagoEstudiante = false;
    this.modalAbierto = true;
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
