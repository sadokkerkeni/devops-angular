namespace PfeProject.Application.Models.PicklistUSs
{
    public class PicklistUsReadDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Quantite { get; set; } = string.Empty;
        public DateTime Date { get; set; }

        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;

        public int DetailPicklistId { get; set; }

        public int StatusId { get; set; }
        public string StatusLabel { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}
