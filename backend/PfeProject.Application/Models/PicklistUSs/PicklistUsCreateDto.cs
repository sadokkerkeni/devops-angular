namespace PfeProject.Application.Models.PicklistUSs
{
    public class PicklistUsCreateDto
    {
        public string Nom { get; set; } = string.Empty;
        public string Quantite { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int DetailPicklistId { get; set; }
        public int StatusId { get; set; }
    }
}
