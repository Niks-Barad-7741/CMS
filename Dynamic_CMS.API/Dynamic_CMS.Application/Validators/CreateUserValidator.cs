using FluentValidation;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Validators
{
    public class CreateUserValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email is required.")
                .MaximumLength(150).WithMessage("Email must not exceed 150 characters.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"\d").WithMessage("Password must contain at least one number.")
                .Matches(@"[!@#$%^&*(),.?':{}|<>]").WithMessage("Password must contain at least one special character.")
                .Must(x => !string.Equals(x, "string", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Default 'string' value is not allowed.")
                .Must(x => x == null || x.Trim() == x)
                .WithMessage("Password cannot contain leading or trailing spaces.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required.")
                .Must(role => role == "Admin" || role == "Client").WithMessage("Role must be 'Admin' or 'Client'.");
        }
    }
}
