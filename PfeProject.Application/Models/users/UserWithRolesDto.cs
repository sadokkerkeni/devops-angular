using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Models.Users
{
    public class UserWithRolesDto
    {
        public int Id { get; set; }
        public string Matricule { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; }

        // Changed from List<string> to List<RoleInfo>
        public List<RoleInfo> Roles { get; set; } = new();

        // Nested class to hold combined role information
        public class RoleInfo
        {
            public int Id { get; set; }
            public string Name { get; set; }
        }
    }
}