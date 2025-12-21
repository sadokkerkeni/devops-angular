namespace PfeProject.Application.Models.Inventories
{
    public class InventoryUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public int StatusId { get; set; } // Changed from string Status to int StatusId
    }
}
