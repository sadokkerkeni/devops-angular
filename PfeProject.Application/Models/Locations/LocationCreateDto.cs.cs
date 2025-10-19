namespace PfeProject.Application.Models.Locations
{
    public class LocationCreateDto
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public int WarehouseId { get; set; }
    }
}
