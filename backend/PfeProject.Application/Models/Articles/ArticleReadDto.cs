namespace PfeProject.Application.Models.Articles
{
    public class ArticleReadDto
    {
        public int Id { get; set; }
        public string CodeProduit { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateTime DateAjout { get; set; }
        public bool IsActive { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
