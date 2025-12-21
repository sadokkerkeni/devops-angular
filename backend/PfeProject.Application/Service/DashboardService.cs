using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Dashboard;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Application.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardKpisDto> GetKpisAsync(int companyId)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);

            // Stock Critique: Articles avec quantité < seuil minimum (via Sap)
            var stockCritiqueToday = await _context.DetailInventories
                .Where(di => di.Inventory.CompanyId == companyId && di.IsActive)
                .Where(di => di.Sap != null && di.Sap.Quantite < 50) // Seuil minimum exemple
                .Select(di => di.ArticleCode)
                .Distinct()
                .CountAsync();

            var stockCritiqueYesterday = await _context.DetailInventories
                .Where(di => di.Inventory.CompanyId == companyId && di.IsActive)
                .Where(di => di.Sap != null && di.Sap.Quantite < 50)
                .Select(di => di.ArticleCode)
                .Distinct()
                .CountAsync();

            var stockVariation = stockCritiqueYesterday > 0
                ? ((stockCritiqueToday - stockCritiqueYesterday) / (double)stockCritiqueYesterday) * 100
                : 0;

            // Picklists Actives: NonServie + Servie
            var picklistsActivesToday = await _context.Picklists
                .Where(p => p.CompanyId == companyId && p.IsActive)
                .Where(p => p.Status.Description == "NonServie" || p.Status.Description == "Servie")
                .CountAsync();

            var picklistsActivesYesterday = await _context.Picklists
                .Where(p => p.CompanyId == companyId && p.IsActive)
                .Where(p => p.CreatedAt.Date == yesterday)
                .Where(p => p.Status.Description == "NonServie" || p.Status.Description == "Servie")
                .CountAsync();

            var picklistsVariation = picklistsActivesYesterday > 0
                ? ((picklistsActivesToday - picklistsActivesYesterday) / (double)picklistsActivesYesterday) * 100
                : 0;

            // Retours en Cours
            var retoursEnCoursToday = await _context.ReturnLines
                .Where(r => r.CompanyId == companyId)
                .Where(r => r.Status.Description != "Terminé") // Statut non terminé
                .CountAsync();

            var retoursEnCoursYesterday = await _context.ReturnLines
                .Where(r => r.CompanyId == companyId)
                .Where(r => r.DateRetour.Date == yesterday)
                .Where(r => r.Status.Description != "Terminé")
                .CountAsync();

            var retoursVariation = retoursEnCoursYesterday > 0
                ? ((retoursEnCoursToday - retoursEnCoursYesterday) / (double)retoursEnCoursYesterday) * 100
                : retoursEnCoursToday;

            // Mouvements Journée
            var mouvementsToday = await _context.MovementTraces
                .Where(mt => mt.CompanyId == companyId)
                .Where(mt => mt.DateMouvement.Date == today)
                .CountAsync();

            var mouvementsYesterday = await _context.MovementTraces
                .Where(mt => mt.CompanyId == companyId)
                .Where(mt => mt.DateMouvement.Date == yesterday)
                .CountAsync();

            var mouvementsVariation = mouvementsYesterday > 0
                ? ((mouvementsToday - mouvementsYesterday) / (double)mouvementsYesterday) * 100
                : 0;

            return new DashboardKpisDto
            {
                StockCritique = new KpiCardDto
                {
                    Icon = "inventory_2",
                    Title = "Stock Critique",
                    Value = stockCritiqueToday,
                    Variation = Math.Round(stockVariation, 1),
                    VariationLabel = "vs hier",
                    Color = "warn"
                },
                PicklistsActives = new KpiCardDto
                {
                    Icon = "assignment",
                    Title = "Picklists Actives",
                    Value = picklistsActivesToday,
                    Variation = Math.Round(picklistsVariation, 1),
                    VariationLabel = "vs hier",
                    Color = "primary"
                },
                RetoursEnCours = new KpiCardDto
                {
                    Icon = "keyboard_return",
                    Title = "Retours en Cours",
                    Value = retoursEnCoursToday,
                    Variation = Math.Round(retoursVariation, 1),
                    VariationLabel = "nouveaux",
                    Color = "accent"
                },
                MouvementsJournee = new KpiCardDto
                {
                    Icon = "local_shipping",
                    Title = "Mouvements Journée",
                    Value = mouvementsToday,
                    Variation = Math.Round(mouvementsVariation, 1),
                    VariationLabel = "vs hier",
                    Color = "success"
                }
            };
        }

        public async Task<StockEvolutionDto> GetStockEvolutionAsync(int companyId, int days = 7)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days + 1);

            var labels = new List<string>();
            var data = new List<int>();

            for (int i = 0; i < days; i++)
            {
                var date = startDate.AddDays(i);
                labels.Add(date.ToString("ddd dd"));

                var totalStock = await _context.DetailInventories
                    .Where(di => di.Inventory.CompanyId == companyId && di.IsActive)
                    .Where(di => di.Inventory.DateInventaire.Date <= date)
                    .Where(di => di.Sap != null)
                    .SumAsync(di => di.Sap.Quantite);

                data.Add(totalStock);
            }

            return new StockEvolutionDto
            {
                Labels = labels,
                Datasets = new List<DatasetDto>
                {
                    new DatasetDto
                    {
                        Label = "Quantité totale",
                        Data = data,
                        BorderColor = "#667eea",
                        BackgroundColor = "rgba(102, 126, 234, 0.1)",
                        Fill = true,
                        Tension = 0.4
                    }
                }
            };
        }

        public async Task<ActivityDataDto> GetActivityDataAsync(int companyId, int days = 7)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days + 1);

            var labels = new List<string>();
            var createdData = new List<int>();
            var deliveredData = new List<int>();

            for (int i = 0; i < days; i++)
            {
                var date = startDate.AddDays(i);
                labels.Add(date.ToString("ddd"));

                var created = await _context.Picklists
                    .Where(p => p.CompanyId == companyId)
                    .Where(p => p.CreatedAt.Date == date)
                    .CountAsync();

                var delivered = await _context.Picklists
                    .Where(p => p.CompanyId == companyId)
                    .Where(p => p.ModifiedAt.HasValue && p.ModifiedAt.Value.Date == date)
                    .Where(p => p.Status.Description == "Receptionnée")
                    .CountAsync();

                createdData.Add(created);
                deliveredData.Add(delivered);
            }

            return new ActivityDataDto
            {
                Labels = labels,
                Datasets = new List<ActivityDatasetDto>
                {
                    new ActivityDatasetDto
                    {
                        Label = "Créées",
                        Data = createdData,
                        BackgroundColor = "#667eea"
                    },
                    new ActivityDatasetDto
                    {
                        Label = "Livrées",
                        Data = deliveredData,
                        BackgroundColor = "#4ade80"
                    }
                }
            };
        }

        public async Task<TopArticlesDto> GetTopArticlesAsync(int companyId, int limit = 10)
        {
            var topArticles = await _context.MovementTraces
                .Where(mt => mt.CompanyId == companyId)
                .Where(mt => mt.DateMouvement >= DateTime.UtcNow.AddDays(-30)) // Dernier mois
                .Where(mt => mt.DetailPicklist != null && mt.DetailPicklist.Article != null)
                .GroupBy(mt => new { 
                    Id = mt.DetailPicklist.Article.Id, 
                    Designation = mt.DetailPicklist.Article.Designation 
                })
                .Select(g => new
                {
                    ArticleId = g.Key.Id,
                    Designation = g.Key.Designation,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(limit)
                .ToListAsync();

            var colors = new List<string>
            {
                "#667eea", "#764ba2", "#f093fb", "#f5576c", "#fa709a",
                "#fee140", "#30cfd0", "#330867", "#4ade80", "#3b82f6"
            };

            var articleCount = topArticles.Count;
            return new TopArticlesDto
            {
                Labels = topArticles.Select(a => a.Designation ?? $"ART-{a.ArticleId}").ToList(),
                Datasets = new List<TopArticlesDatasetDto>
                {
                    new TopArticlesDatasetDto
                    {
                        Label = "Mouvements",
                        Data = topArticles.Select(a => a.Count).ToList(),
                        BackgroundColor = colors.Take(articleCount).ToList()
                    }
                }
            };
        }

        public async Task<List<AlertDto>> GetRecentAlertsAsync(int companyId, int hours = 24)
        {
            var since = DateTime.UtcNow.AddHours(-hours);
            var alerts = new List<AlertDto>();

            // Stock critique alerts
            var stockCritique = await _context.DetailInventories
                .Where(di => di.Inventory.CompanyId == companyId && di.IsActive)
                .Where(di => di.Sap != null && di.Sap.Quantite < 50)
                .OrderBy(di => di.Sap.Quantite)
                .Take(3)
                .Select(di => new { 
                    Designation = di.ArticleCode ?? "Article inconnu", 
                    Quantite = di.Sap.Quantite, 
                    UpdatedAt = di.Inventory.DateInventaire 
                })
                .ToListAsync();

            foreach (var item in stockCritique)
            {
                var timeAgo = GetTimeAgo(item.UpdatedAt);
                alerts.Add(new AlertDto
                {
                    Id = alerts.Count + 1,
                    Type = "warning",
                    Icon = "warning",
                    Title = "Stock critique",
                    Message = $"Article {item.Designation} en dessous du seuil ({item.Quantite} unités)",
                    Time = timeAgo
                });
            }

            // Picklists livrées récemment
            var recentDeliveries = await _context.Picklists
                .Where(p => p.CompanyId == companyId)
                .Where(p => p.ModifiedAt.HasValue && p.ModifiedAt.Value >= since)
                .Where(p => p.Status.Description == "Receptionnée")
                .OrderByDescending(p => p.ModifiedAt)
                .Take(2)
                .ToListAsync();

            foreach (var pkl in recentDeliveries)
            {
                var timeAgo = GetTimeAgo(pkl.ModifiedAt ?? pkl.CreatedAt);
                alerts.Add(new AlertDto
                {
                    Id = alerts.Count + 1,
                    Type = "success",
                    Icon = "check_circle",
                    Title = "Pickliste livrée",
                    Message = $"{pkl.Name} a été livrée avec succès",
                    Time = timeAgo
                });
            }

            return alerts.Take(5).ToList();
        }

        public async Task<List<TimelineEventDto>> GetTimelineEventsAsync(int companyId, int hours = 24)
        {
            var since = DateTime.UtcNow.AddHours(-hours);
            var events = new List<TimelineEventDto>();

            // Recent picklist updates
            var picklistEvents = await _context.Picklists
                .Where(p => p.CompanyId == companyId)
                .Where(p => p.ModifiedAt.HasValue && p.ModifiedAt.Value >= since)
                .OrderByDescending(p => p.ModifiedAt)
                .Take(3)
                .Select(p => new
                {
                    p.Name,
                    Description = p.Status.Description,
                    UpdatedAt = p.ModifiedAt,
                    User = "Système" // Picklist n'a pas de relation User directe
                })
                .ToListAsync();

            foreach (var evt in picklistEvents)
            {
                events.Add(new TimelineEventDto
                {
                    Id = events.Count + 1,
                    Type = "picklist",
                    Icon = "assignment",
                    IconColor = "#667eea",
                    Title = $"Pickliste {evt.Description}",
                    Description = $"{evt.Name} a changé de statut",
                    Time = evt.UpdatedAt?.ToString("HH:mm") ?? DateTime.UtcNow.ToString("HH:mm"),
                    User = evt.User
                });
            }

            // Recent movements
            var movements = await _context.MovementTraces
                .Where(mt => mt.CompanyId == companyId)
                .Where(mt => mt.DateMouvement >= since)
                .OrderByDescending(mt => mt.DateMouvement)
                .Take(3)
                .Select(mt => new
                {
                    Designation = mt.DetailPicklist != null && mt.DetailPicklist.Article != null 
                        ? mt.DetailPicklist.Article.Designation 
                        : "Article inconnu",
                    Type = "movement",
                    CreatedAt = mt.DateMouvement,
                    User = mt.User != null ? $"{mt.User.FirstName} {mt.User.LastName}".Trim() : "Système"
                })
                .ToListAsync();

            foreach (var mov in movements)
            {
                events.Add(new TimelineEventDto
                {
                    Id = events.Count + 1,
                    Type = "movement",
                    Icon = "local_shipping",
                    IconColor = "#8b5cf6",
                    Title = $"Mouvement {mov.Type}",
                    Description = $"Article {mov.Designation}",
                    Time = mov.CreatedAt.ToString("HH:mm"),
                    User = mov.User
                });
            }

            return events.OrderByDescending(e => e.Time).Take(6).ToList();
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;

            if (timeSpan.TotalMinutes < 60)
                return $"Il y a {(int)timeSpan.TotalMinutes} min";
            if (timeSpan.TotalHours < 24)
                return $"Il y a {(int)timeSpan.TotalHours}h";
            return $"Il y a {(int)timeSpan.TotalDays}j";
        }
    }
}

