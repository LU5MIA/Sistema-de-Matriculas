import { Roles } from "./roles.interface";

export interface Usuarios {
  user_id: number;
  username: string;
  password: string;
  estado: string;
  rol: Roles | null;
}

export interface UsuariosCreate {
  username: string;
  password: string;
  rol_id: number;
}