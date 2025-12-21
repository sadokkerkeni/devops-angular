using PfeProject.Domain.Entities;

public class UserRole
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public DateTime AssignmentDate { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
    public int? AssignedById { get; set; }
    public string Note { get; set; }

    // 🏢 Company relationship
    public int CompanyId { get; set; }
    public virtual Company Company { get; set; }

    public virtual User User { get; set; }
    public virtual Role Role { get; set; }
    public virtual User AssignedBy { get; set; }
}
