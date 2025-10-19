namespace PfeProject.Application.Models.Articles
{
    public class ArticleReadDto
    {
        public int Id { get; set; }
        public string CodeProduit { get; set; }
        public string Designation { get; set; }
        public DateTime DateAjout { get; set; }
        public bool IsActive { get; set; }
    }
}
