namespace PfeProject.Application.Models.Lines
{
    public class LineReadDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
