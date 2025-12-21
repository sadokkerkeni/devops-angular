namespace PfeProject.Application.Models.Saps
{
    public class SapCreateDto
    {
        public string Article { get; set; } = string.Empty;
        public string UsCode { get; set; } = string.Empty;
        public int Quantite { get; set; }
    }
}
