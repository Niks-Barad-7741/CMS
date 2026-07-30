using FluentValidation;
using Dynamic_CMS.Application.DTOs.SubMenu;
using System;

namespace Dynamic_CMS.Application.Validators
{
    public class CreateSubMenuItemDtoValidator : AbstractValidator<CreateSubMenuItemDto>
    {
        public CreateSubMenuItemDtoValidator()
        {
            RuleFor(x => x.MenuItemId)
                .NotEmpty().WithMessage("Parent Menu ID is required.");

            RuleFor(x => x.Title)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Sub-menu title cannot be null")
                .NotEmpty().WithMessage("Sub-menu title is required")
                .MinimumLength(2).WithMessage("Sub-menu title must be at least 2 characters")
                .MaximumLength(50).WithMessage("Sub-menu title cannot exceed 50 characters")
                .Matches(@"^[a-zA-Z0-9\s\-]+$")
                .WithMessage("Sub-menu title must start with a letter/number and can contain alphanumeric characters, spaces, and hyphens.")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Sub-menu title cannot be the default word 'string'.");

            RuleFor(x => x.Page)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Sub-menu page cannot be null")
                .NotEmpty().WithMessage("Sub-menu page is required")
                .MinimumLength(2).WithMessage("Sub-menu page must be at least 2 characters")
                .MaximumLength(100).WithMessage("Sub-menu page cannot exceed 100 characters")
                .Matches(@"^[a-z\-]+$")
                .WithMessage("Sub-menu page can only contain lowercase letters and hyphens (no numbers, spaces, or slashes)")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Sub-menu page cannot be the default word 'string'.");
        }
    }

    public class UpdateSubMenuItemDtoValidator : AbstractValidator<UpdateSubMenuItemDto>
    {
        public UpdateSubMenuItemDtoValidator()
        {
            RuleFor(x => x.Title)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Sub-menu title cannot be null")
                .NotEmpty().WithMessage("Sub-menu title is required")
                .MinimumLength(2).WithMessage("Sub-menu title must be at least 2 characters")
                .MaximumLength(50).WithMessage("Sub-menu title cannot exceed 50 characters")
                .Matches(@"^[a-zA-Z0-9\s\-]+$")
                .WithMessage("Sub-menu title must start with a letter/number and can contain alphanumeric characters, spaces, and hyphens.")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Sub-menu title cannot be the default word 'string'.");

            RuleFor(x => x.Page)
                .Must(x => x == null || x.Trim() == x).WithMessage("This field cannot contain leading or trailing spaces.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase)).WithMessage("Default 'string' value is not allowed.")
                .NotNull().WithMessage("Sub-menu page cannot be null")
                .NotEmpty().WithMessage("Sub-menu page is required")
                .MinimumLength(2).WithMessage("Sub-menu page must be at least 2 characters")
                .MaximumLength(100).WithMessage("Sub-menu page cannot exceed 100 characters")
                .Matches(@"^[a-z\-]+$")
                .WithMessage("Sub-menu page can only contain lowercase letters and hyphens (no numbers, spaces, or slashes)")
                .NotEqual("string", StringComparer.OrdinalIgnoreCase)
                .WithMessage("Sub-menu page cannot be the default word 'string'.");
        }
    }
}
