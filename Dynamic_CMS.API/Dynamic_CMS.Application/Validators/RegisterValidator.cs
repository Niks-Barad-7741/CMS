using System;
using FluentValidation;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Validators
{
    public class RegisterValidator : AbstractValidator<RegisterDto>
    {
        public RegisterValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Default 'string' value is not allowed.")
                .Must(x => x == null || x.Trim() == x)
                .WithMessage("This field cannot contain leading or trailing spaces.")
                .Length(2, 30).WithMessage("Name must be between 2 and 30 characters.")
                .Matches(@"^[A-Za-z]+(?: [A-Za-z]+)*$")
                .WithMessage("Name can contain only letters and single spaces.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Default 'string' value is not allowed.")
                .Must(x => x == null || x.Trim() == x)
                .WithMessage("This field cannot contain leading or trailing spaces.")
                .EmailAddress().WithMessage("Please enter a valid email address.")
                .Matches(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
                .WithMessage("Please enter a valid email address.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Default 'string' value is not allowed.")
                .Must(x => x == null || x.Trim() == x)
                .WithMessage("This field cannot contain leading or trailing spaces.")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")
                .WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }
    }
}
