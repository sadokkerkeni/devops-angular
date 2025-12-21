using Microsoft.AspNetCore.Http;

namespace PfeProject.Application.Models.Articles
{
    public class ArticleUpdateDto
    {
        public string CodeProduit { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public IFormFile? Photo { get; set; }
    }
}
