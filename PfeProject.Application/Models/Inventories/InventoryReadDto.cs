namespace PfeProject.Application.Models.Inventories
{
    public class InventoryReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public DateTime DateInventaire { get; set; }
        public bool IsActive { get; set; }
    }
}
