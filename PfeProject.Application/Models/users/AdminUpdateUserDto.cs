using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Models.users
{
    public class AdminUpdateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Matricule { get; set; }
        public string Email { get; set; }
        public bool State { get; set; }
    }
}