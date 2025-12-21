using PfeProject.Domain.Entities;

public class Warehouse
{
    public int Id { get; set; } // Id_magasin
    public string Name { get; set; } // Nom_magasin
    public string Description { get; set; } // Description_magasin
    public string? Email { get; set; } // Email du magasin
    public string? Address { get; set; } // Adresse/emplacement du magasin
    public string? PhoneNumber { get; set; } // Numéro de téléphone portable
    public string? FixedPhone { get; set; } // Numéro de téléphone fixe
    
    // 📍 Coordonnées GPS pour OpenStreetMap
    public double? Latitude { get; set; } // Latitude GPS
    public double? Longitude { get; set; } // Longitude GPS
    
    public bool IsActive { get; set; } = true;

    // 🏢 Company relationship
    public int CompanyId { get; set; }
    public virtual Company Company { get; set; }

    // 🔗 Relations
    public ICollection<Location> Locations { get; set; } = new HashSet<Location>();
    public ICollection<Picklist> Picklists { get; set; } = new HashSet<Picklist>();
}
