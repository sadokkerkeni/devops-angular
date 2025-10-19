using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Role
    {
        public int Id { get; set; }                     // Primary key
        public string Name { get; set; }                // "Admin", "User", etc.
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime UpdateDate { get; set; } = DateTime.UtcNow;
        public bool State { get; set; } = true;         // Active/inactive

        // Navigation: Many-to-many via UserRole
        public virtual ICollection<UserRole> UserRoles { get; set; } = new HashSet<UserRole>();
    }
}
