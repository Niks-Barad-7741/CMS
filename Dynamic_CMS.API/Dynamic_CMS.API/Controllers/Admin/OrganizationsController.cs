using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;
using FluentValidation;
using System.Collections.Generic;

namespace Dynamic_CMS.API.Controllers.Admin
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
                if (validationResult.Errors.Any(e => e.ErrorMessage.Contains("slug is already in use")))
                {
                    return Conflict(validationResult.ToDictionary());
                }
                return BadRequest(validationResult.ToDictionary());
            }

            var organization = await _organizationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = organization.Id }, organization);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrganizationDto dto)
        {
            if (id != dto.Id) return BadRequest(new { message = "ID in URL and body must match." });

            var validationResult = await _updateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                if (validationResult.Errors.Any(e => e.ErrorMessage.Contains("slug is already in use")))
                {
                    return Conflict(validationResult.ToDictionary());
                }
                return BadRequest(validationResult.ToDictionary());
            }

            try
            {
                var organization = await _organizationService.UpdateAsync(dto);
                return Ok(organization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _organizationService.DeleteAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
