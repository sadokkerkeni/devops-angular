using System.Collections.Generic;

namespace PfeProject.Application.Models.Picklists
{
    public class PicklistUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Quantity { get; set; } // Changed to int
        public int LineId { get; set; }
        public int WarehouseId { get; set; }
        public int StatusId { get; set; }
    }
}
