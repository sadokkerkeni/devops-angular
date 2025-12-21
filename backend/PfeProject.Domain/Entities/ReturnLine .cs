using PfeProject.Domain.Entities;

public class ReturnLine
{
    public int Id { get; set; } // Id_ligne_retour
    public DateTime DateRetour { get; set; } = DateTime.UtcNow;
    public int Quantite { get; set; } // Changed to int
    public string UsCode { get; set; }

    public int ArticleId { get; set; }
    public Article Article { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int StatusId { get; set; }
    public Status Status { get; set; }

    // 🔗 Link to original Picklist (optional)
    public int? PicklistId { get; set; }
    public Picklist? Picklist { get; set; }

    // 🏢 Company relationship
    public int CompanyId { get; set; }
    public virtual Company Company { get; set; }

    // Soft delete
    public bool IsActive { get; set; } = true;

    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
}
