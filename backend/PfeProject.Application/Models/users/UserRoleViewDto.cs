namespace PfeProject.Application.Models.Users
{
    public class UserRoleViewDto
    {
        public string UserFullName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public string AssignedBy { get; set; } = string.Empty;
        public DateTime AssignmentDate { get; set; }
        public bool IsActive { get; set; }
    }
}
