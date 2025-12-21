using PfeProject.Domain.Entities;

public class MovementTrace
{
    public int Id { get; set; } // Id_mouvement_trace

    public string UsNom { get; set; } // Nom_US
    public DateTime DateMouvement { get; set; }
    public int Quantite { get; set; } // Qte_mouvement (changed to int)

    // 🔗 User ayant généré le mouvement
    public int UserId { get; set; }
    public User User { get; set; }

    // 🔗 Ligne de picklist concernée
    public int DetailPicklistId { get; set; }
    public DetailPicklist DetailPicklist { get; set; }
    public bool IsActive { get; set; } = true;

    // 🏢 Company relationship
    public int CompanyId { get; set; }
    public virtual Company Company { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
}
