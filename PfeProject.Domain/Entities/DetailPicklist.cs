using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class DetailPicklist
    {
        public int Id { get; set; } // Id_detail_pickliste

        public string Emplacement { get; set; } // Champ texte libre
        public string Quantite { get; set; }

        // 🔗 Article
        public int ArticleId { get; set; }
        public Article Article { get; set; }

        // 🔗 Picklist
        public int PicklistId { get; set; }
        public Picklist Picklist { get; set; }

        // 🔗 Status
        public int StatusId { get; set; }
        public Status Status { get; set; }

        // 🔗 US affectées à cette ligne
        public ICollection<PicklistUs> PicklistUs { get; set; } = new HashSet<PicklistUs>();
        public bool IsActive { get; set; } = true;
    }
}