using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Sap
    {
        public int Id { get; set; } // Id_SAP

        public string Article { get; set; } // Article_S
        public string UsCode { get; set; } // US_S
        public int Quantite { get; set; } // Qte_S  
        public bool IsActive { get; set; } = true;

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // 🔁 Lié à DetailInventory
        public ICollection<DetailInventory> DetailInventories { get; set; } = new HashSet<DetailInventory>();

        /// colelction mta3 articles 
        //public ICollection<Article> Articles { get; set; } = new HashSet<Article>();

    }
}
