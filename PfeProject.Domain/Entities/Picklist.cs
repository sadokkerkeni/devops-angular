
using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Picklist
    {
        public int Id { get; set; } // Id_pickliste

        public string Name { get; set; } // Nom_pickliste
        public string Type { get; set; } // Type_pickliste
        public string Quantity { get; set; } // Qte_pickliste

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Date_creation
        public DateTime? ModifiedAt { get; set; } // Date_modification
        public bool IsActive { get; set; } = true;

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // 🔗 Ligne de production
        public int LineId { get; set; }
        public Line Line { get; set; }

        // 🔗 Magasin
        public int WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; }

        // 🔗 Statut
        public int StatusId { get; set; }
        public Status Status { get; set; }

        // 🔗 Détails
        public ICollection<DetailPicklist> Details { get; set; } = new HashSet<DetailPicklist>();
    }
}
