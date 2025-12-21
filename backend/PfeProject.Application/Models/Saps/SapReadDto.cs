namespace PfeProject.Application.Models.Saps
{
    public class SapReadDto
    {
        public int Id { get; set; }
        public string Article { get; set; } = string.Empty;
        public string UsCode { get; set; } = string.Empty;
        public int Quantite { get; set; }
        public bool IsActive { get; set; }
    }
}
