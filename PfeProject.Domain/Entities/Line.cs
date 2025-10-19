using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Line
    {
        public int Id { get; set; } // Id_ligne
        public string Description { get; set; } // Description_ligne
        public bool IsActive { get; set; } = true;

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // 🔁 Relation : une ligne peut avoir plusieurs picklistes
        public ICollection<Picklist> Picklists { get; set; } = new HashSet<Picklist>();
    }
}
