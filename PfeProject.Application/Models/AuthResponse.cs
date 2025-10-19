using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Models
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Message { get; set; }
        public bool Success { get; set; } = true;
    }
}