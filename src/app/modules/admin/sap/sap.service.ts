import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SapService {
  private apiUrl = 'http://localhost:5288/api/Sap'; // Base URL de votre API Sap

  constructor(private http: HttpClient) {}

  // Read all SAP entries (combining active and inactive)
  getAll(): Observable<any[]> {
    // Convert the Promise-based approach to an Observable
    return from(
      Promise.all([
        this.http.get<any[]>(`${this.apiUrl}?isActive=true`).toPromise(),
        this.http.get<any[]>(`${this.apiUrl}?isActive=false`).toPromise()
      ]).then(([activeSaps, inactiveSaps]) => {
        // Combine active and inactive SAP entries into a single array
        return [...(activeSaps || []), ...(inactiveSaps || [])];
      }).catch(error => {
        console.error('[SapService] Erreur lors du chargement de tous les SAPs:', error);
        throw error; // Propagate error to the Observable
      })
    );
  }

  // GET: /api/Sap?isActive=true
  getActive(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // GET: /api/Sap/{id}
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create a new SAP entry
  create(sap: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, sap);
  }

  // PUT: /api/Sap/{id}
  update(id: number, updateDto: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`[SapService] Envoi de la requête PUT ${url}`, updateDto);
    return this.http.put(url, updateDto);
    // Backend:
    // - En cas de succès: retourne 204 No Content.
    // - En cas d'échec (entité non trouvée, etc.): retourne un code d'erreur (404, 400, 500).
  }

  // --- NOUVELLE MÉTHODE : Add Stock ---
  /**
   * Ajoute du stock à un enregistrement SAP existant.
   * @param addStockDto Un objet contenant les données pour ajouter du stock.
   *   Correspond à SapAddStockDto côté backend.
   *   Exemple : { usCode: 'US123', quantite: 5 }
   * @returns Un Observable qui émet une réponse vide (NoContent) en cas de succès,
   *          ou une erreur HTTP (par exemple, 404 Not Found).
   * 
   * Correspond à: POST /api/Sap/add-stock
   */
  addStock(addStockDto: any): Observable<any> {
    // Construire l'URL. Important: respecter la casse 'Sap' (S majuscule)
    // comme définie dans [Route("api/[controller]")] du contrôleur ASP.NET Core SapController.
    const url = `${this.apiUrl}/add-stock`;
    console.log(`[SapService] Envoi de la requête POST ${url}`, addStockDto);
    
    // Envoyer la requête POST avec le DTO dans le corps.
    // Le backend s'attend à recevoir un JSON correspondant à SapAddStockDto.
    return this.http.post(url, addStockDto);
    // Backend:
    // - En cas de succès: retourne 204 No Content.
    // - En cas d'échec (SAP non trouvé, données invalides): retourne un code d'erreur (404, 400, 500).
  }
  // --- FIN DE LA NOUVELLE MÉTHODE ---

  // Delete an SAP entry
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // PUT: /api/Sap/{id}/set-active?value=true
  setactive(id: number, active: boolean): Observable<any> {
    const params = new HttpParams().set('value', active.toString());
    return this.http.put<void>(`${this.apiUrl}/${id}/set-active`, {}, { params });
  }
   
}