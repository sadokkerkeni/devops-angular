using PfeProject.Domain.Entities;

public class ReturnLine
{
    public int Id { get; set; } // Id_ligne_retour
    public DateTime DateRetour { get; set; }
    public string Quantite { get; set; }
    public string UsCode { get; set; }

    public int ArticleId { get; set; }
    public Article Article { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int StatusId { get; set; }
    public Status Status { get; set; }
}
