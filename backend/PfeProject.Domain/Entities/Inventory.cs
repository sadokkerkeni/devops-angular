using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Inventory
    {
        public int Id { get; set; } // Id_inventaire
        public string Name { get; set; } // Nom_inventaire
        
        // Changed from string Status to StatusId
        public int StatusId { get; set; } 
        public Status Status { get; set; }
        
        public DateTime DateInventaire { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true; // ✅ Soft delete

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public int? ModifiedBy { get; set; }

        // 🔁 Lignes scannées (détails)
        public ICollection<DetailInventory> DetailInventories { get; set; } = new HashSet<DetailInventory>();
    }
}
