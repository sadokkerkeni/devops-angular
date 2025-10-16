// src/app/core/services/location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';



// Interfaces pour ReturnLine (basées sur le Swagger/DTOs)
export interface ReturnLineReadDto {
  id: number;
  dateRetour: string; // Format ISO 8601
  quantite: string;
  usCode: string;
  articleId: number;
  articleCode :string;
  userId: number;
  userName :string;
  statusId: number;
}

export interface ReturnLineCreateDto {
  dateRetour: string; // Format ISO 8601 ou Date
  quantite: string;
  usCode: string;
  articleId: number;
  userId: number; // ID de l'utilisateur effectuant le retour
  statusId: number; // ID du statut initial (ex: EnAttente)
}

export interface ReturnLineUpdateDto {
  // Généralement, on met à jour peu de champs directement.
  // La logique métier gère souvent les transitions de statut.
  // Pour cet exemple, permettons la mise à jour de quelques champs.
  dateRetour?: string; // Optionnel pour la mise à jour
  quantite?: string;   // Optionnel
  usCode?: string;    // Optionnel
  articleId?: number;  // Optionnel
  userId?: number;    // Optionnel
  statusId?: number;  // Permet de changer le statut
}

@Injectable({
  providedIn: 'root'
})
export class ReturnService {


  private apiUrl = 'http://localhost:5288/api/ReturnLines'; // Ajustez le port si nécessaire

  constructor(private http: HttpClient) { }

  getAll(): Observable<ReturnLineReadDto[]> {
    // Charge toutes les ReturnLines
    return this.http.get<ReturnLineReadDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<ReturnLineReadDto> {
    return this.http.get<ReturnLineReadDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: ReturnLineCreateDto): Observable<ReturnLineReadDto> {
    return this.http.post<ReturnLineReadDto>(this.apiUrl, dto);
  }

  update(id: number, dto: ReturnLineUpdateDto): Observable<any> { // PUT souvent retourne 204 No Content
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Exemple : Mettre à jour le statut (alternatif à update)
  // setStatus(id: number, statusId: number): Observable<any> {
  //   const params = new HttpParams().set('statusId', statusId.toString());
  //   return this.http.put(`${this.apiUrl}/${id}/status`, {}, { params });
  // }


}
