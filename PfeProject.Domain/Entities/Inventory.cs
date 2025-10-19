using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Inventory
    {
        public int Id { get; set; } // Id_inventaire
        public string Name { get; set; } // Nom_inventaire
        public string Status { get; set; } // Statut : EnCours, Cloturé...
        public DateTime DateInventaire { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true; // ✅ Soft delete

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // 🔁 Lignes scannées (détails)
        public ICollection<DetailInventory> DetailInventories { get; set; } = new HashSet<DetailInventory>();
    }
}
