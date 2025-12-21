using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class DetailPicklist
    {
        public int Id { get; set; } // Id_detail_pickliste

        public string Emplacement { get; set; } // Champ texte libre
        public int Quantite { get; set; } // Changed to int

        // 🔗 Article
        public int ArticleId { get; set; }
        public Article Article { get; set; }

        // 🔗 Picklist
        public int PicklistId { get; set; }
        public Picklist Picklist { get; set; }

        // 🔗 Status
        public int StatusId { get; set; }
        public Status Status { get; set; }

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // 🔗 US affectées à cette ligne
        public ICollection<PicklistUs> PicklistUs { get; set; } = new HashSet<PicklistUs>();
        public bool IsActive { get; set; } = true;

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public int? ModifiedBy { get; set; }
    }
}