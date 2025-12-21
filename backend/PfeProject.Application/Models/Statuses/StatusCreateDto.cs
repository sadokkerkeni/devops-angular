namespace PfeProject.Application.Models.Statuses
{
    public class StatusCreateDto
    {
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = "Picklist"; // Valeur par défaut: "Picklist", "ReturnLine", "Inventory", "DetailPicklist"
    }
}
