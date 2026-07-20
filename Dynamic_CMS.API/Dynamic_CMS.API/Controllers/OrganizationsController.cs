using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;
using FluentValidation;
using System.Collections.Generic;

namespace Dynamic_CMS.API.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _organizationService;
        private readonly IValidator<CreateOrganizationDto> _createValidator;
        private readonly IValidator<UpdateOrganizationDto> _updateValidator;

        public OrganizationsController(
            IOrganizationService organizationService,
            IValidator<CreateOrganizationDto> createValidator,
            IValidator<UpdateOrganizationDto> updateValidator)
        {
            _organizationService = organizationService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        private string? GetCurrentUserName()
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (!string.IsNullOrEmpty(role))
            {
                return role; // Will return "Admin" based on the JWT role claim
            }
            return "Admin"; // Fallback
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var organizations = await _organizationService.GetAllActiveAsync();
            return Ok(organizations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var organization = await _organizationService.GetByIdAsync(id);
            if (organization == null) return NotFound();

            return Ok(organization);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrganizationDto dto)
        {
            var validationResult = await _createValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ToDictionary());
            }

            try
            {
                var organization = await _organizationService.CreateAsync(dto, GetCurrentUserName());
                return CreatedAtAction(nameof(GetById), new { id = organization.Id }, organization);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrganizationDto dto)
        {
            var validationResult = await _updateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ToDictionary());
            }

            try
            {
                var organization = await _organizationService.UpdateAsync(id, dto, GetCurrentUserName());
                return Ok(organization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _organizationService.DeleteAsync(id, GetCurrentUserName());
                if (!result) return NotFound();

                return Ok(new { message = "Organization deleted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
