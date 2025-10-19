namespace PfeProject.Application.Models
{
    public class RegisterRequest

    {
        public string FirstName { get; set; }   // 👈 Nouveau
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Matricule { get; set; }
        public string Password { get; set; }

    }
}