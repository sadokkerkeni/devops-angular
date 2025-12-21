namespace PfeProject.Application.Models.Warehouses
{
    public class WarehouseCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FixedPhone { get; set; }
        
        // 📍 Coordonnées GPS pour OpenStreetMap
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
