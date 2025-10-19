using PfeProject.Domain.Entities;

public class MovementTrace
{
    public int Id { get; set; } // Id_mouvement_trace

    public string UsNom { get; set; } // Nom_US
    public DateTime DateMouvement { get; set; }
    public string Quantite { get; set; } // Qte_mouvement

    // 🔗 User ayant généré le mouvement
    public int UserId { get; set; }
    public User User { get; set; }

    // 🔗 Ligne de picklist concernée
    public int DetailPicklistId { get; set; }
    public DetailPicklist DetailPicklist { get; set; }
    public bool IsActive { get; set; } = true;

}
