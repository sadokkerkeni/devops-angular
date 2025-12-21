using System.ComponentModel.DataAnnotations;

namespace PfeProject.Application.Models.Users
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "The FirstName field is required.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "The LastName field is required.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "The Matricule field is required.")]
        public string Matricule { get; set; } = string.Empty;

        [Required(ErrorMessage = "The Email field is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;
    }
}