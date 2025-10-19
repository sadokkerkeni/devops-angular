namespace PfeProject.Application.Models.Saps
{
    public class SapReadDto
    {
        public int Id { get; set; }
        public string Article { get; set; }
        public string UsCode { get; set; }
        public int Quantite { get; set; }
        public bool IsActive { get; set; }
    }
}
