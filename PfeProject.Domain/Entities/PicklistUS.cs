using PfeProject.Domain.Entities;

public class PicklistUs
{
    public int Id { get; set; } // Id_US

    public string Nom { get; set; } // Nom_US
    public string Quantite { get; set; } // Quantite_US
    public DateTime Date { get; set; } // Date_US

    // 🔗 User
    public int UserId { get; set; }
    public User User { get; set; }

    // 🔗 Status
    public int StatusId { get; set; }
    public Status Status { get; set; }

    // 🔗 DetailPicklist
    public int DetailPicklistId { get; set; }
    public DetailPicklist DetailPicklist { get; set; }
    public bool IsActive { get; set; } = true;

}
