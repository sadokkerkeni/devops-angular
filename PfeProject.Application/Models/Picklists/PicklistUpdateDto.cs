using System.Collections.Generic;

namespace PfeProject.Application.Models.Picklists
{
    public class PicklistUpdateDto
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Quantity { get; set; }
        public int LineId { get; set; }
        public int WarehouseId { get; set; }
        public int StatusId { get; set; }
    }
}
