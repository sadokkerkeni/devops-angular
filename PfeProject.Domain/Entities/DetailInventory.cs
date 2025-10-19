using PfeProject.Domain.Entities;

public class DetailInventory
{
    public int Id { get; set; } // Id_detail_inventaire

    public string UsCode { get; set; } // US
    public string ArticleCode { get; set; } // Article (peut être string ou FK selon ton modèle)

    // 🔗 Emplacement
    public int LocationId { get; set; }
    public Location Location { get; set; }

    // 🔗 Inventaire principal
    public int InventoryId { get; set; }
    public Inventory Inventory { get; set; }

    // 🔗 Utilisateur qui a scanné / validé
    public int UserId { get; set; }
    public User User { get; set; }

    // 🔗 Donnée SAP associée
    public int SapId { get; set; }
    public Sap Sap { get; set; }
    public bool IsActive { get; set; } = true;

}
