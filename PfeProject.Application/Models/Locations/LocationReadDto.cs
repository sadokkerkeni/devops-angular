namespace PfeProject.Application.Models.Locations
{
    public class LocationReadDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }

        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } // affichage sans aller rechercher dans Warehouse
        public bool IsActive { get; set; }
    }
}
