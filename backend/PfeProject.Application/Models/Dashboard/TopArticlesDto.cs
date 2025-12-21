using System.Collections.Generic;

namespace PfeProject.Application.Models.Dashboard
{
    public class TopArticlesDto
    {
        public List<string> Labels { get; set; } = new();
        public List<TopArticlesDatasetDto> Datasets { get; set; } = new();
    }

    public class TopArticlesDatasetDto
    {
        public string Label { get; set; } = string.Empty;
        public List<int> Data { get; set; } = new();
        public List<string> BackgroundColor { get; set; } = new();
    }
}

