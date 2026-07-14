import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  private alertSubject = new Subject<any>();

  alert$ = this.alertSubject.asObservable();

  mostrar(mensaje: string, tipo: string) {
    this.alertSubject.next({
      mensaje,
      tipo
    });
  }
}
