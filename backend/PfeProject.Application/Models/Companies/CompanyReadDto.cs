using System;

namespace PfeProject.Application.Models.Companies
{
    public class CompanyReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public DateTime UpdateDate { get; set; }
        public bool IsActive { get; set; }
        
        // Optional: Include counts for related entities
        public int UsersCount { get; set; }
        public int WarehousesCount { get; set; }
        public int ArticlesCount { get; set; }
        public int InventoriesCount { get; set; }
        public int PicklistsCount { get; set; }
        public int LinesCount { get; set; }
        public int StatusesCount { get; set; }
        public int SapsCount { get; set; }
    }
}
