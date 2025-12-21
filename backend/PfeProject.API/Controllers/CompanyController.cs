using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Companies;
using PfeProject.Application.Models.Invitations;
using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _companyService;
        private readonly IAuthService _authService;

        public CompanyController(ICompanyService companyService, IAuthService authService)
        {
            _companyService = companyService;
            _authService = authService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCompanies()
        {
            var companies = await _companyService.GetAllCompaniesAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCompany(int id)
        {
            var company = await _companyService.GetCompanyByIdAsync(id);
            if (company == null)
                return NotFound(new { message = "Company not found ❌" });

            return Ok(company);
        }

        [HttpGet("by-code/{code}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCompanyByCode(string code)
        {
            var company = await _companyService.GetCompanyByCodeAsync(code);
            if (company == null)
                return NotFound(new { message = "Company not found ❌" });

            return Ok(company);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CompanyUpdateDto request)
        {
            if (!await _companyService.CompanyExistsAsync(id))
                return NotFound(new { message = "Company not found ❌" });

            await _companyService.UpdateCompanyAsync(id, request.Name, request.Description, request.Code);
            return Ok(new { message = "Company updated successfully ✅" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            if (!await _companyService.CompanyExistsAsync(id))
                return NotFound(new { message = "Company not found ❌" });

            await _companyService.DeleteCompanyAsync(id);
            return Ok(new { message = "Company deleted successfully ✅" });
        }

        [HttpPost("invite-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> InviteUser([FromBody] InviteUserRequest request)
        {
            var result = await _authService.InviteUserToCompanyAsync(request);
            
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message, email = result.Email, role = result.Role });
        }
    }
}
