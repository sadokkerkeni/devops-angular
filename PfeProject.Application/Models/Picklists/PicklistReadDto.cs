public class PicklistReadDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public int LineId { get; set; }
    public int WarehouseId { get; set; }
    public StatusDto? Status { get; set; }
    public bool IsActive { get; set; } = true;
}


public class StatusDto
{
    public int Id { get; set; }
    public string Description { get; set; }
}
