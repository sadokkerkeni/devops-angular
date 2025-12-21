using PfeProject.Domain.Entities;

public class Location
{
    public int Id { get; set; } // Id_emplacement
    public string Code { get; set; } // Code_emplacement
    public string Description { get; set; }
    public bool IsActive { get; set; } = true;

    // 🔗 Lien avec le Magasin (Warehouse)
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; }

    // 🏢 Company relationship
    public int CompanyId { get; set; }
    public virtual Company Company { get; set; }

    // 🗺️ Geographic coordinates
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // 🔁 Relations
    public ICollection<DetailInventory> DetailInventories { get; set; } = new HashSet<DetailInventory>();
}