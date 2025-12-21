namespace PfeProject.Application.Models.PicklistUSs
{
    public class PicklistUsFilterDto
    {
        public int? StatusId { get; set; }
        public int? UserId { get; set; }
        public int? DetailPicklistId { get; set; }
        public bool? IsActive { get; set; }
        public string? Nom { get; set; }
    }
}
