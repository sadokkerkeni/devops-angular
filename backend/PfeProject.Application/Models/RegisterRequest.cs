using System.ComponentModel.DataAnnotations;

namespace PfeProject.Application.Models
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "The FirstName field is required.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "The LastName field is required.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "The Email field is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "The Matricule field is required.")]
        public string Matricule { get; set; } = string.Empty;

        [Required(ErrorMessage = "The Password field is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; } = string.Empty;
        // CompanyId will be automatically assigned during registration
    }
}