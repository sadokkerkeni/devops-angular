using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Company
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Code { get; set; } // Unique company code
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime UpdateDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new HashSet<User>();
        public virtual ICollection<Warehouse> Warehouses { get; set; } = new HashSet<Warehouse>();
        public virtual ICollection<Article> Articles { get; set; } = new HashSet<Article>();
        public virtual ICollection<Inventory> Inventories { get; set; } = new HashSet<Inventory>();
        public virtual ICollection<Picklist> Picklists { get; set; } = new HashSet<Picklist>();
        public virtual ICollection<Line> Lines { get; set; } = new HashSet<Line>();
        public virtual ICollection<Status> Statuses { get; set; } = new HashSet<Status>();
        public virtual ICollection<Sap> Saps { get; set; } = new HashSet<Sap>();
    }
}
