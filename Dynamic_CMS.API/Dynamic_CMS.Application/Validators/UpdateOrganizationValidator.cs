using FluentValidation;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Domain.Repositories;
using System.Linq;

namespace Dynamic_CMS.Application.Validators
{
    public class UpdateOrganizationValidator : AbstractValidator<UpdateOrganizationDto>
    {
        private readonly string[] _reservedSlugs = { "admin", "www", "api", "app" };

        public UpdateOrganizationValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

            RuleFor(x => x.Slug)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Slug is required.")
                .MaximumLength(100).WithMessage("Slug must not exceed 100 characters.")
                .Matches(@"^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*$").WithMessage("Slug must start with an alphanumeric character and be a valid format.")
                .Must(slug => !_reservedSlugs.Contains(slug)).WithMessage("This slug is reserved and cannot be used.");
        }
    }
}
