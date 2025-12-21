using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Articles;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

namespace PfeProject.Application.Services
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _repo;
        private readonly IHostEnvironment _environment;
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

        public ArticleService(IArticleRepository repo, IHostEnvironment environment)
        {
            _repo = repo;
            _environment = environment;
        }

        public async Task<IEnumerable<ArticleReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var list = await _repo.GetAllByCompanyAsync(companyId, isActive);
            return list.Select(a => new ArticleReadDto
            {
                Id = a.Id,
                CodeProduit = a.CodeProduit,
                Designation = a.Designation,
                DateAjout = a.DateAjout,
                IsActive = a.IsActive,
                PhotoUrl = a.PhotoPath
            });
        }

        public async Task<ArticleReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var a = await _repo.GetByIdAndCompanyAsync(id, companyId);
            if (a == null) return null;
            return new ArticleReadDto
            {
                Id = a.Id,
                CodeProduit = a.CodeProduit,
                Designation = a.Designation,
                DateAjout = a.DateAjout,
                IsActive = a.IsActive,
                PhotoUrl = a.PhotoPath
            };
        }

        public async Task<ArticleReadDto> CreateForCompanyAsync(ArticleCreateDto dto, int companyId)
        {
            var article = new Article
            {
                CodeProduit = dto.CodeProduit,
                Designation = dto.Designation,
                IsActive = true,
                DateAjout = DateTime.UtcNow,
                CompanyId = companyId
            };

            // Handle photo upload
            if (dto.Photo != null)
            {
                article.PhotoPath = await SavePhotoAsync(dto.Photo);
            }

            await _repo.AddAsync(article);

            return new ArticleReadDto
            {
                Id = article.Id,
                CodeProduit = article.CodeProduit,
                Designation = article.Designation,
                DateAjout = article.DateAjout,
                IsActive = article.IsActive,
                PhotoUrl = article.PhotoPath
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, ArticleUpdateDto dto, int companyId)
        {
            var article = await _repo.GetByIdAndCompanyAsync(id, companyId);
            if (article == null) return false;

            article.CodeProduit = dto.CodeProduit;
            article.Designation = dto.Designation;

            // Handle photo upload
            if (dto.Photo != null)
            {
                // Delete old photo if exists
                if (!string.IsNullOrEmpty(article.PhotoPath))
                {
                    DeletePhoto(article.PhotoPath);
                }
                article.PhotoPath = await SavePhotoAsync(dto.Photo);
            }

            await _repo.UpdateAsync(article);
            return true;
        }

        public async Task<bool> SetActiveStatusForCompanyAsync(int id, bool isActive, int companyId)
        {
            return await _repo.SetActiveStatusForCompanyAsync(id, isActive, companyId);
        }

        private async Task<string> SavePhotoAsync(IFormFile photo)
        {
            // Validate file
            if (photo == null || photo.Length == 0)
                throw new ArgumentException("Invalid photo file");

            if (photo.Length > MaxFileSize)
                throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB");

            var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new ArgumentException($"File type not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}");

            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "articles");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var uniqueFileName = $"article-{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            // Return relative path
            return $"/uploads/articles/{uniqueFileName}";
        }

        private void DeletePhoto(string photoPath)
        {
            if (string.IsNullOrEmpty(photoPath)) return;

            try
            {
                var fullPath = Path.Combine(_environment.ContentRootPath, "wwwroot", photoPath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw - deletion failure shouldn't break the update
                Console.WriteLine($"Failed to delete photo {photoPath}: {ex.Message}");
            }
        }
    }
}
