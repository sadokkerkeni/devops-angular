namespace PfeProject.Application.Models.Dashboard
{
    public class DashboardKpisDto
    {
        public KpiCardDto StockCritique { get; set; } = new();
        public KpiCardDto PicklistsActives { get; set; } = new();
        public KpiCardDto RetoursEnCours { get; set; } = new();
        public KpiCardDto MouvementsJournee { get; set; } = new();
    }

    public class KpiCardDto
    {
        public string Icon { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public object Value { get; set; } = 0;  // Can be int or string
        public double? Variation { get; set; }
        public string VariationLabel { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }
}

