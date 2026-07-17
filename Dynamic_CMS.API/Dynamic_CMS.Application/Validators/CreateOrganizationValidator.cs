using FluentValidation;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Domain.Repositories;
using System.Linq;

namespace Dynamic_CMS.Application.Validators
{
    public class CreateOrganizationValidator : AbstractValidator<CreateOrganizationDto>
    {
        private readonly IOrganizationRepository _repository;
        private readonly string[] _reservedSlugs = { "admin", "www", "api", "app" };

        public CreateOrganizationValidator(IOrganizationRepository repository)
        {
            _repository = repository;

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug is required.")
                .MaximumLength(100).WithMessage("Slug must not exceed 100 characters.")
                .Matches("^[a-z0-9-]+$").WithMessage("Slug must be lowercase and URL-safe (only letters, numbers, and hyphens).")
                .Must(slug => !_reservedSlugs.Contains(slug)).WithMessage("This slug is reserved and cannot be used.")
                .MustAsync(async (slug, cancellation) => 
                {
                    var existing = await _repository.GetBySlugAsync(slug);
                    return existing == null;
                }).WithMessage("This slug is already in use.");
        }
    }
}
