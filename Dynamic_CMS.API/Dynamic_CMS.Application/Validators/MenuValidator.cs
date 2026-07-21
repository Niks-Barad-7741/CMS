using FluentValidation;
using Dynamic_CMS.Application.DTOs.Menu;
using System;

namespace Dynamic_CMS.Application.Validators
{
    public class CreateMenuItemDtoValidator : AbstractValidator<CreateMenuItemDto>
    {
        public CreateMenuItemDtoValidator()
        {
            RuleFor(x => x.Title)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Menu title cannot be null")
                .NotEmpty().WithMessage("Menu title is required")
                .MinimumLength(2).WithMessage("Menu title must be at least 2 characters")
                .MaximumLength(50).WithMessage("Menu title cannot exceed 50 characters")
                .Matches(@"^[a-zA-Z0-9\s\-]+$")
                .WithMessage("Menu title must start with a letter/number and can contain alphanumeric characters, spaces, and hyphens.")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Menu title cannot be the default word 'string'.");

            RuleFor(x => x.Page)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Menu page cannot be null")
                .NotEmpty().WithMessage("Menu page is required")
                .MinimumLength(2).WithMessage("Menu page must be at least 2 characters")
                .MaximumLength(100).WithMessage("Menu page cannot exceed 100 characters")
                .Matches(@"^[a-z\-]+$")
                .WithMessage("Menu page can only contain lowercase letters and hyphens (no numbers, spaces, or slashes)")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Menu page cannot be the default word 'string'.");
        }
    }

    public class UpdateMenuItemDtoValidator : AbstractValidator<UpdateMenuItemDto>
    {
        public UpdateMenuItemDtoValidator()
        {
            RuleFor(x => x.Title)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Menu title cannot be null")
                .NotEmpty().WithMessage("Menu title is required")
                .MinimumLength(2).WithMessage("Menu title must be at least 2 characters")
                .MaximumLength(50).WithMessage("Menu title cannot exceed 50 characters")
                .Matches(@"^[a-zA-Z0-9\s\-]+$")
                .WithMessage("Menu title must start with a letter/number and can contain alphanumeric characters, spaces, and hyphens.")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Menu title cannot be the default word 'string'.");

            RuleFor(x => x.Page)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Menu page cannot be null")
                .NotEmpty().WithMessage("Menu page is required")
                .MinimumLength(2).WithMessage("Menu page must be at least 2 characters")
                .MaximumLength(100).WithMessage("Menu page cannot exceed 100 characters")
                .Matches(@"^[a-z\-]+$")
                .WithMessage("Menu page can only contain lowercase letters and hyphens (no numbers, spaces, or slashes)")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Menu page cannot be the default word 'string'.");
        }
    }
}
