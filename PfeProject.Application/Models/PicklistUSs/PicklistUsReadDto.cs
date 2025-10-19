public class PicklistUsReadDto
{
    public int Id { get; set; }
    public string Nom { get; set; }
    public string Quantite { get; set; }
    public DateTime Date { get; set; }

    public int UserId { get; set; }
    public string UserFullName { get; set; }

    public int DetailPicklistId { get; set; }

    public int StatusId { get; set; }
    public string StatusLabel { get; set; }

    public bool IsActive { get; set; }
}
