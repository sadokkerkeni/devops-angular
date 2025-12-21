using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Models.users
{
    public class ProfileReadDto
    {      
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Matricule { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool State { get; set; }
        public List<string> Roles { get; set; } = new();
    } }

