
using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Picklist
    {
        public int Id { get; set; } // Id_pickliste

        public string Name { get; set; } // Nom_pickliste
        public string Type { get; set; } // Type_pickliste
        public int Quantity { get; set; } // Qte_pickliste (changed to int)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Date_creation
        public int? CreatedBy { get; set; } // User who created
        public DateTime? ModifiedAt { get; set; } // Date_modification
        public int? ModifiedBy { get; set; } // User who modified
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
