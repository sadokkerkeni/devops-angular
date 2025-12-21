using System.Collections.Generic;

namespace PfeProject.Application.Models.Dashboard
{
    public class ActivityDataDto
    {
        public List<string> Labels { get; set; } = new();
        public List<ActivityDatasetDto> Datasets { get; set; } = new();
    }

    public class ActivityDatasetDto
    {
        public string Label { get; set; } = string.Empty;
        public List<int> Data { get; set; } = new();
        public string BackgroundColor { get; set; } = string.Empty;
    }
}

