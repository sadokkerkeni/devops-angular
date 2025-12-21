namespace PfeProject.Application.Models.Dashboard
{
    public class TimelineEventDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;  // "picklist", "stock", "return", "movement"
        public string Icon { get; set; } = string.Empty;
        public string IconColor { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
    }
}

