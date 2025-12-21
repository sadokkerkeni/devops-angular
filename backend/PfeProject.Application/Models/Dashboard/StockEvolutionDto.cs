using System.Collections.Generic;

namespace PfeProject.Application.Models.Dashboard
{
    public class StockEvolutionDto
    {
        public List<string> Labels { get; set; } = new();
        public List<DatasetDto> Datasets { get; set; } = new();
    }

    public class DatasetDto
    {
        public string Label { get; set; } = string.Empty;
        public List<int> Data { get; set; } = new();
        public string BorderColor { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public bool Fill { get; set; }
        public double Tension { get; set; }
    }
}

