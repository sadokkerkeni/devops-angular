using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
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

        public CompanyController(ICompanyService companyService)
        {
            _companyService = companyService;
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyRequest request)
        {
            if (await _companyService.CompanyCodeExistsAsync(request.Code))
                return BadRequest(new { message = "Company code already exists ❌" });

            var company = await _companyService.CreateCompanyAsync(request.Name, request.Description, request.Code);
            return CreatedAtAction(nameof(GetCompany), new { id = company.Id }, company);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] UpdateCompanyRequest request)
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
    }

    public class CreateCompanyRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
    }

    public class UpdateCompanyRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
    }
}
