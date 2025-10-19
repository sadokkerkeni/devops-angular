namespace PfeProject.Application.Models.Users
{
    public class UserRoleViewDto
    {
        public string UserFullName { get; set; }
        public string RoleName { get; set; }
        public string Note { get; set; }
        public string AssignedBy { get; set; }
        public DateTime AssignmentDate { get; set; }
        public bool IsActive { get; set; }
    }
}
