import { Component } from '@angular/core';
import { UsuariosService } from '../../../core/services/usuarios.service';
import {
  Usuarios,
  UsuariosCreate,
} from '../../../shared/interfaces/usuarios.interface';
import { Roles } from '../../../shared/interfaces/roles.interface';
import { RolesService } from '../../../core/services/roles.service';
import { AlertaService } from '../../../core/services/alerta.service';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private alertaService: AlertaService,
  ) {}

  usuarios: Usuarios[] = [];
  roles: Roles[] = [];
  cargando: boolean = false;
  modoEditar: boolean = false;
  modalAbierto: boolean = false;
  textoBusqueda: string = '';
  cantidadRegistros: number = 10;
  usuarioOriginal: Usuarios | null = null;

  usuario: Usuarios = {
    user_id: 0,
    username: '',
    password: '',
    estado: 'Activo',
    rol: null,
  };

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe((data) => {
      console.log('Usuarios obtenidos:', data);
      this.usuarios = data;
    });
  }

  cargarRoles(): void {
    this.rolesService.getRoles().subscribe((data) => {
      console.log('Roles obtenidos:', data);
      this.roles = data;
    });
  }

  get usuariosFiltrados(): Usuarios[] {
    const filtrados = this.usuarios.filter((usuario) =>
      usuario.username.toLowerCase().includes(this.textoBusqueda.toLowerCase()),
    );

    if (this.cantidadRegistros === 0) {
      return filtrados;
    }

    return filtrados.slice(0, this.cantidadRegistros);
  }

  addUsuario(): void {
    const nuevoUsuario: UsuariosCreate = {
      username: this.usuario.username.trim(),
      password: this.usuario.password.trim(),
      rol_id: this.usuario.rol?.rol_id || 0,
    };

    console.log(this.usuario.rol);

    if (!nuevoUsuario.username || !nuevoUsuario.password) {
      this.alertaService.mostrar(
        'Por favor, complete todos los campos.',
        'info',
      );
      return;
    }

    if (
      this.usuarios.some(
        (u) => u.username.toLowerCase() === nuevoUsuario.username.toLowerCase(),
      )
    ) {
      this.alertaService.mostrar('El nombre de usuario ya existe.', 'info');
      return;
    }

    this.usuariosService.addUsuario(nuevoUsuario).subscribe({
      next: (response) => {
        console.log('Usuario agregado:', response);
        this.cargarUsuarios();
        this.cerrarModal();
        this.mostrarMensajeSimple('Usuario agregado correctamente', 'success');
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  updateUsuario(): void {
    const nombreUsuario = this.usuario.username.trim();
    const password = this.usuario.password.trim();
    const rolId = this.usuario.rol?.rol_id || 0;

    if (!nombreUsuario) {
      this.alertaService.mostrar(
        'El nombre de usuario no puede estar vacío.',
        'info',
      );
      return;
    }

    if (rolId === 0) {
      this.alertaService.mostrar(
        'Debe seleccionar un rol para el usuario.',
        'info',
      );
      return;
    }

    // Validar username repetido excepto el usuario actual
    if (
      this.usuarios.some(
        (u) =>
          u.username.toLowerCase() === nombreUsuario.toLowerCase() &&
          u.user_id !== this.usuario.user_id,
      )
    ) {
      this.alertaService.mostrar('El nombre de usuario ya existe.', 'info');
      return;
    }

    const mismoNombre = nombreUsuario === this.usuarioOriginal?.username;

    const mismoRol = rolId === this.usuarioOriginal?.rol?.rol_id;

    const sinPassword = !password;

    if (mismoNombre && mismoRol && sinPassword) {
      this.alertaService.mostrar('No se realizaron cambios.', 'info');
      return;
    }

    const usuarioActualizado: any = {
      username: nombreUsuario,
      rol_id: rolId,
    };

    // Solo actualizar contraseña si se escribió una nueva
    if (password) {
      usuarioActualizado.password = password;
    }

    this.usuariosService
      .updateUsuario(this.usuario.user_id, usuarioActualizado)
      .subscribe({
        next: (response) => {
          console.log('Usuario actualizado:', response);

          this.cargarUsuarios();

          this.cerrarModal();

          this.mostrarMensajeSimple(
            'Usuario actualizado correctamente',
            'success',
          );
        },

        error: (error) => {
          console.error('Error al actualizar usuario:', error);
        },
      });
  }

  mostrarConfirmacionEstado = false;

  usuarioSeleccionado!: Usuarios;

  nuevoEstado!: string;

  cambiarEstado(usuario: Usuarios) {
    this.usuarioSeleccionado = usuario;

    this.nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';

    this.mostrarConfirmacionEstado = true;
  }

  confirmarCambioEstado() {
    this.usuariosService
      .cambiarEstado(this.usuarioSeleccionado.user_id, this.nuevoEstado)
      .subscribe({
        next: () => {
          this.usuarioSeleccionado.estado = this.nuevoEstado;

          this.mostrarConfirmacionEstado = false;

          this.alertaService.mostrar(
            `Usuario ${
              this.nuevoEstado === 'Activo' ? 'activado' : 'desactivado'
            } correctamente`,
            'success',
          );
        },

        error: () => {
          this.alertaService.mostrar('Error al cambiar estado', 'error');
        },
      });
  }

  cancelarCambioEstado() {
    this.mostrarConfirmacionEstado = false;
  }

  guardar(): void {
    if (this.modoEditar) {
      this.updateUsuario();
    } else {
      this.addUsuario();
    }
  }

  abrirAgregar(): void {
    this.usuario = {
      user_id: 0,
      username: '',
      password: '',
      estado: 'Activo',
      rol: null,
    };

    this.usuarioOriginal = { ...this.usuario };
    this.modoEditar = false;
    this.modalAbierto = true;
  }

  abrirEditar(usuario: Usuarios): void {
    const rolEncontrado =
      this.roles.find((r) => r.rol_id === usuario.rol?.rol_id) || null;

    this.usuario = {
      user_id: usuario.user_id,
      username: usuario.username,
      password: '',
      estado: usuario.estado,
      rol: rolEncontrado,
    };

    this.usuarioOriginal = { ...this.usuario };
    this.modoEditar = true;
    this.modalAbierto = true;
  }

  /* ALERTA SIMPLE */
  mensajeSimple: string = '';
  tipoMensajeSimple: 'success' | 'error' = 'success';

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

  cerrarModal() {
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.classList.add('salir');
      setTimeout(() => {
        this.modalAbierto = false;
      }, 250);
    }
  }
}
