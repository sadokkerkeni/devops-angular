namespace PfeProject.Application.Models.Stock
{
    public class UnitStockReadDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string AssignedBy { get; set; }
        public DateTime? AssignedDate { get; set; }
        public int? LocationId { get; set; }
        public string LocationCode { get; set; }
    }
}
