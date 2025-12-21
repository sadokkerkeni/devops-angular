namespace PfeProject.Application.Models.Inventories
{
    public class InventoryReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int StatusId { get; set; } // Changed from string Status to int StatusId
        public string? StatusDescription { get; set; } // For display purposes
        public DateTime DateInventaire { get; set; }
        public bool IsActive { get; set; }
    }
}
