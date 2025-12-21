using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.ReturnLines;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Application.Service
{
    public class ReturnLineService : IReturnLineService
    {
        private readonly IReturnLineRepository _repository;
        private readonly ISapService _sapService;

        public ReturnLineService(IReturnLineRepository repository, ISapService sapService)
        {
            _repository = repository;
            _sapService = sapService;
        }

        public async Task<ReturnLineReadDto> CreateAsync(ReturnLineCreateDto createDto)
        {
            var returnLine = new ReturnLine
            {
                UsCode = createDto.UsCode,
                Quantite = createDto.Quantite,
                UserId = createDto.UserId,
                ArticleId = createDto.ArticleId,
                StatusId = createDto.StatusId
            };

            var added = await _repository.CreateAsync(returnLine); // use CreateAsync

            return new ReturnLineReadDto
            {
                Id = added.Id,
                UsCode = added.UsCode,
                Quantite = added.Quantite,
                DateRetour = added.DateRetour,
                ArticleId = added.ArticleId,
                StatusId = added.StatusId,
                UserId = added.UserId
            };
        }

        public async Task<IEnumerable<ReturnLineReadDto>> GetAllAsync()
        {
            var results = await _repository.GetAllAsync();

            return results.Select(r => new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                ArticleCode = r.Article.CodeProduit,
                StatusId = r.StatusId,
                StatusName=r.Status.Description,
                UserId = r.UserId,
                UserName = r.User.FirstName + " " + r.User.LastName
            });
        }

        public async Task<ReturnLineReadDto?> GetByIdAsync(int id)
        {
            var r = await _repository.GetByIdAsync(id);
            if (r == null) return null;

            return new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                StatusId = r.StatusId,
                UserId = r.UserId
            };
        }

        public async Task<bool> UpdateAsync(int id, ReturnLineUpdateDto updateDto)
        {
            var returnLine = await _repository.GetByIdAsync(id);
            if (returnLine == null) return false;

            returnLine.UsCode = updateDto.UsCode;
            returnLine.Quantite = updateDto.Quantite;
            if (updateDto.ArticleId.HasValue)
                returnLine.ArticleId = updateDto.ArticleId.Value;
            if (updateDto.StatusId.HasValue)
                returnLine.StatusId = updateDto.StatusId.Value;

            return await _repository.UpdateAsync(returnLine);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        // Company-aware methods
        public async Task<ReturnLineReadDto> CreateForCompanyAsync(ReturnLineCreateDto createDto, int companyId)
        {
            Console.WriteLine($"[ReturnLineService] Création d'un ReturnLine pour CompanyId {companyId}: UsCode={createDto.UsCode}, Quantite={createDto.Quantite}, ArticleId={createDto.ArticleId}");
            
            var returnLine = new ReturnLine
            {
                UsCode = createDto.UsCode,
                Quantite = createDto.Quantite,
                UserId = createDto.UserId,
                ArticleId = createDto.ArticleId,
                StatusId = createDto.StatusId,
                CompanyId = companyId // 🏢 Set Company relationship
            };

            var added = await _repository.CreateAsync(returnLine);
            Console.WriteLine($"[ReturnLineService] ✅ ReturnLine créé avec succès, ID: {added.Id}");

            // 🔄 AUTOMATISATION : Mettre à jour le stock SAP automatiquement lors de la création d'un ReturnLine
            try
            {
                Console.WriteLine($"[ReturnLineService] Tentative de mise à jour du stock SAP pour UsCode '{createDto.UsCode}' avec quantité {createDto.Quantite} dans l'entreprise {companyId}.");
                var stockUpdated = await _sapService.AddStockForCompanyAsync(createDto.UsCode, createDto.Quantite, companyId);
                if (!stockUpdated)
                {
                    Console.WriteLine($"[ReturnLineService] ❌ Échec de la mise à jour du stock SAP pour UsCode '{createDto.UsCode}' dans l'entreprise {companyId}.");
                    // Note: On continue quand même car le ReturnLine a été créé
                }
                else
                {
                    Console.WriteLine($"[ReturnLineService] ✅ Stock SAP mis à jour avec succès pour UsCode '{createDto.UsCode}' dans l'entreprise {companyId}.");
                }
            }
            catch (Exception ex)
            {
                // Log l'erreur mais ne bloque pas la création du ReturnLine
                Console.WriteLine($"[ReturnLineService] ❌ Erreur lors de la mise à jour automatique du stock SAP: {ex.Message}");
                Console.WriteLine($"[ReturnLineService] StackTrace: {ex.StackTrace}");
            }

            return new ReturnLineReadDto
            {
                Id = added.Id,
                UsCode = added.UsCode,
                Quantite = added.Quantite,
                DateRetour = added.DateRetour,
                ArticleId = added.ArticleId,
                StatusId = added.StatusId,
                UserId = added.UserId
            };
        }

        public async Task<IEnumerable<ReturnLineReadDto>> GetAllByCompanyAsync(int companyId)
        {
            var results = await _repository.GetAllByCompanyAsync(companyId);

            return results.Select(r => new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                ArticleCode = r.Article.CodeProduit,
                StatusId = r.StatusId,
                StatusName = r.Status.Description,
                UserId = r.UserId,
                UserName = r.User.FirstName + " " + r.User.LastName
            });
        }

        // 🔄 Get only returns in progress (excluding completed returns)
        // Matches dashboard KPI logic: WHERE Status.Description != 'Terminé'
        public async Task<IEnumerable<ReturnLineReadDto>> GetInProgressByCompanyAsync(int companyId)
        {
            var results = await _repository.GetAllByCompanyAsync(companyId);

            // Filter out completed returns (same logic as dashboard)
            var inProgress = results.Where(r => r.Status != null && r.Status.Description != "Terminé");

            return inProgress.Select(r => new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                ArticleCode = r.Article?.CodeProduit,
                StatusId = r.StatusId,
                StatusName = r.Status?.Description,
                UserId = r.UserId,
                UserName = r.User != null ? r.User.FirstName + " " + r.User.LastName : null
            });
        }

        public async Task<ReturnLineReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var r = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (r == null) return null;

            return new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                StatusId = r.StatusId,
                UserId = r.UserId
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, ReturnLineUpdateDto updateDto, int companyId)
        {
            var returnLine = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (returnLine == null) return false;

            returnLine.UsCode = updateDto.UsCode;
            returnLine.Quantite = updateDto.Quantite;
            if (updateDto.ArticleId.HasValue)
                returnLine.ArticleId = updateDto.ArticleId.Value;
            if (updateDto.StatusId.HasValue)
                returnLine.StatusId = updateDto.StatusId.Value;

            return await _repository.UpdateAsync(returnLine);
        }
    }
}
