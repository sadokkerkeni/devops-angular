using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Article
    {
        public int Id { get; set; } // Id_article
        public string CodeProduit { get; set; }
        public string Designation { get; set; }
        public DateTime DateAjout { get; set; }
        public bool IsActive { get; set; } = true;

        // 🏢 Company relationship
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }

        // 🔁 Relations
        public ICollection<DetailPicklist> DetailPicklists { get; set; } = new HashSet<DetailPicklist>();
        public ICollection<ReturnLine> ReturnLines { get; set; } = new HashSet<ReturnLine>();
    }
}
