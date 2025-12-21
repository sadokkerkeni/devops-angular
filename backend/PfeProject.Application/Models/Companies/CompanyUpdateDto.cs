using System.ComponentModel.DataAnnotations;

namespace PfeProject.Application.Models.Companies
{
    public class CompanyUpdateDto
    {
        [Required(ErrorMessage = "Company name is required")]
        [StringLength(100, ErrorMessage = "Company name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(255, ErrorMessage = "Description cannot exceed 255 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Company code is required")]
        [StringLength(50, ErrorMessage = "Company code cannot exceed 50 characters")]
        public string Code { get; set; } = string.Empty;
    }
}
