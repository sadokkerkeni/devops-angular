using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Models.users
{
    public class AssignUserRoleDto
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        
        public int AssignedById { get; set; } 
        public string Note { get; set; } = string.Empty; 
    }
}
