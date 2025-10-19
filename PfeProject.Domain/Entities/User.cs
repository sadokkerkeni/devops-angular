using System;
using System.Collections.Generic;
using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }                     // Primary key
        public string FirstName { get; set; }   // 
        public string LastName { get; set; }
        public string Matricule { get; set; }           // Unique user ID
        public string Email { get; set; }               // Login email
        public string Password { get; set; }            // Hashed password
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime UpdateDate { get; set; } = DateTime.UtcNow;
        public bool State { get; set; } = true;         // Active/inactive

        // 🔐 Mot de passe oublié
        public string? ResetPasswordToken { get; set; }        // Token de réinitialisation
        public DateTime? ResetTokenExpiration { get; set; }   // Expiration du token

        // 🔐 Tentatives de login échouées
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LastFailedLogin { get; set; }

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }
        
        public virtual ICollection<UserRole> UserRoles { get; set; } = new HashSet<UserRole>();
        public ICollection<ReturnLine> ReturnLines { get; set; } = new HashSet<ReturnLine>();
        public ICollection<PicklistUs> PicklistUsList { get; set; } = new HashSet<PicklistUs>();
        public ICollection<MovementTrace> MovementTraces { get; set; } = new HashSet<MovementTrace>();
        public ICollection<DetailInventory> DetailInventories { get; set; } = new HashSet<DetailInventory>();

    }
}
