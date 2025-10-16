// src/app/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = `http://localhost:5288/api/Inventories`; // Use environment variable for API URL

  constructor(private http: HttpClient) { }

getInventories(isActive: boolean | null): Observable<any[]> {
  let params = new HttpParams();

  if (isActive !== null && isActive !== undefined) {
    params = params.set('isActive', isActive.toString());
  }

  return this.http.get<any[]>(this.baseUrl, { params });
}


  // GET /api/Inventories/{id}
  getInventoryById(id: number): Observable<any> { // Using any for simplicity
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<any>(url);
  }

  // POST /api/Inventories
  createInventory(inventory: any): Observable<any> { // Accept any object matching the API's expected structure
    return this.http.post<any>(this.baseUrl, inventory);
  }

  // PUT /api/Inventories/{id}
  updateInventory(id: number, updateDto: any): Observable<any> {
    // Construire l'URL. Important: respecter la casse 'Inventories' (I majuscule)
    // comme définie dans [Route("api/[controller]")] du contrôleur ASP.NET.
    const url = `${this.baseUrl}/${id}`;
    console.log(`[InventoryService] Envoi de la requête PUT ${url}`, updateDto);
    
    // Envoyer la requête PUT avec le DTO dans le corps.
    // Le backend s'attend à recevoir un JSON correspondant à InventoryUpdateDto.
    return this.http.put(url, updateDto);
    // Backend:
    // - En cas de succès: retourne 204 No Content.
    // - En cas d'échec (entité non trouvée, etc.): retourne un code d'erreur (404, 400, 500).
  }

  // PUT /api/Inventories/{id}/set-active?value=true/false
  setActive(id: number, value: boolean): Observable<any> {
    const url = `${this.baseUrl}/${id}/set-active`;
    let params = new HttpParams();
    params = params.append('value', value.toString());
    return this.http.put(url, null, { params }); // PUT body is often empty for toggles
  }
  getDetailInventoriesByInventoryId(inventoryId: number, isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    // Assurez-vous que l'URL correspond à votre contrôleur : api/DetailInventories/by-inventory/{inventoryId}
    // Notez la majuscule 'D' dans 'DetailInventories' pour correspondre à [Route("api/[controller]")]
    return this.http.get<any[]>(`http://localhost:5288/api/DetailInventories/by-inventory/${inventoryId}`, { params });
  }
  createDetailInventory(createDto: any): Observable<any> {
    // Construire l'URL. Important: respecter la casse 'DetailInventories' (D et I majuscules)
    // comme définie dans [Route("api/[controller]")] du contrôleur DetailInventoriesController.
    const url = `http://localhost:5288/api/DetailInventories`;
    
    // Envoyer la requête POST avec le DTO dans le corps.
    // Le backend s'attend à recevoir un JSON correspondant à DetailInventoryCreateDto.
    return this.http.post(url, createDto);
    // Backend:
    // - En cas de succès: retourne 200 OK avec le DetailInventoryReadDto créé.
    // - En cas d'échec (données invalides, contraintes de base de données): retourne un code d'erreur (400, 409, 500).
  }

   getLocations(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    // Assurez-vous que l'URL correspond à votre contrôleur [Route("api/[controller]")]
    const url = `http://localhost:5288/api/Locations`;
    console.log(`[InventoryService] GET ${url} avec isActive=${isActive}`);
    return this.http.get<any[]>(url, { params });
  }

    getSaps(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    const url = `http://localhost:5288/api/Sap`;
    console.log(`[InventoryService] GET ${url} avec isActive=${isActive}`);
    return this.http.get<any[]>(url, { params });
  }

  
}
