using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.DetailPicklists;
using PfeProject.Application.Models.Statuses;
using PfeProject.Application.Models.MovementTraces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System;

namespace PfeProject.Application.Services
{
    public class DetailPicklistService : IDetailPicklistService
    {
        private readonly IDetailPicklistRepository _repository;
        private readonly IMovementTraceService _movementTraceService;
        private readonly IUserRepository _userRepository;
        private readonly ISapRepository _sapRepository;
        private readonly IArticleRepository _articleRepository;

        public DetailPicklistService(
            IDetailPicklistRepository repository,
            IMovementTraceService movementTraceService,
            IUserRepository userRepository,
            ISapRepository sapRepository,
            IArticleRepository articleRepository)
        {
            _repository = repository;
            _movementTraceService = movementTraceService;
            _userRepository = userRepository;
            _sapRepository = sapRepository;
            _articleRepository = articleRepository;
        }

        public async Task<IEnumerable<DetailPicklistReadDto>> GetAllAsync(bool? isActive = true)
        {
            var list = await _repository.GetAllAsync(isActive);
            return list.Select(d => new DetailPicklistReadDto
            {
                Id = d.Id,

                PicklistId = d.PicklistId,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation ?? string.Empty
                },

                Status = d.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description ?? string.Empty
                },
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive
            });
        }

        public async Task<DetailPicklistReadDto?> GetByIdAsync(int id)
        {
            var d = await _repository.GetByIdAsync(id);
            if (d == null) return null;

            return new DetailPicklistReadDto
            {
                Id = d.Id,

                PicklistId = d.PicklistId,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation ?? string.Empty
                },

                Status = d.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description ?? string.Empty
                },
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive
            };
        }

        public async Task<DetailPicklistReadDto> CreateAsync(DetailPicklistCreateDto dto)
        {
            var entity = new DetailPicklist
            {
                ArticleId = dto.ArticleId ?? 0,
                PicklistId = dto.PicklistId,
                StatusId = dto.StatusId,
                Emplacement = dto.Emplacement,
                Quantite = dto.Quantite,
                IsActive = true
            };

            await _repository.AddAsync(entity);

            return new DetailPicklistReadDto
            {
                Id = entity.Id,

                PicklistId = entity.PicklistId,
                Article = entity.Article == null ? null : new ArticleDto
                {
                    Id = entity.Article.Id,
                    Designation = entity.Article.Designation ?? string.Empty
                },

                Status = entity.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = entity.Status.Id,
                    Description = entity.Status.Description ?? string.Empty
                },
                Emplacement = entity.Emplacement,
                Quantite = entity.Quantite,
                IsActive = entity.IsActive
            };
        }

        public async Task<bool> UpdateAsync(int id, DetailPicklistUpdateDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.Emplacement = dto.Emplacement;
            entity.Quantite = dto.Quantite;
            entity.StatusId = dto.StatusId;

            await _repository.UpdateAsync(entity);
            return true;
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists) return false;

            if (isActive)
                return await _repository.ActivateAsync(id);
            else
                return await _repository.DeactivateAsync(id);
        }
        public async Task<IEnumerable<DetailPicklistReadDto>> GetByPicklistIdAsync(int picklistId)
        {
            var list = await _repository.GetByPicklistIdAsync(picklistId);

            return list.Select(d => new DetailPicklistReadDto
            {
                Id = d.Id,
                PicklistId = d.PicklistId,
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive,

                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation ?? string.Empty,
                    CodeProduit = d.Article.CodeProduit ?? string.Empty
                },

                Status = d.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description ?? string.Empty
                }
            });
        }

        // Company-aware methods
        public async Task<IEnumerable<DetailPicklistReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var list = await _repository.GetAllByCompanyAsync(companyId, isActive);
            return list.Select(d => new DetailPicklistReadDto
            {
                Id = d.Id,
                PicklistId = d.PicklistId,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation ?? string.Empty
                },
                Status = d.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description ?? string.Empty
                },
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive
            });
        }

        public async Task<DetailPicklistReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var d = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (d == null) return null;

            return new DetailPicklistReadDto
            {
                Id = d.Id,
                PicklistId = d.PicklistId,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation ?? string.Empty
                },
                Status = d.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description ?? string.Empty
                },
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive
            };
        }

        public async Task<DetailPicklistReadDto> CreateForCompanyAsync(DetailPicklistCreateDto dto, int companyId)
        {
            int? articleId = dto.ArticleId;

            // ✅ NEW: If SapEntryId is provided, look up the SAP entry and find/create the Article
            if (dto.SapEntryId.HasValue && dto.SapEntryId.Value > 0)
            {
                var sapEntry = await _sapRepository.GetByIdAndCompanyAsync(dto.SapEntryId.Value, companyId);
                if (sapEntry != null)
                {
                    // Look for existing article with matching code
                    var existingArticle = await _articleRepository.GetByCodeAndCompanyAsync(sapEntry.Article, companyId);
                    
                    if (existingArticle != null)
                    {
                        articleId = existingArticle.Id;
                    }
                    else
                    {
                        // Create a new Article from SAP entry
                        var newArticle = new Article
                        {
                            CodeProduit = sapEntry.Article,
                            Designation = $"Article SAP: {sapEntry.Article} ({sapEntry.UsCode})",
                            IsActive = true,
                            CompanyId = companyId
                        };
                        await _articleRepository.AddAsync(newArticle);
                        articleId = newArticle.Id;
                        Console.WriteLine($"[DetailPicklistService] Created new Article ID {articleId} from SAP entry {sapEntry.Id}");
                    }
                }
                else
                {
                    throw new ArgumentException($"SAP entry with ID {dto.SapEntryId} not found for this company.");
                }
            }

            if (!articleId.HasValue || articleId.Value <= 0)
            {
                throw new ArgumentException("Either ArticleId or SapEntryId must be provided.");
            }

            var entity = new DetailPicklist
            {
                ArticleId = articleId.Value,
                PicklistId = dto.PicklistId,
                StatusId = dto.StatusId,
                Emplacement = dto.Emplacement,
                Quantite = dto.Quantite,
                IsActive = true,
                CompanyId = companyId // 🏢 Set Company relationship
            };

            await _repository.AddAsync(entity);

            return new DetailPicklistReadDto
            {
                Id = entity.Id,
                PicklistId = entity.PicklistId,
                Article = entity.Article == null ? null : new ArticleDto
                {
                    Id = entity.Article.Id,
                    Designation = entity.Article.Designation ?? string.Empty
                },
                Status = entity.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = entity.Status.Id,
                    Description = entity.Status.Description ?? string.Empty
                },
                Emplacement = entity.Emplacement,
                Quantite = entity.Quantite,
                IsActive = entity.IsActive
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, DetailPicklistUpdateDto dto, int companyId)
        {
            var entity = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (entity == null) return false;

            // Sauvegarder l'ancien statut pour détecter les changements
            var oldStatusId = entity.StatusId;
            var oldStatusDescription = entity.Status?.Description;

            entity.Emplacement = dto.Emplacement;
            entity.Quantite = dto.Quantite;
            entity.StatusId = dto.StatusId;

            await _repository.UpdateAsync(entity);

            // 🔄 AUTOMATISATION : Créer automatiquement un MovementTrace si le statut change vers "Scanné" ou "Validé"
            if (oldStatusId != dto.StatusId)
            {
                try
                {
                    // Recharger l'entité avec le nouveau statut
                    entity = await _repository.GetByIdAndCompanyAsync(id, companyId);
                    if (entity != null)
                    {
                        await CreateMovementTraceOnStatusChange(entity, oldStatusDescription, companyId);
                    }
                }
                catch (Exception ex)
                {
                    // Log l'erreur mais ne bloque pas la mise à jour
                    Console.WriteLine($"[DetailPicklistService] Erreur lors de la création automatique du MovementTrace: {ex.Message}");
                }
            }

            return true;
        }

        /// <summary>
        /// Crée automatiquement un MovementTrace quand le statut d'un DetailPicklist change vers "Scanné" ou "Validé"
        /// </summary>
        private async Task CreateMovementTraceOnStatusChange(DetailPicklist detailPicklist, string? oldStatusDescription, int companyId)
        {
            // Vérifier si le nouveau statut indique un scan ou validation
            var newStatusDescription = detailPicklist.Status?.Description?.ToLower() ?? "";
            var shouldCreateTrace = newStatusDescription.Contains("scanné") || 
                                   newStatusDescription.Contains("scanne") ||
                                   newStatusDescription.Contains("validé") ||
                                   newStatusDescription.Contains("valide") ||
                                   newStatusDescription.Contains("terminé") ||
                                   newStatusDescription.Contains("termine");

            if (!shouldCreateTrace)
            {
                return; // Ne pas créer de trace pour les autres changements de statut
            }

            // Vérifier qu'on ne crée pas de doublon (si le statut était déjà "Scanné" avant)
            if (oldStatusDescription != null)
            {
                var oldStatusLower = oldStatusDescription.ToLower();
                if (oldStatusLower.Contains("scanné") || oldStatusLower.Contains("scanne") ||
                    oldStatusLower.Contains("validé") || oldStatusLower.Contains("valide"))
                {
                    // Le statut était déjà dans un état qui aurait créé une trace, ne pas créer de doublon
                    return;
                }
            }

            // Récupérer le dernier utilisateur qui a scanné cette ligne (via PicklistUs)
            int userId = 0;
            if (detailPicklist.PicklistUs != null && detailPicklist.PicklistUs.Any())
            {
                var lastPicklistUs = detailPicklist.PicklistUs
                    .Where(pu => pu.IsActive)
                    .OrderByDescending(pu => pu.Date)
                    .FirstOrDefault();
                
                if (lastPicklistUs != null)
                {
                    userId = lastPicklistUs.UserId;
                }
            }

            // Si aucun PicklistUs trouvé, essayer de récupérer l'utilisateur depuis le contexte
            // Pour l'instant, on utilisera le premier utilisateur actif de l'entreprise comme fallback
            if (userId == 0)
            {
                var users = await _userRepository.GetAllByCompanyAsync(companyId);
                var activeUser = users.FirstOrDefault(u => u.State);
                if (activeUser != null)
                {
                    userId = activeUser.Id;
                }
                else
                {
                    Console.WriteLine($"[DetailPicklistService] Aucun utilisateur trouvé pour créer le MovementTrace pour DetailPicklist {detailPicklist.Id}");
                    return;
                }
            }

            // Déterminer le UsNom (code produit de l'article ou nom par défaut)
            var usNom = detailPicklist.Article?.CodeProduit ?? $"DP-{detailPicklist.Id}";

            var movementTraceDto = new MovementTraceCreateDto
            {
                UsNom = usNom,
                Quantite = detailPicklist.Quantite, // Now int, no need for ??
                UserId = userId,
                DetailPicklistId = detailPicklist.Id
            };

            await _movementTraceService.CreateForCompanyAsync(movementTraceDto, companyId);
            Console.WriteLine($"[DetailPicklistService] MovementTrace créé automatiquement pour DetailPicklist ID {detailPicklist.Id} (statut: {newStatusDescription})");
        }

        public async Task<IEnumerable<DetailPicklistReadDto>> GetByPicklistIdAndCompanyAsync(int picklistId, int companyId)
        {
            var list = await _repository.GetByPicklistIdAndCompanyAsync(picklistId, companyId);

            return list.Select(d => new DetailPicklistReadDto
            {
                Id = d.Id,
                PicklistId = d.PicklistId,
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation ?? string.Empty,
                    CodeProduit = d.Article.CodeProduit ?? string.Empty
                },
                Status = d.Status == null ? null : new PfeProject.Application.Models.Statuses.StatusReadDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description ?? string.Empty
                }
            });
        }

        public async Task<bool> DeleteForCompanyAsync(int id, int companyId)
        {
            var exists = await _repository.ExistsByIdAndCompanyAsync(id, companyId);
            if (!exists)
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }
    }
}
