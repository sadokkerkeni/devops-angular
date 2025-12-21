namespace PfeProject.Application.Models.Users
{
    public class AssignRolesRequest
    {
        public List<int> RoleIds { get; set; } = new();
        public int AssignedById { get; set; } // ID de l’admin connecté
        public string Note { get; set; } = string.Empty;
    }
}
