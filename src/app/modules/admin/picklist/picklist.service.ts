import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PicklistService {

  
  private apiUrl = 'http://localhost:5288/api/Picklists';

  constructor(private http: HttpClient) {}

  // ✅ Get all picklists, optionally filtered by active status
  getPicklists(isActive: boolean = true): Observable<any[]> {
    const params = new HttpParams().set('isActive', isActive.toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // ✅ Get picklist by ID
  getPicklistById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Create new picklist
  createPicklist(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // ✅ Update existing picklist
  updatePicklist(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // ✅ Set active/inactive status
  setActiveStatus(id: number, value: boolean): Observable<any> {
    const params = new HttpParams().set('value', value.toString());
    return this.http.put(`${this.apiUrl}/${id}/set-active`, null, { params });
  }

  // ✅ Transitions
  markReady(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ready`, {});
  }
  startShipping(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ship`, {});
  }
  complete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/complete`, {});
  }
  

   getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/Warehouses`);
  }
   getlines(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/Lines`);
  }
   getstatus(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/Status`);
  }
   loadDetailPicklists(id:number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/detailpicklists/by-picklist/${id}`);
  }
  

    checkInventoryAvailability(details: any[]): Observable<{ detailPicklistId: number, isAvailable: boolean, availableQuantity: number, requestedQuantity: number, codeProduit: string }[]> {
    return this.http.post<any[]>(`http://localhost:5288/api/detailpicklists/check-availability`, details);
  }

  updatePicklistStatus(id:number,data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { data });
  }

  // GET: /api/MovementTraces?isActive=true
  getAll(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    return this.http.get<any[]>(`http://localhost:5288/api/MovementTraces`, { params });
  }

  // GET: /api/MovementTraces/{id}
  getById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:5288/api/MovementTraces/${id}`);
  }

getArticles(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:5288/api/Articles?isActive=true');
}

  // POST: /api/MovementTraces
  createMovementTrace(dto: any): Observable<any> { // Utilise 'any' pour le DTO
    return this.http.post<any>(`http://localhost:5288/api/MovementTraces`, dto);
  }

  // PUT: /api/MovementTraces/{id}/set-active?value=true
  setActiveStatusMovment(id: number, value: boolean): Observable<any> {
    let params = new HttpParams();
    params = params.append('value', value.toString());
    return this.http.put(`http://localhost:5288/api/MovementTraces/${id}/set-active`, null, { params }); // PUT body is often empty for toggles
  }


   createDetailPicklist(createDto: any): Observable<any> {
    // Construire l'URL. Important: respecter la casse 'DetailPicklists' (D et P majuscules)
    // comme définie dans [Route("api/[controller]")] du contrôleur ASP.NET Core DetailPicklistsController.
    const url = `http://localhost:5288/api/DetailPicklists`;
    console.log(`[PicklistService] Envoi de la requête POST ${url}`, createDto);
    
    // Envoyer la requête POST avec le DTO dans le corps.
    // Le backend s'attend à recevoir un JSON correspondant à DetailPicklistCreateDto.
    return this.http.post<any>(url, createDto);
    // Backend:
    // - En cas de succès: retourne 201 Created avec le DetailPicklistReadDto créé.
    // - En cas d'échec (données invalides, Picklist/Article/Status non trouvé): retourne un code d'erreur (400, 404, 409, 500).
  }
}
